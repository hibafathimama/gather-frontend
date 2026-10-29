"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Compass,
  CalendarDays,
  Clock,
  MapPin,
  Hash,
  Users,
  QrCode,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  TicketX,
} from "lucide-react";

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

        const response = await fetch(`${backendUrl}/bookings/getmybookings`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            `Unexpected server response (${response.status}). Check your backend URL.`
          );
        }

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch your bookings.");
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] p-8 text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your bookings...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight text-[#3E000C]">
                Gather
              </p>
              <p className="text-xs text-stone-600">Event platform</p>
            </div>
          </Link>

          <Link
            href="/events"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#3E000C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2B0008]"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Explore events</span>
          </Link>
        </header>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
            My bookings
          </h1>
          <p className="mt-1 text-sm text-stone-600 sm:text-base">
            View your booked events and ticket details.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Unable to load bookings
            </p>
            <p className="mt-1 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <TicketX className="h-7 w-7" />
            </span>

            <h2 className="text-lg font-semibold text-[#3E000C]">
              No bookings yet
            </h2>

            <p className="mx-auto mt-1.5 max-w-sm text-sm text-stone-600">
              You haven&apos;t booked any events yet. Find an event you like and
              book your first ticket.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
            >
              <Compass className="h-4 w-4" />
              Browse events
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
                  className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={booking.event?.eventName || "Event"}
                        className="h-44 w-full rounded-lg bg-stone-100 object-cover sm:h-auto sm:w-52"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1] sm:h-auto sm:w-52">
                        <Ticket className="h-10 w-10 opacity-80" />
                      </div>
                    )}

                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[#3E000C] sm:text-xl">
                          {booking.event?.eventName ||
                            "Event details unavailable"}
                        </h2>

                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                            isCancelled
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {booking.status || "Booked"}
                        </span>
                      </div>

                      <ul className="grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
                        <li className="flex items-center gap-2 break-all sm:col-span-2">
                          <Hash className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          <span>
                            <span className="font-medium text-stone-900">
                              Reference:
                            </span>{" "}
                            {booking.bookingId || booking._id}
                          </span>
                        </li>

                        <li className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          {formatDate(booking.event?.date)}
                        </li>

                        {booking.event?.time && (
                          <li className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                            {booking.event.time}
                          </li>
                        )}

                        {(booking.event?.venue || booking.event?.location) && (
                          <li className="flex items-center gap-2 sm:col-span-2">
                            <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                            {booking.event.venue || booking.event.location}
                          </li>
                        )}

                        <li className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          {booking.ticketType || "General"} ticket
                        </li>

                        <li className="flex items-center gap-2">
                          <Users className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          Quantity: {booking.quantity}
                        </li>
                      </ul>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4">
                        <div>
                          <p className="text-xs text-stone-500">Total paid</p>
                          <p className="text-lg font-bold text-[#3E000C]">
                            {formatPrice(booking.totalPrice)}
                          </p>
                        </div>

                        <Link
                          href={`/user/bookings/${booking._id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                        >
                          <QrCode className="h-4 w-4" />
                          View ticket
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
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3E000C] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}