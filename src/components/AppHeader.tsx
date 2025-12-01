type AppHeaderProps = {
  hasLocalKey: boolean;
  onSettingsClick: () => void;
};

const AppHeader = ({ hasLocalKey, onSettingsClick }: AppHeaderProps) => (
  <header className="space-y-2">
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
        InsightHub / академический режим
      </p>
      <button
        type="button"
        onClick={onSettingsClick}
        className="flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-xs uppercase tracking-wide text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
        title="Настройки OpenRouter"
      >
        ⚙︎
        {hasLocalKey && (
          <span className="text-[10px] uppercase text-neutral-400">
            локальный ключ
          </span>
        )}
      </button>
    </div>
    <h1 className="text-4xl font-light tracking-tight text-neutral-900">
      Карточки знания для технических статей
    </h1>
    <p className="text-sm text-neutral-600 md:w-2/3">
      Загрузите PDF или ссылку — получите резюме, цитаты и вдохновляющую карту
      знаний. Минималистично, прозрачно, без лишних панелей.
    </p>
  </header>
);

export default AppHeader;
