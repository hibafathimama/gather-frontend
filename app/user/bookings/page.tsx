"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
_id: string;
event?: {
_id: string;
eventName: string;
date: string;
time?: string;
venue?: string;
image?: string;
price?: number;
};
ticketType: string;
quantity: number;
totalPrice?: number;
status?: string;
createdAt?: string;
}

export default function MyBookingsPage() {
const [bookings, setBookings] = useState<Booking[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const backendUrl =
process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

const imageBaseUrl = backendUrl.replace(/\/api\/?$/, "");

useEffect(() => {
const fetchBookings = async () => {
try {
setLoading(true);
setError("");


    const response = await fetch(
      `${backendUrl}/bookings/getmybookings`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    const result = await response.json();

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
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong while fetching bookings."
    );
  } finally {
    setLoading(false);
  }
};

fetchBookings();


}, [backendUrl]);

const formatDate = (date?: string) => {
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


};

const formatPrice = (price?: number) => {
if (typeof price !== "number") return "Price unavailable";


return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
}).format(price);


};

if (loading) {
return ( <main className="min-h-screen bg-[#F7FAF8] p-8"> <p className="text-center text-gray-600">
Loading your bookings... </p> </main>
);
}

return ( <main className="min-h-screen bg-[#F7FAF8] px-4 py-8 sm:px-8"> <div className="mx-auto max-w-5xl"> <header className="mb-8 flex flex-wrap items-center justify-between gap-4"> <div> <Link
           href="/user/dashboard"
           className="text-2xl font-bold text-[#1F2A24]"
         >
gather<span className="text-green-700">.</span> </Link>

        <h1 className="mt-5 text-3xl font-bold text-[#1F2A24]">
          My Bookings
        </h1>

        <p className="mt-2 text-gray-600">
          View your booked events and ticket details.
        </p>
      </div>

      <Link
        href="/events"
        className="rounded-lg bg-[#2F6B4F] px-5 py-3 font-medium text-white hover:bg-[#24553E]"
      >
        Explore Events
      </Link>
    </header>

    {error && (
      <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Unable to load bookings</p>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    )}

    {!error && bookings.length === 0 && (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <div className="mb-4 text-5xl">🎟️</div>

        <h2 className="text-xl font-semibold text-gray-800">
          No bookings yet
        </h2>

        <p className="mt-2 text-gray-500">
          You haven't booked any events yet. Explore events and book
          your next experience!
        </p>

        <Link
          href="/events"
          className="mt-6 inline-block rounded-lg bg-[#2F6B4F] px-6 py-3 font-medium text-white hover:bg-[#24553E]"
        >
          Browse Events
        </Link>
      </div>
    )}

    <div className="space-y-5">
      {bookings.map((booking) => (
        <article
          key={booking._id}
          className="overflow-hidden rounded-2xl bg-white shadow-sm"
        >
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
            {booking.event?.image ? (
              <img
            src={
            booking.event.image.startsWith("http")
                ? booking.event.image
                : `${backendUrl.replace(/\/api\/?$/, "")}${
                    booking.event.image.startsWith("/") ? "" : "/"
                }${booking.event.image}`
            }
            onError={(e) => {
            console.error("Image failed to load:", e.currentTarget.src);
            }}
                alt={booking.event.eventName || "Event"}
                className="h-44 w-full rounded-xl object-cover sm:w-52"
              />
            ) : (
              <div className="flex h-44 w-full items-center justify-center rounded-xl bg-gray-100 text-5xl sm:w-52">
                🎫
              </div>
            )}

            <div className="flex flex-1 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-[#1F2A24]">
                  {booking.event?.eventName || "Event details unavailable"}
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium capitalize text-green-800">
                  {booking.status || "Booked"}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-800">Booking ID:</strong>{" "}
                  {booking._id}
                </p>

                <p>
                  <strong className="text-gray-800">Date:</strong>{" "}
                  {formatDate(booking.event?.date)}
                </p>

                {booking.event?.time && (
                  <p>
                    <strong className="text-gray-800">Time:</strong>{" "}
                    {booking.event.time}
                  </p>
                )}

                {booking.event?.venue && (
                  <p>
                    <strong className="text-gray-800">Venue:</strong>{" "}
                    {booking.event.venue}
                  </p>
                )}

                <p>
                  <strong className="text-gray-800">Ticket type:</strong>{" "}
                  {booking.ticketType || "General"}
                </p>

                <p>
                  <strong className="text-gray-800">Quantity:</strong>{" "}
                  {booking.quantity}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <p className="text-lg font-bold text-green-700">
                  {formatPrice(booking.totalPrice)}
                </p>
                    <Link
                    href={`/user/bookings/${booking._id}`}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                    View Ticket
                    </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>

    <div className="mt-8">
      <Link
        href="/user/dashboard"
        className="font-medium text-[#2F6B4F] hover:underline"
      >
        ← Back to Dashboard
      </Link>
    </div>
  </div>
</main>


);
}
