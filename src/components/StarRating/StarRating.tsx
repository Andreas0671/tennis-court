import { LuStar } from "react-icons/lu";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
}

export function StarRating({ value, onChange, interactive = false }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const active = star <= Number(value || 0);
        const icon = (
          <LuStar className={`h-4 w-4 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        );

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="transition hover:scale-110"
            aria-label={`${star} Sterne`}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
