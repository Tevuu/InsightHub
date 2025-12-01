type SettingsModalProps = {
  open: boolean;
  apiKeyDraft: string;
  notice: string | null;
  onChangeDraft: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

const SettingsModal = ({
  open,
  apiKeyDraft,
  notice,
  onChangeDraft,
  onClose,
  onSave,
}: SettingsModalProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/95 p-6 text-neutral-900 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-light tracking-tight">OpenRouter API</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm uppercase tracking-wide text-neutral-400 hover:text-neutral-900"
          >
            закрыть
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Ключ хранится в localStorage этого браузера и не покидает ваше
          устройство.
        </p>
        <label className="mt-4 block text-xs uppercase tracking-wide text-neutral-500">
          OpenRouter API Key
          <input
            type="password"
            autoFocus
            placeholder="sk-or-..."
            value={apiKeyDraft}
            onChange={(event) => onChangeDraft(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900"
          />
        </label>
        {notice && <p className="mt-3 text-xs text-red-500">{notice}</p>}
        <div className="mt-6 flex justify-end gap-3 text-xs uppercase tracking-wide">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-300 px-4 py-2 text-neutral-500 hover:text-neutral-900"
          >
            отмена
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full border border-neutral-900 px-4 py-2 text-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
