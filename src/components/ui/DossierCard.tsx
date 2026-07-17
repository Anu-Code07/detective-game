import type { ReactNode } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function DossierCard({
  name,
  subtitle,
  role,
  children,
  accent = "amber",
}: {
  name: string;
  subtitle: string;
  role: "suspect" | "witness";
  children: ReactNode;
  accent?: "amber" | "blue" | "red";
}) {
  const accents = {
    amber: "border-amber-500/20 from-amber-500/5",
    blue: "border-blue-500/20 from-blue-500/5",
    red: "border-red-500/15 from-red-500/5",
  };

  return (
    <article className={cn("dossier-card bg-gradient-to-br to-transparent", accents[accent])}>
      <div className="flex items-start gap-4 mb-4">
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border",
            role === "suspect" ? "bg-red-500/10 border-red-500/20" : "bg-blue-500/10 border-blue-500/20"
          )}
        >
          <User className={cn("w-7 h-7", role === "suspect" ? "text-red-400/80" : "text-blue-400/80")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{role}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 font-mono">DOSSIER</span>
          </div>
          <h3 className="text-lg font-semibold text-white leading-tight">{name}</h3>
          <p className="text-sm text-amber-200/80 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </article>
  );
}
