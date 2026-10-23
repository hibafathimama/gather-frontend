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
  ticketType: string;
  quantity: number;
  totalPrice: number;
  status?: string;
  createdAt?: string;
  event: EventDetails | null;
}

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const imageBaseUrl = backendUrl.replace(/\/api\/?$/, "");

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


  //cancel booking 
  const handleCancelBooking = async (bookingId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmed) return;

  try {
    setCancellingId(bookingId);
    setCancelMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${backendUrl}/bookings/cancel/${bookingId}`,
      {
        method: "DELETE",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        credentials: "include",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel booking");
    }

    // Update the booking status immediately
        setBooking((previousBooking) =>
        previousBooking
            ? { ...previousBooking, status: "cancelled" }
            : previousBooking
        );

    setCancelMessage("Booking cancelled successfully!");
  } catch (error) {
    setCancelMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  } finally {
    setCancellingId(null);
  }
};



//get the booking id from the url
  useEffect(() => {
  params.then((resolvedParams) => {
    setId(resolvedParams.id);
  });
}, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        // Get the user's authentication token
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const response = await fetch(`${backendUrl}/bookings/${id}`, {
          method: "GET",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load ticket");
        }

        setBooking(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading your ticket...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-center text-red-600">
          {error || "Ticket not found"}
        </p>

        <button
          onClick={() => router.push("/user/bookings")}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
        >
          Back to My Bookings
        </button>
      </main>
    );
  }

  const event = booking.event;

  const imageUrl = event?.image
    ? event.image.startsWith("http")
      ? event.image
      : `${imageBaseUrl}${
          event.image.startsWith("/") ? "" : "/"
        }${event.image}`
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

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/user/bookings"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to My Bookings
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Ticket header */}
          <div className="bg-indigo-700 px-6 py-7 text-white sm:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">
              Your Event Ticket
            </p>

            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {event?.eventName || "Event Ticket"}
            </h1>

            <p className="mt-2 text-sm text-indigo-100">
              Booking reference: {booking.bookingId || booking._id}
            </p>
          </div>

          {/* Event image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event?.eventName || "Event"}
              className="h-56 w-full object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-gray-100 text-5xl">
              🎫
            </div>
          )}

          {/* Ticket details */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="text-sm text-gray-500">Event Date</p>
              <p className="mt-1 font-semibold text-gray-900">
                {formattedDate}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Event Time</p>
              <p className="mt-1 font-semibold text-gray-900">
                {event?.time || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Venue</p>
              <p className="mt-1 font-semibold text-gray-900">
                {event?.venue || event?.location || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ticket Type</p>
              <p className="mt-1 font-semibold text-gray-900">
                {booking.ticketType}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Number of Tickets</p>
              <p className="mt-1 font-semibold text-gray-900">
                {booking.quantity}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="mt-1 text-xl font-bold text-indigo-700">
                {formattedPrice}
              </p>
            </div>
          </div>

          {/* Booking status */}
          <div className="border-t border-dashed border-gray-300 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Booking Status</p>

                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                    booking.status?.toLowerCase() === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {booking.status || "Confirmed"}
                </span>
              </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
            

            {booking.status?.toLowerCase() !== "cancelled" && (
                <button
                onClick={() => handleCancelBooking(booking._id)}
                disabled={cancellingId === booking._id}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                {cancellingId === booking._id
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
            )}
            </div>

                {cancelMessage && (
                <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800">
                    {cancelMessage}
                </p>
                )}


            </div>

            <p className="mt-5 text-xs text-gray-500">
              Please keep your booking reference for future enquiries.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
