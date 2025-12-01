import type { ChangeEvent, FormEvent } from "react";
import type { SourceMode } from "../types/insight";

type SourcePanelProps = {
  sourceMode: SourceMode;
  onModeChange: (mode: SourceMode) => void;
  sourceUrl: string;
  onSourceUrlChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  sourceCaption: string;
  statusMessage: string | null;
  error: string | null;
  loading: boolean;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
};

const SourcePanel = ({
  sourceMode,
  onModeChange,
  sourceUrl,
  onSourceUrlChange,
  notes,
  onNotesChange,
  onFileChange,
  sourceCaption,
  statusMessage,
  error,
  loading,
  onSubmit,
}: SourcePanelProps) => (
  <form
    onSubmit={onSubmit}
    className="grid gap-6 rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur"
  >
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-neutral-500">
        Режим источника
      </span>
      <div className="flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-xs font-medium uppercase tracking-wide">
        {(["pdf", "url", "text"] as SourceMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onModeChange(mode)}
            className={`rounded-full px-4 py-1 transition ${
              sourceMode === mode
                ? "bg-neutral-900 text-white"
                : "text-neutral-500"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {sourceMode === "pdf" && (
        <label className="text-xs uppercase tracking-wide text-neutral-500">
          PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 file:mr-4 file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wide file:text-white"
          />
        </label>
      )}
      {sourceMode === "url" && (
        <label className="text-xs uppercase tracking-wide text-neutral-500">
          Ссылка
          <input
            type="url"
            placeholder="https://..."
            value={sourceUrl}
            onChange={(event) => onSourceUrlChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900"
          />
        </label>
      )}
      {sourceMode === "text" && (
        <label className="text-xs uppercase tracking-wide text-neutral-500 md:col-span-2">
          Текст или заметки
          <textarea
            placeholder="Вставьте аннотацию, выделенный абзац или собственные заметки…"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={6}
            className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-900"
          />
        </label>
      )}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-xs text-neutral-500">
        <span className="font-medium text-neutral-900">Активный источник:</span>{" "}
        {sourceCaption}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-neutral-900 px-6 py-2 text-xs uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:opacity-40"
      >
        {loading ? "Создаём карточку…" : "Создать карточку"}
      </button>
    </div>
    {statusMessage && (
      <p className="text-xs text-neutral-500">{statusMessage}</p>
    )}
    {error && (
      <p className="text-xs text-red-500">
        {error} Проверьте источник и попробуйте снова.
      </p>
    )}
  </form>
);

export default SourcePanel;
