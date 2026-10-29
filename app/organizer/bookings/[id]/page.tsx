"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Ticket, User, Calendar, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

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
      <main className="min-h-screen bg-[#FFECD1] p-6 flex items-center justify-center text-stone-700">
        <div className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-[#3E000C]" />
          Loading booking details...
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-[#FFECD1] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
          <p className="text-red-600 font-semibold mb-4">
            {error || "Booking not found."}
          </p>

          <Link
            href="/organizer/bookings"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2B0008]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
        </div>
      </main>
    );
  }

  const customerName = booking.user
    ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim()
    : "";

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <main className="min-h-screen bg-[#FFECD1] p-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
        <div className="mx-auto max-w-3xl">
          
          {/* Header section */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Verification Record
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Booking Details
              </h1>
            </div>

            <Link
              href="/organizer/bookings"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Bookings
            </Link>
          </div>

          {/* Details Content Card */}
          <div className="space-y-8 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            
            {/* Booking Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                <Ticket className="h-5 w-5 text-[#3E000C]" />
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Booking Information
                </h2>
              </div>

              <div className="space-y-1">
                <Detail label="Booking ID" value={booking.bookingId || booking._id} />
                <Detail label="Ticket Type" value={booking.ticketType || "Standard"} />
                <Detail label="Quantity" value={String(booking.quantity)} />
                <Detail label="Total Price" value={`₹${booking.totalPrice}`} />
                <div className="grid grid-cols-1 gap-1 border-b border-stone-100 py-3 sm:grid-cols-2">
                  <p className="text-sm font-semibold text-stone-500">Status</p>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      booking.status?.toLowerCase() === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {booking.status || "Confirmed"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                <User className="h-5 w-5 text-[#3E000C]" />
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Customer Information
                </h2>
              </div>

              <div className="space-y-1">
                <Detail label="Customer Name" value={customerName || "Unavailable"} />
                <Detail label="Email Address" value={booking.user?.email || "Unavailable"} />
              </div>
            </section>

            {/* Event Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
                <Calendar className="h-5 w-5 text-[#3E000C]" />
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Event Information
                </h2>
              </div>

              <div className="space-y-1">
                <Detail
                  label="Event Name"
                  value={booking.event?.eventName || "Unavailable"}
                />
                <Detail
                  label="Date"
                  value={
                    booking.event?.date
                      ? new Date(booking.event.date).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })
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
              </div>
            </section>

          </div>
        </div>
      </main>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-stone-100 py-3 sm:grid-cols-2">
      <p className="text-sm font-semibold text-stone-500">{label}</p>
      <p className="break-words text-sm font-normal text-stone-900">{value}</p>
    </div>
  );
}