"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getEventRating,
  getEventReviews,
} from "@/lib/reviewService";
import { EventRatingType, ReviewType } from "@/types/review";
import StarRating from "@/components/StarRating";

interface ReviewListProps {
  eventId: string;
  refreshKey?: number;
}

export default function ReviewList({
  eventId,
  refreshKey = 0,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [rating, setRating] = useState<EventRatingType>({
    averageRating: 0,
    totalReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [reviewsData, ratingData] = await Promise.all([
        getEventReviews(eventId),
        getEventRating(eventId),
      ]);

      setReviews(reviewsData);
      setRating(ratingData);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to load reviews."
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <p className="py-6 text-center text-gray-500">
        Loading reviews...
      </p>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">
        Customer Reviews
      </h2>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {/* Overall event rating */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-4xl font-bold text-gray-900">
              {rating.averageRating.toFixed(1)}
              <span className="text-lg text-gray-500"> / 5</span>
            </p>

            <StarRating
              rating={Math.round(rating.averageRating)}
              readOnly
            />
          </div>

          <div>
            <p className="font-semibold text-gray-800">
              {rating.totalReviews}{" "}
              {rating.totalReviews === 1 ? "Review" : "Reviews"}
            </p>

            <p className="text-sm text-gray-500">
              Average event rating
            </p>
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      {reviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-600">
            No reviews yet. Be the first to review this event!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review._id}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {review.user?.firstName} {review.user?.lastName}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>

                <StarRating
                  rating={review.rating}
                  readOnly
                />
              </div>

              <p className="mt-4 leading-relaxed text-gray-700">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
