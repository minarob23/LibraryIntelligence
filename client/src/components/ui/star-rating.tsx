
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, max = 10, readOnly = false }: StarRatingProps) {
  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex gap-1 items-center justify-center">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          className={`text-yellow-500 hover:scale-110 transition-transform ${
            readOnly ? 'cursor-default' : 'cursor-pointer'
          }`}
          disabled={readOnly}
        >
          <Star
            size={24}
            fill={rating <= value ? "currentColor" : "none"}
            className={rating <= value ? "text-yellow-500" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}
