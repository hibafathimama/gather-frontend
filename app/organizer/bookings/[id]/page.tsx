"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Booking {
  _id: string;
  bookingId: string;
  quantity: number;
  totalPrice: number;
  status?: string;
  ticketType?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  event?: {
    eventName?: string;
    date?: string;
    time?: string;
    venue?: string;
    location?: string;
    ticketPrice?: number;
  };
}

export default function OrganizerBookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!token) {
          throw new Error("Please log in to view booking details.");
        }

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(
          `${backendUrl}/bookings/organizer/${bookingId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch booking details."
          );
        }

        setBooking(result.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-gray-600">Loading booking details...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <p className="text-red-600">
            {error || "Booking not found."}
          </p>

          <Link
            href="/organizer/bookings"
            className="mt-4 inline-block font-medium text-blue-700 hover:underline"
          >
            Back to Bookings
          </Link>
        </div>
      </main>
    );
  }

  const customerName = booking.user
    ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim()
    : "";

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Booking Details
          </h1>

          <Link
            href="/organizer/bookings"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Bookings
          </Link>
        </div>

        <div className="space-y-6 rounded-xl bg-white p-6 shadow">
          <section>
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
              Booking Information
            </h2>

            <Detail label="Booking ID" value={booking.bookingId || booking._id} />
            <Detail label="Ticket Type" value={booking.ticketType || "Standard"} />
            <Detail label="Quantity" value={String(booking.quantity)} />
            <Detail label="Total Price" value={`₹${booking.totalPrice}`} />
            <Detail label="Status" value={booking.status || "Confirmed"} />
          </section>

          <section>
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
              Customer Information
            </h2>

            <Detail label="Customer Name" value={customerName || "Unavailable"} />
            <Detail label="Email" value={booking.user?.email || "Unavailable"} />
          </section>

          <section>
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
              Event Information
            </h2>

            <Detail
              label="Event Name"
              value={booking.event?.eventName || "Unavailable"}
            />
            <Detail
              label="Date"
              value={
                booking.event?.date
                  ? new Date(booking.event.date).toLocaleDateString()
                  : "Unavailable"
              }
            />
            <Detail label="Time" value={booking.event?.time || "Unavailable"} />
            <Detail label="Venue" value={booking.event?.venue || "Unavailable"} />
            <Detail
              label="Location"
              value={booking.event?.location || "Unavailable"}
            />
            <Detail
              label="Ticket Price"
              value={
                booking.event?.ticketPrice !== undefined
                  ? `₹${booking.event.ticketPrice}`
                  : "Unavailable"
              }
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 sm:grid-cols-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="break-words font-medium text-gray-800">{value}</p>
    </div>
  );
}
