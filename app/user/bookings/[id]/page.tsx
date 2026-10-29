"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api"
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
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
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
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4 text-[#3E000C] font-semibold">
        <p>Loading your ticket...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFECD1] px-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-600 mb-4">
            {error || "Ticket not found."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/user/bookings")}
            className="rounded-xl bg-[#3E000C] px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
          >
            Back to My Bookings
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

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-8 sm:px-6 lg:px-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-3xl">

        <div className="mt-8 mb-6">
          <Link
            href="/user/bookings"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#3E000C] hover:opacity-70 transition-opacity"
          >
            ← Back to My Bookings
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">
          
          {/* Ticket Header */}
          <div className="bg-[#3E000C] px-6 py-8 text-[#FFECD1] sm:px-8">
            <span className="mb-2 inline-block rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Your Event Ticket
            </span>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {event?.eventName || "Event Ticket"}
            </h1>

            <p className="mt-2 text-xs font-medium text-stone-300">
              Booking reference: <span className="text-white font-mono">{booking.bookingId || booking._id}</span>
            </p>
          </div>

          {/* Event Image */}
          {imageUrl ? (
            <div className="relative h-56 w-full overflow-hidden bg-stone-100 sm:h-72">
              <img
                src={imageUrl}
                alt={event?.eventName || "Event"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-stone-100 text-4xl">
              🎫
            </div>
          )}

          {/* Ticket Details Grid */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 bg-white border-b border-stone-100">
            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Event Date</span>
              <span className="font-semibold text-stone-900">
                📅 {formattedDate}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Event Time</span>
              <span className="font-semibold text-stone-900">
                🕒 {event?.time || "Not specified"}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200 sm:col-span-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Venue</span>
              <span className="font-semibold text-stone-900">
                📍 {event?.venue || event?.location || "Not specified"}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Ticket Type</span>
              <span className="font-semibold text-stone-900">
                {booking.ticketType}
              </span>
            </div>

            <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Number of Tickets</span>
              <span className="font-semibold text-stone-900">
                {booking.quantity}
              </span>
            </div>

            <div className="rounded-2xl bg-[#3E000C]/5 p-4 border border-[#3E000C]/20 sm:col-span-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3E000C]">Total Price</span>
              <span className="text-2xl font-black text-[#3E000C]">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="px-6 py-8 text-center sm:px-8 bg-white border-b border-stone-100">
            {booking.qrCode ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[#3E000C]">
                  Your Ticket QR Code
                </h2>

                <div className="inline-block rounded-2xl border-2 border-dashed border-[#F5D8B3] p-4 bg-stone-50 shadow-inner">
                  <img
                    src={booking.qrCode}
                    alt="Ticket QR Code"
                    className="mx-auto h-48 w-48 rounded-xl object-contain"
                  />
                </div>

                <p className="text-xs font-medium text-stone-500">
                  Show this QR code at the event entrance for scanning.
                </p>
              </div>
            ) : (
              <p className="text-xs font-medium text-stone-400">
                QR code is unavailable for this booking.
              </p>
            )}
          </div>

          {/* Booking Status and Cancellation Action */}
          <div className="px-6 py-6 sm:px-8 bg-stone-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Booking Status</span>

                <span
                  className={`inline-block rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    isCancelled
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {booking.status || "Confirmed"}
                </span>
              </div>

              {!isCancelled && (
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancellingId === booking._id}
                  className="rounded-xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingId === booking._id
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
              )}
            </div>

            {cancelMessage && (
              <p
                role="status"
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  cancelMessage.toLowerCase().includes("success")
                    ? "border border-green-200 bg-green-50 text-green-800"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {cancelMessage}
              </p>
            )}

            <p className="mt-6 text-[11px] font-medium text-stone-400">
              Please keep your booking reference accessible for any future support inquiries.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}