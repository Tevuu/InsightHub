import type { Insight } from "../types/insight";

type KnowledgePanelProps = {
  insight: Insight;
};

const KnowledgePanel = ({ insight }: KnowledgePanelProps) => (
  <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm">
    <div className="text-xs uppercase tracking-wide text-neutral-500">
      Карточка знания
    </div>
    <h2 className="mt-4 text-xl font-light text-neutral-900">
      {insight.knowledgeCard.title}
    </h2>
    <ul className="mt-4 space-y-2 text-sm text-neutral-700">
      {insight.knowledgeCard.bullets.map((bullet, idx) => (
        <li key={idx} className="leading-relaxed">
          {bullet}
        </li>
      ))}
    </ul>
    <p className="mt-6 text-xs uppercase tracking-wide text-neutral-500">
      {insight.knowledgeCard.sourceHint}
    </p>
  </div>
);

export default KnowledgePanel;
