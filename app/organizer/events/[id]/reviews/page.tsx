"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Users,
  CalendarDays,
  Loader2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import { getOrganizerEventReviews } from "@/lib/reviewService";

interface ReviewUser {
  firstName?: string;
  lastName?: string;
}

interface ReviewType {
  _id: string;
  user: ReviewUser | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface OrganizerReviewsData {
  eventName: string;
  rating: {
    averageRating: number;
    totalReviews: number;
  };
  reviews: ReviewType[];
}

export default function OrganizerEventReviewsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [data, setData] = useState<OrganizerReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getOrganizerEventReviews(eventId);
        setData(result);
      } catch (err: unknown) {
        const message =
          typeof err === "object" && err !== null && "response" in err
            ? String(
                (
                  err as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message || "Failed to fetch reviews."
              )
            : "Unable to connect to the server.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchReviews();
    }
  }, [eventId]);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#3E000C]" />
          <p className="mt-4 font-medium text-[#3E000C]">
            Loading reviews...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-[#FFECD1] px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600" />

          <h2 className="mt-4 text-xl font-bold text-[#3E000C]">
            Unable to Load Reviews
          </h2>

          <p className="mt-2 text-sm text-stone-600">
            {error}
          </p>

          <Link
            href="/organizer/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#3E000C] transition hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                <MessageSquare className="h-6 w-6" />
              </span>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
                  Event Reviews
                </h1>

                <p className="mt-1 text-sm text-stone-600">
                  Customer feedback and ratings
                </p>
              </div>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#3E000C]">
              {data?.eventName || "Event"}
            </h2>

            <p className="mt-1 text-sm text-stone-600">
              See what customers think about your event.
            </p>
          </div>
        </div>

        {/* Rating Summary */}
        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          {/* Average Rating */}
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
                <Star className="h-5 w-5" />
              </span>

              <p className="text-sm font-medium text-stone-600">
                Average Rating
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold text-[#3E000C]">
                {(data?.rating?.averageRating ?? 0).toFixed(1)}
              </span>

              <div>
                <div className="flex text-xl text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < Math.round(data?.rating?.averageRating ?? 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-1 text-xs text-stone-500">
                  Out of 5 stars
                </p>
              </div>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
                <Users className="h-5 w-5" />
              </span>

              <p className="text-sm font-medium text-stone-600">
                Total Reviews
              </p>
            </div>

            <p className="mt-5 text-4xl font-bold text-[#3E000C]">
              {data?.rating?.totalReviews ?? 0}
            </p>

            <p className="mt-1 text-sm text-stone-500">
              Customer reviews received
            </p>
          </div>

        </section>

        {/* Customer Reviews */}
        <section className="rounded-xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:p-7">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#F5D8B3] pb-5">
            <div>
              <h2 className="text-xl font-bold text-[#3E000C]">
                Customer Reviews
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Feedback submitted by customers who attended your event.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-lg bg-[#FFECD1] px-3 py-2 text-sm font-semibold text-[#3E000C]">
              <ClipboardList className="h-4 w-4" />
              {data?.reviews?.length ?? 0} Reviews
            </span>
          </div>

          {/* Empty State */}
          {!data?.reviews?.length ? (
            <div className="py-12 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FFECD1] text-[#3E000C]">
                <MessageSquare className="h-8 w-8" />
              </span>

              <h3 className="mt-5 text-lg font-semibold text-[#3E000C]">
                No Reviews Yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
                Customers haven&apos;t submitted any reviews for this event yet.
                Their feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {data.reviews.map((review) => {
                const customerName = review.user
                  ? `${review.user.firstName || ""} ${
                      review.user.lastName || ""
                    }`.trim() || "Customer"
                  : "Customer";

                return (
                  <article
                    key={review._id}
                    className="rounded-xl border border-[#F5D8B3] bg-[#FFF9F1] p-5 transition hover:border-[#3E000C]/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">

                      {/* Customer Details */}
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#3E000C] text-lg font-bold text-[#FFECD1]">
                          {customerName.charAt(0).toUpperCase()}
                        </span>

                        <div>
                          <h3 className="font-semibold text-[#3E000C]">
                            {customerName}
                          </h3>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                            <CalendarDays className="h-3.5 w-3.5" />

                            {new Date(review.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Star Rating */}
                      <div className="flex items-center gap-1 rounded-lg bg-white px-3 py-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-300"
                              }`}
                            />
                          ))}
                        </div>

                        <span className="ml-1 text-sm font-bold text-[#3E000C]">
                          {review.rating}/5
                        </span>
                      </div>

                    </div>

                    {/* Review Comment */}
                    <div className="mt-5 border-t border-[#F5D8B3] pt-4">
                      <p className="text-sm leading-7 text-stone-700">
                        {review.comment}
                      </p>
                    </div>
                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}
