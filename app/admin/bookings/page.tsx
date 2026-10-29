"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Ticket, 
  BookmarkCheck, 
  Ban, 
  Search, 
  ArrowLeft, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar 
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface UserType {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface EventType {
  eventName?: string;
  date?: string;
  time?: string;
  venue?: string;
  location?: string;
  ticketPrice?: number;
}

interface BookingType {
  _id: string;
  bookingId?: string;
  user?: UserType | null;
  event?: EventType | null;
  quantity?: number;
  totalPrice?: number;
  ticketType?: string;
  status?: string;
  createdAt?: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/bookings");
        const result = response.data.data;

        setBookings(Array.isArray(result) ? result : []);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === "object" && err !== null && "response" in err
            ? String(
                (
                  err as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message || "Failed to fetch bookings."
              )
            : "Unable to connect to the server.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (booking: BookingType) => {
    const bookingReference = booking.bookingId || booking._id;

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${bookingReference}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");
      setCancellingId(booking._id);

      const response = await api.patch(
        `/admin/bookings/${booking._id}/cancel`
      );

      // Update the booking status immediately in the UI.
      setBookings((previousBookings) =>
        previousBookings.map((item) =>
          item._id === booking._id
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setSuccess(
        response.data.message || "Booking cancelled successfully."
      );
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to cancel booking."
            )
          : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const customer = booking.user
        ? `${booking.user.firstName || ""} ${
            booking.user.lastName || ""
          } ${booking.user.email || ""}`.toLowerCase()
        : "";

      const eventName = (booking.event?.eventName || "").toLowerCase();
      const bookingId = (booking.bookingId || booking._id).toLowerCase();

      return (
        customer.includes(searchText) ||
        eventName.includes(searchText) ||
        bookingId.includes(searchText)
      );
    });
  }, [bookings, search]);

  const formatDate = (date?: string) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount?: number) => {
    if (typeof amount !== "number") return "Not available";

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Operations
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Bookings
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                View customer bookings, verify ticket credentials, and moderate active reservations.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Stats Overview Cards */}
          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Ticket className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Bookings</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">{bookings.length}</p>
            </div>

            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <BookmarkCheck className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Filtered</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Matching Bookings</p>
              <p className="editorial-heading mt-1 text-4xl font-bold text-[#3E000C]">
                {filteredBookings.length}
              </p>
            </div>
          </div>

          {/* Search & Content Container */}
          <section className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <div className="mb-6">
              <label
                htmlFor="booking-search"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
              >
                Search Platform Bookings
              </label>

              <div className="relative">
                <input
                  id="booking-search"
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by booking ID, customer name, email, or event..."
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                {success}
              </div>
            )}

            {/* Table States */}
            {loading ? (
              <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading bookings directory...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-12 text-center">
                <Ticket className="mx-auto mb-3 h-10 w-10 text-stone-400" />
                <p className="text-stone-600 font-medium">
                  {search
                    ? "No matching bookings found."
                    : "No bookings found."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">
                      <th className="px-4 py-3.5">Booking ID</th>
                      <th className="px-4 py-3.5">Customer</th>
                      <th className="px-4 py-3.5">Event</th>
                      <th className="px-4 py-3.5">Tickets</th>
                      <th className="px-4 py-3.5">Total Price</th>
                      <th className="px-4 py-3.5">Booked On</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-stone-100">
                    {filteredBookings.map((booking) => {
                      const customerName = booking.user
                        ? `${booking.user.firstName || ""} ${
                            booking.user.lastName || ""
                          }`.trim() || "Unknown customer"
                        : "User unavailable";

                      const isCancelled = booking.status === "cancelled";
                      const isCancelling = cancellingId === booking._id;

                      return (
                        <tr
                          key={booking._id}
                          className="transition hover:bg-stone-50/50"
                        >
                          <td className="px-4 py-4 font-mono text-xs font-bold text-[#3E000C]">
                            {booking.bookingId || booking._id}
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-stone-900">{customerName}</p>
                            <p className="mt-0.5 text-xs font-semibold text-stone-500">
                              {booking.user?.email || "Email unavailable"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-stone-900">
                              {booking.event?.eventName || "Event unavailable"}
                            </p>
                            <p className="mt-0.5 text-xs text-stone-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(booking.event?.date)}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-stone-700">
                            <p className="font-semibold">{booking.quantity ?? "Not available"} seats</p>
                            {booking.ticketType && (
                              <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                                {booking.ticketType}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm font-bold text-[#3E000C]">
                            {formatAmount(booking.totalPrice)}
                          </td>

                          <td className="px-4 py-4 text-sm text-stone-600 font-medium">
                            {formatDate(booking.createdAt)}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                isCancelled
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {booking.status || "confirmed"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
                                <XCircle className="h-3.5 w-3.5" /> Already cancelled
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCancelBooking(booking)}
                                disabled={cancellingId !== null}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isCancelling ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Ban className="h-3.5 w-3.5" />
                                )}
                                {isCancelling ? "Cancelling..." : "Cancel Booking"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}