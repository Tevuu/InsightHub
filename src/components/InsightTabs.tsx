import type { Insight, TabKey } from "../types/insight";
import { TABS } from "../types/insight";

type InsightTabsProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  insight: Insight;
};

const InsightTabs = ({ activeTab, onTabChange, insight }: InsightTabsProps) => {
  const renderContent = () => {
    switch (activeTab) {
      case "view":
        return (
          <p className="text-sm leading-relaxed text-neutral-700">
            {insight.primaryView}
          </p>
        );
      case "summary":
        return (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-neutral-700">
              {insight.summary}
            </p>
            {insight.keyPhrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insight.keyPhrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs uppercase tracking-wide text-neutral-800"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      case "quotes":
        return (
          <div className="space-y-4">
            {insight.quotes.length === 0 && (
              <p className="text-sm text-neutral-500">
                Цитаты появятся после анализа.
              </p>
            )}
            {insight.quotes.map((quote, idx) => (
              <blockquote
                key={idx}
                className="border-l-2 border-neutral-900 pl-4 text-sm italic text-neutral-800"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        );
      case "related":
        return (
          <div className="space-y-4">
            {insight.related.length === 0 && (
              <p className="text-sm text-neutral-500">
                Пока нет связанных материалов.
              </p>
            )}
            {insight.related.map((item) => (
              <div
                key={`${item.title}-${item.type}`}
                className="rounded border border-neutral-200 px-3 py-2"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
                  <span>{item.type}</span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-900 underline-offset-2 hover:underline"
                    >
                      открыть
                    </a>
                  )}
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {item.title}
                </p>
                {item.note && (
                  <p className="text-xs text-neutral-600">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
      <nav className="flex gap-6 border-b border-neutral-200 pb-4 text-sm uppercase tracking-wide text-neutral-500">
        {Object.entries(TABS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onTabChange(key as TabKey)}
            className={`pb-2 ${
              activeTab === key
                ? "border-b border-neutral-900 text-neutral-900"
                : "text-neutral-400"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="pt-6">{renderContent()}</div>
    </div>
  );
};

export default InsightTabs;
