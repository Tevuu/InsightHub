type ReasoningTraceProps = {
  details: string | null;
};

const ReasoningTrace = ({ details }: ReasoningTraceProps) => {
  if (!details) return null;
  return (
    <details className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm [&_summary]:list-none">
      <summary className="cursor-pointer text-xs uppercase tracking-wide text-neutral-500">
        reasoning trace
      </summary>
      <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap text-[10px] leading-relaxed text-neutral-700">
        {details}
      </pre>
    </details>
  );
};

export default ReasoningTrace;
