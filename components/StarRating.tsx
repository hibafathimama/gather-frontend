"use client";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={`text-2xl transition-colors ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
