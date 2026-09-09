interface FitScoreBadgeProps {
  score: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLevel?: boolean;
}

export function FitScoreBadge({ score, className = "", size = "md", showLevel = false }: FitScoreBadgeProps) {
  let bgClass = "bg-[#708E7C]"; // Fit 3: muted green
  let levelText = "LOW";
  if (score >= 5) {
    bgClass = "bg-[#FFB347] text-[#133020]";
    levelText = "HIGH FIT";
  } else if (score === 4) {
    bgClass = "bg-[#FFC370] text-[#133020]";
    levelText = "MID FIT";
  } else {
    bgClass = "bg-[#708E7C] text-white";
    levelText = "LOW FIT";
  }

  if (size === "xl") {
    return (
      <div
        title={`Fit score: ${score}/5 (${levelText})`}
        className={`px-4 py-2 rounded-xl ${bgClass} font-manrope font-extrabold flex flex-col items-center justify-center shadow-md border border-black/10 shrink-0 select-none ${className}`}
      >
        <span className="text-3xl font-black leading-none">{score}.0</span>
        {showLevel && (
          <span className="text-[10px] tracking-wider uppercase font-bold mt-1 opacity-90">
            {levelText}
          </span>
        )}
      </div>
    );
  }

  const sizeStyle =
    size === "lg"
      ? "w-11 h-11 rounded-xl text-xl"
      : size === "sm"
      ? "w-7 h-7 rounded-md text-xs"
      : "w-9 h-9 rounded-lg text-base";

  return (
    <div
      title={`Fit score: ${score}/5`}
      className={`${sizeStyle} ${bgClass} font-manrope font-extrabold flex flex-col items-center justify-center shadow-sm border border-black/10 shrink-0 select-none ${className}`}
    >
      <span>{score}</span>
      {showLevel && (
        <span className="text-[8px] font-bold tracking-tighter leading-none uppercase">
          {levelText}
        </span>
      )}
    </div>
  );
}

