
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, max = 10, readOnly = false }: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= fullStars;
    const isHalf = i === fullStars + 1 && hasHalfStar;
    
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => !readOnly && onChange?.(i)}
        className={`text-yellow-500 hover:scale-110 transition-transform ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        disabled={readOnly}
      >
        <Star
          size={24}
          fill={isFilled || isHalf ? "currentColor" : "none"}
          className={isFilled ? "text-yellow-500" : "text-gray-300"}
        />
      </button>
    );
  }

  return (
    <div className="flex gap-1 items-center justify-center">{stars}</div>
  );
}
