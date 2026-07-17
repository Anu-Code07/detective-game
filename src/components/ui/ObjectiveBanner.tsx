import { Target } from "lucide-react";

export function ObjectiveBanner({ hint }: { hint: string }) {
  return (
    <div className="objective-banner">
      <Target className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 mb-0.5">Current objective</p>
        <p className="text-sm text-amber-100/90 leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}
