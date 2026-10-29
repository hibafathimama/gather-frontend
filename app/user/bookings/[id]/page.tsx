"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Tag,
  QrCode,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface EventDetails {
  _id: string;
  eventName: string;
  date: string;
  time?: string;
  venue?: string;
  location?: string;
  ticketPrice?: number;
  image?: string;
}

interface Booking {
  _id: string;
  bookingId?: string;
  qrCode?: string | null;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  status?: string;
  createdAt?: string;
  event: EventDetails | null;
}

interface ApiResponse<T> {
  message?: string;
  data?: T;
}

const backendUrl = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const imageBaseUrl = backendUrl.replace(/\/api$/, "");

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      response.ok
        ? "The server returned an unexpected response."
        : `Server error (${response.status}). Please check the backend URL and server.`
    );
  }

  return response.json() as Promise<ApiResponse<T>>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function ViewTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState("");

  // Get the booking ID from the URL.
  useEffect(() => {
    let active = true;

    params
      .then((resolvedParams) => {
        if (active) {
          setId(resolvedParams.id);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to read the booking ID from the URL.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [params]);

  // Fetch the selected booking.
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${backendUrl}/bookings/${id}`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await readResponse<Booking>(response);

        if (!response.ok) {
          throw new Error(result.message || "Unable to load ticket.");
        }

        if (!result.data) {
          throw new Error("Ticket details were not returned by the server.");
        }

        setBooking(result.data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(getErrorMessage(err));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTicket();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Cancel the selected booking.
  const handleCancelBooking = async () => {
    if (!booking || cancellingId) return;

    if (booking.status?.toLowerCase() === "cancelled") {
      setCancelMessage("This booking has already been cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(booking._id);
      setCancelMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${backendUrl}/bookings/cancel/${booking._id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        }
      );

      const result = await readResponse<unknown>(response);

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel booking.");
      }

      setBooking((previousBooking) =>
        previousBooking
          ? { ...previousBooking, status: "cancelled" }
          : previousBooking
      );

      setCancelMessage(result.message || "Booking cancelled successfully.");
    } catch (err: unknown) {
      setCancelMessage(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4 text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your ticket...
        </p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4">
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm"
        >
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </span>
          <p className="mb-5 text-sm text-stone-700">
            {error || "Ticket not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/user/bookings")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to my bookings
          </button>
        </div>
      </main>
    );
  }

  const event = booking.event;

  const imageUrl = event?.image
    ? event.image.startsWith("http")
      ? event.image
      : `${imageBaseUrl}${event.image.startsWith("/") ? "" : "/"}${event.image}`
    : null;

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Date not available";

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(booking.totalPrice ?? 0);

  const isCancelled = booking.status?.toLowerCase() === "cancelled";
  const cancelSucceeded = cancelMessage.toLowerCase().includes("success");

  const details = [
    {
      label: "Date",
      value: formattedDate,
      Icon: CalendarDays,
      wide: false,
    },
    {
      label: "Time",
      value: event?.time || "Not specified",
      Icon: Clock,
      wide: false,
    },
    {
      label: "Venue",
      value: event?.venue || event?.location || "Not specified",
      Icon: MapPin,
      wide: true,
    },
    {
      label: "Ticket type",
      value: booking.ticketType,
      Icon: Tag,
      wide: false,
    },
    {
      label: "Tickets",
      value: String(booking.quantity),
      Icon: Users,
      wide: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
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
            href="/user/bookings"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">My bookings</span>
          </Link>
        </header>

        {/* Ticket */}
        <article className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm">
          {/* Ticket header */}
          <div className="bg-[#3E000C] px-6 py-6 text-[#FFECD1] sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-[#FFECD1]/75">Your ticket</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {event?.eventName || "Event ticket"}
                </h1>
              </div>

              <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
                  isCancelled
                    ? "bg-red-100 text-red-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {booking.status || "Confirmed"}
              </span>
            </div>

            <p className="mt-3 break-all text-sm text-[#FFECD1]/75">
              Reference:{" "}
              <span className="font-mono text-white">
                {booking.bookingId || booking._id}
              </span>
            </p>
          </div>

          {/* Event image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={event?.eventName || "Event"}
              className="h-52 w-full bg-stone-100 object-cover sm:h-64"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          {/* Details */}
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            {details.map(({ label, value, Icon, wide }) => (
              <div
                key={label}
                className={`flex items-start gap-3 ${
                  wide ? "sm:col-span-2" : ""
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-stone-500">{label}</p>
                  <p className="font-semibold text-stone-900">{value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-lg bg-[#FFECD1]/50 px-4 py-3 sm:col-span-2">
              <span className="text-sm font-medium text-[#3E000C]">
                Total paid
              </span>
              <span className="text-2xl font-bold text-[#3E000C]">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Tear-off line */}
          <div className="relative" aria-hidden="true">
            <div className="border-t border-dashed border-[#F5D8B3]" />
            <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#FFECD1]" />
            <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#FFECD1]" />
          </div>

          {/* QR code */}
          <div className="px-6 py-8 text-center sm:px-8">
            {booking.qrCode ? (
              <div className="space-y-4">
                <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-[#3E000C]">
                  <QrCode className="h-5 w-5" />
                  Entry QR code
                </h2>

                <div
                  className={`inline-block rounded-xl border border-[#F5D8B3] bg-white p-3 ${
                    isCancelled ? "opacity-40 grayscale" : ""
                  }`}
                >
                  <img
                    src={booking.qrCode}
                    alt="Ticket QR Code"
                    className="mx-auto h-48 w-48 object-contain"
                  />
                </div>

                <p className="text-sm text-stone-600">
                  {isCancelled
                    ? "This booking was cancelled, so the QR code is no longer valid."
                    : "Show this QR code at the entrance to check in."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500">
                QR code is unavailable for this booking.
              </p>
            )}
          </div>

          {/* Cancel booking */}
          <div className="border-t border-stone-100 bg-stone-50/70 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-sm text-sm text-stone-600">
                Keep your booking reference handy in case you need support.
              </p>

              {!isCancelled && (
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancellingId === booking._id}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingId === booking._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {cancellingId === booking._id
                    ? "Cancelling..."
                    : "Cancel booking"}
                </button>
              )}
            </div>

            {cancelMessage && (
              <p
                role="status"
                className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                  cancelSucceeded
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {cancelSucceeded ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {cancelMessage}
              </p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}