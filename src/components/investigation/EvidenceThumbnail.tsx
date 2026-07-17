"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function EvidenceThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn("rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0", className)}>
        <span className="text-[8px] text-slate-600 font-mono text-center px-1">NO IMG</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("rounded-lg object-cover border border-white/10 flex-shrink-0 bg-black/20", className)}
    />
  );
}
