export type TabKey = "view" | "summary" | "quotes" | "related";
export type SourceMode = "pdf" | "url" | "text";

export type Insight = {
  summary: string;
  keyPhrases: string[];
  quotes: string[];
  related: Array<{ title: string; type: string; url?: string; note?: string }>;
  knowledgeCard: { title: string; bullets: string[]; sourceHint: string };
  primaryView: string;
};

export const EMPTY_INSIGHT: Insight = {
  summary:
    "Готовьтесь загрузить статью — и InsightHub соберёт краткий пересказ, ключевые тезисы и карточку знания.",
  keyPhrases: [],
  quotes: [],
  related: [],
  knowledgeCard: {
    title: "Карточка появится после анализа",
    bullets: ["—", "—", "—"],
    sourceHint: "Источник не выбран",
  },
  primaryView:
    "Добавьте PDF, ссылку или заметки. Мы покажем первый абзац и сохраним контекст исследования.",
};

export const TABS: Record<TabKey, string> = {
  view: "Просмотр",
  summary: "Резюме",
  quotes: "Цитаты",
  related: "Связанные материалы",
};

