import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import AppHeader from "./components/AppHeader";
import SourcePanel from "./components/SourcePanel";
import InsightTabs from "./components/InsightTabs";
import KnowledgePanel from "./components/KnowledgePanel";
import ReasoningTrace from "./components/ReasoningTrace";
import SettingsModal from "./components/SettingsModal";
import {
  MAX_CONTEXT_CHARS,
  MAX_OUTPUT_TOKENS,
  NOTES_CONTEXT_CHARS,
  middleOut,
  normalizeReasoningDetails,
  safeParseInsight,
} from "./lib/insight";
import { extractPdfInsights, type PdfInsights } from "./lib/pdf";
import {
  EMPTY_INSIGHT,
  type Insight,
  type SourceMode,
  type TabKey,
} from "./types/insight";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_ID = "openai/gpt-oss-20b:free";
const LOCAL_API_KEY = "insighthub_openrouter_key";

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("view");
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>("pdf");
  const [pdfInsights, setPdfInsights] = useState<PdfInsights | null>(null);
  const [insight, setInsight] = useState<Insight>(EMPTY_INSIGHT);
  const [reasoningDetails, setReasoningDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyOverride, setApiKeyOverride] = useState<string | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(LOCAL_API_KEY);
      if (stored) {
        setApiKeyOverride(stored);
        setApiKeyDraft(stored);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const sourceCaption = useMemo(() => {
    if (sourceMode === "pdf") {
      return fileName || "PDF не выбран";
    }
    if (sourceMode === "url") {
      if (!sourceUrl) return "Ссылка не задана";
      try {
        return new URL(sourceUrl).hostname;
      } catch {
        return sourceUrl;
      }
    }
    if (sourceMode === "text") {
      if (!notes.trim()) return "Текст не введён";
      const length = notes.trim().length;
      return `Текст • ${length} символов`;
    }
    return "Источник не выбран";
  }, [fileName, sourceUrl, notes, sourceMode]);

  const handleModeSwitch = (mode: SourceMode) => {
    if (mode === sourceMode) return;
    setSourceMode(mode);
    setError(null);
    setStatusMessage(null);
    if (mode === "pdf") {
      setSourceUrl("");
    } else if (mode === "url") {
      setPdfInsights(null);
      setFileName("");
    } else {
      setPdfInsights(null);
      setFileName("");
      setSourceUrl("");
    }
  };

  const handleOpenSettings = () => {
    setApiKeyDraft(apiKeyOverride ?? "");
    setSettingsNotice(null);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleSaveApiKey = () => {
    const value = apiKeyDraft.trim();
    try {
      setSettingsNotice(null);
      if (value) {
        window.localStorage.setItem(LOCAL_API_KEY, value);
        setApiKeyOverride(value);
        setStatusMessage("Ключ сохранён в браузере.");
      } else {
        window.localStorage.removeItem(LOCAL_API_KEY);
        setApiKeyOverride(null);
        setStatusMessage("Локальный ключ удалён.");
      }
      setShowSettings(false);
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      setSettingsNotice("Не удалось сохранить ключ.");
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName("");
      setPdfInsights(null);
      return;
    }

    setFileName(file.name);
    setStatusMessage("Извлекаем текст из PDF…");
    try {
      const extracted = await extractPdfInsights(file);
      setPdfInsights(extracted);
      setStatusMessage("PDF обработан.");
    } catch {
      setPdfInsights(null);
      setError("Не удалось распарсить PDF. Попробуйте другой файл.");
    }
  };

  const handleAnalyze = async (event?: FormEvent) => {
    event?.preventDefault();
    if (loading) return;

    const sourceReady =
      (sourceMode === "pdf" && Boolean(pdfInsights?.text)) ||
      (sourceMode === "url" && Boolean(sourceUrl.trim())) ||
      (sourceMode === "text" && Boolean(notes.trim()));

    if (!sourceReady) {
      setError("Добавьте хотя бы один источник: текст, ссылку или PDF.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStatusMessage("Включаем модель и собираем черновик…");

      const fallbackKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const apiKey = apiKeyOverride || fallbackKey;
      if (!apiKey) {
        throw new Error(
          "Не настроен OpenRouter API ключ. Добавьте его через значок ⚙︎."
        );
      }

      const contextBundle = {
        url: sourceMode === "url" ? sourceUrl || undefined : undefined,
        notes:
          sourceMode === "text" && notes
            ? middleOut(notes, NOTES_CONTEXT_CHARS)
            : undefined,
        pdf_info:
          sourceMode === "pdf" && pdfInsights
            ? {
                name: fileName,
                pages: pdfInsights.pageCount,
                bytes: pdfInsights.bytes,
              }
            : undefined,
        pdf_metadata: sourceMode === "pdf" ? pdfInsights?.metadata : undefined,
        pdf_outline: sourceMode === "pdf" ? pdfInsights?.outline : undefined,
        pdf_text:
          sourceMode === "pdf" && pdfInsights?.text
            ? middleOut(pdfInsights.text, MAX_CONTEXT_CHARS)
            : undefined,
      };

      const baseMessages = [
        {
          role: "system",
          content:
            "Ты — InsightHub, лаконичный научный редактор. Возьми источник и верни JSON формата {summary, key_phrases[], quotes[], related[{title,type,url,note}], knowledge_card:{title,bullets[],source_hint}, primary_view}. Максимум фактов, минимум воды.",
        },
        {
          role: "user",
          content: `Документ: ${JSON.stringify(contextBundle)}`,
        },
      ];

      const firstResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: baseMessages,
          reasoning: { enabled: true },
          max_output_tokens: MAX_OUTPUT_TOKENS,
        }),
      });

      if (!firstResponse.ok) {
        throw new Error("OpenRouter (reasoning) вернул ошибку.");
      }

      const firstJson = await firstResponse.json();
      const firstMessage = firstJson?.choices?.[0]?.message;

      if (!firstMessage) {
        throw new Error("Модель не вернула сообщение.");
      }

      setReasoningDetails(
        normalizeReasoningDetails(firstMessage.reasoning_details)
      );

      setStatusMessage("Уточняем вывод, подготавливаем карточку…");

      const followUpMessages = [
        ...baseMessages,
        {
          role: "assistant",
          content: firstMessage.content,
          reasoning_details: firstMessage.reasoning_details,
        },
        {
          role: "user",
          content:
            "Преобразуй предыдущий ответ в строгий JSON для InsightHub. Никакого текста вне JSON.",
        },
      ];

      const finalResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: followUpMessages,
          max_output_tokens: MAX_OUTPUT_TOKENS,
        }),
      });

      if (!finalResponse.ok) {
        throw new Error("OpenRouter (refine) вернул ошибку.");
      }

      const finalJson = await finalResponse.json();
      const finalMessage = finalJson?.choices?.[0]?.message;

      if (!finalMessage?.content) {
        throw new Error("Не удалось получить финальный ответ.");
      }

      const parsed = safeParseInsight(finalMessage.content);
      setInsight(parsed);
      setActiveTab("summary");
      setStatusMessage("Готово.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Сбой анализа.";
      setError(msg);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-neutral-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <AppHeader
          hasLocalKey={Boolean(apiKeyOverride)}
          onSettingsClick={handleOpenSettings}
        />

        <SourcePanel
          sourceMode={sourceMode}
          onModeChange={handleModeSwitch}
          sourceUrl={sourceUrl}
          onSourceUrlChange={setSourceUrl}
          notes={notes}
          onNotesChange={setNotes}
          onFileChange={handleFileChange}
          sourceCaption={sourceCaption}
          statusMessage={statusMessage}
          error={error}
          loading={loading}
          onSubmit={handleAnalyze}
        />

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <InsightTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            insight={insight}
          />

          <aside className="space-y-6">
            <KnowledgePanel insight={insight} />
            <ReasoningTrace details={reasoningDetails} />
          </aside>
        </section>
      </div>
      <SettingsModal
        open={showSettings}
        apiKeyDraft={apiKeyDraft}
        notice={settingsNotice}
        onChangeDraft={setApiKeyDraft}
        onClose={handleCloseSettings}
        onSave={handleSaveApiKey}
      />
    </div>
  );
}

export default App;
