import * as React from "react"
import { cn } from "@/lib/utils"

export interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  onRatingChange?: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ className, rating, onRatingChange, maxRating = 5, size = 'md', readonly = false, ...props }, ref) => {
    const [hoverRating, setHoverRating] = React.useState(0)

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    const handleClick = (value: number) => {
      if (!readonly && onRatingChange) {
        onRatingChange(value)
      }
    }

    const handleMouseEnter = (value: number) => {
      if (!readonly) {
        setHoverRating(value)
      }
    }

    const handleMouseLeave = () => {
      if (!readonly) {
        setHoverRating(0)
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const filled = starValue <= (hoverRating || rating)

          return (
            <button
              key={index}
              type="button"
              className={cn(
                "transition-colors focus:outline-none",
                sizeClasses[size],
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default"
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              <svg
                className={cn(
                  "w-full h-full transition-colors",
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600"
                )}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )
        })}
      </div>
    )
  }
)
StarRating.displayName = "StarRating"

export { StarRating }