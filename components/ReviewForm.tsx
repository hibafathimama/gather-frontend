"use client";

import { useState } from "react";
import StarRating from "@/components/StarRating";
import { addReview } from "@/lib/reviewService";

interface ReviewFormProps {
  eventId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  eventId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setLoading(true);

      const response = await addReview(
        eventId,
        rating,
        comment.trim()
      );

      setSuccess(response.message || "Review submitted successfully.");
      setRating(0);
      setComment("");

      onReviewSubmitted();
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to submit review."
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        Write a Review
      </h2>

      <label className="mb-2 block font-medium text-gray-800">
        Your Rating
      </label>

      <StarRating rating={rating} onChange={setRating} />

      <label
        htmlFor="review-comment"
        className="mb-2 mt-5 block font-medium text-gray-800"
      >
        Your Review
      </label>

      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience about this event..."
        rows={4}
        maxLength={1000}
        className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-amber-500"
      />

      <p className="mt-1 text-right text-sm text-gray-500">
        {comment.length}/1000
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-[#3E000C] px-5 py-3 font-semibold text-white hover:bg-[#590014] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
