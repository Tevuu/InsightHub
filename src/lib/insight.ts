import { EMPTY_INSIGHT, type Insight } from "../types/insight";

export const MAX_CONTEXT_CHARS = 40_000;
export const NOTES_CONTEXT_CHARS = 20_000;
export const MAX_OUTPUT_TOKENS = 2_048;

export const middleOut = (input: string, limit: number) => {
  if (input.length <= limit) return input;
  const head = Math.floor(limit * 0.6);
  const tail = limit - head;
  return `${input.slice(0, head)}\n…middle-out…\n${input.slice(-tail)}`;
};

const extractJsonCandidate = (payload: string): string | null => {
  if (!payload) return null;
  const trimmed = payload.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed || null;
};

const coerceInsightObject = (
  raw: string,
): Record<string, unknown> | null => {
  const candidate = extractJsonCandidate(raw);
  if (!candidate) return null;
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      return (parsed.find((item) => item && typeof item === "object") ??
        null) as Record<string, unknown> | null;
    }
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
};

const asString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item : null))
    .filter((item): item is string => Boolean(item));
};

const coalesceStringArrays = (...values: unknown[]): string[] => {
  for (const value of values) {
    const arr = asStringArray(value);
    if (arr.length > 0) return arr;
  }
  return [];
};

const asKnowledgeCard = (
  value: unknown,
): Insight["knowledgeCard"] => {
  const card = (value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}) as Record<string, unknown>;
  return {
    title: asString(
      card.title ??
        card.Title ??
        (card as { name?: string }).name ??
        card.heading,
      EMPTY_INSIGHT.knowledgeCard.title,
    ),
    bullets:
      "bullets" in card && Array.isArray(card.bullets)
        ? (card.bullets as string[])
        : EMPTY_INSIGHT.knowledgeCard.bullets,
    sourceHint: asString(
      card.source_hint ?? card.sourceHint,
      EMPTY_INSIGHT.knowledgeCard.sourceHint,
    ),
  };
};

const asRelatedArray = (value: unknown): Insight["related"] => {
  if (!Array.isArray(value)) return [];
  const items: Insight["related"] = [];
  value.forEach((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
    const ref = entry as Record<string, unknown>;
    const title = typeof ref.title === "string" ? ref.title : null;
    const type = typeof ref.type === "string" ? ref.type : null;
    if (!title || !type) return;
    const relatedItem: Insight["related"][number] = {
      title,
      type,
    };
    if (typeof ref.url === "string") {
      relatedItem.url = ref.url;
    }
    if (typeof ref.note === "string") {
      relatedItem.note = ref.note;
    }
    items.push(relatedItem);
  });
  return items;
};

export const safeParseInsight = (payload: string): Insight => {
  const parsed = coerceInsightObject(payload);
  if (!parsed) {
    throw new Error("Модель вернула невалидный JSON.");
  }

  try {
    return {
      summary: asString(parsed.summary, EMPTY_INSIGHT.summary),
      keyPhrases: coalesceStringArrays(
        parsed.key_phrases,
        parsed.keyPhrases,
      ),
      quotes: asStringArray(parsed.quotes),
      related: asRelatedArray(parsed.related),
      knowledgeCard: asKnowledgeCard(
        parsed.knowledge_card ?? parsed.knowledgeCard,
      ),
      primaryView: asString(
        parsed.primary_view ?? parsed.primaryView,
        EMPTY_INSIGHT.primaryView,
      ),
    };
  } catch {
    throw new Error("Не удалось привести ответ к Insight формату.");
  }
};

export const normalizeReasoningDetails = (
  details: unknown,
): string | null => {
  if (!details) return null;
  if (typeof details === "string") return details;
  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
};


