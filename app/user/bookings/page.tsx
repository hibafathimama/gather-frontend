"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventDetails {
  _id: string;
  eventName: string;
  date: string;
  time?: string;
  venue?: string;
  location?: string;
  image?: string;
  price?: number;
  ticketPrice?: number;
}

interface Booking {
  _id: string;
  bookingId?: string;
  qrCode?: string | null;
  ticketType: string;
  quantity: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  event?: EventDetails | null;
}

interface ApiResponse {
  message?: string;
  data?: Booking[];
  bookings?: Booking[];
}

const backendUrl = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const imageBaseUrl = backendUrl.replace(/\/api$/, "");

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price?: number) {
  if (typeof price !== "number" || !Number.isFinite(price)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function getImageUrl(image?: string) {
  if (!image) return null;

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${imageBaseUrl}/${image.replace(/^\/+/, "")}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${backendUrl}/bookings/getmybookings`,
          {
            method: "GET",
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Unexpected server response (${response.status}). Check your backend URL.`
          );
        }

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch your bookings."
          );
        }

        const bookingData = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.bookings)
            ? result.bookings
            : [];

        setBookings(bookingData);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching bookings."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] p-8 text-[#3E000C] font-semibold">
        <p className="text-center">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-8 sm:px-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-5xl">

        <header className="my-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#3E000C]">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              View your booked events and ticket details.
            </p>
          </div>

          <Link
            href="/events"
            className="rounded-xl bg-[#3E000C] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
          >
            Explore Events
          </Link>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <p className="font-bold">Unable to load bookings</p>
            <p className="mt-1 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-5xl">🎟️</div>

            <h2 className="text-xl font-bold text-[#3E000C]">
              No bookings yet
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              You haven&apos;t booked any events yet. Explore events and book
              your next experience!
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#3E000C] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
            >
              Browse Events
            </Link>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((booking) => {
              const imageUrl = getImageUrl(booking.event?.image);

              const isCancelled =
                booking.status?.toLowerCase() === "cancelled";

              return (
                <article
                  key={booking._id}
                  className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={booking.event?.eventName || "Event"}
                        className="h-44 w-full rounded-2xl object-cover sm:w-52 bg-stone-100"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-stone-100 text-4xl sm:w-52">
                        🎫
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col justify-between space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="text-xl font-bold tracking-tight text-[#3E000C]">
                          {booking.event?.eventName ||
                            "Event details unavailable"}
                        </h2>

                        <span
                          className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            isCancelled
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {booking.status || "Booked"}
                        </span>
                      </div>

                      <div className="grid gap-1.5 text-sm text-stone-600 sm:grid-cols-2">
                        <p className="break-all sm:col-span-2">
                          <strong className="font-semibold text-stone-900">
                            Booking Reference:
                          </strong>{" "}
                          {booking.bookingId || booking._id}
                        </p>

                        <p>
                          <strong className="font-semibold text-stone-900">Date:</strong>{" "}
                          {formatDate(booking.event?.date)}
                        </p>

                        {booking.event?.time && (
                          <p>
                            <strong className="font-semibold text-stone-900">Time:</strong>{" "}
                            {booking.event.time}
                          </p>
                        )}

                        {(booking.event?.venue ||
                          booking.event?.location) && (
                          <p className="sm:col-span-2">
                            <strong className="font-semibold text-stone-900">Venue:</strong>{" "}
                            {booking.event.venue ||
                              booking.event.location}
                          </p>
                        )}

                        <p>
                          <strong className="font-semibold text-stone-900">
                            Ticket Type:
                          </strong>{" "}
                          {booking.ticketType || "General"}
                        </p>

                        <p>
                          <strong className="font-semibold text-stone-900">Quantity:</strong>{" "}
                          {booking.quantity}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
                        <p className="text-lg font-black text-[#3E000C]">
                          {formatPrice(booking.totalPrice)}
                        </p>

                        <Link
                          href={`/user/bookings/${booking._id}`}
                          className="rounded-xl bg-[#3E000C] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
                        >
                          View Ticket
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/user/dashboard"
            className="text-sm font-semibold text-[#3E000C] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}