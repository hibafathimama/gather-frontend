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
  Calendar,
  Filter,
  UserRound,
  MapPin,
  Clock,
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
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch all bookings
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

  // Cancel booking
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

  // Search and filter bookings
  const filteredBookings = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const customer = booking.user
        ? `${booking.user.firstName || ""} ${
            booking.user.lastName || ""
          } ${booking.user.email || ""}`.toLowerCase()
        : "";

      const eventName = (booking.event?.eventName || "").toLowerCase();

      const bookingId = (
        booking.bookingId || booking._id
      ).toLowerCase();

      const matchesSearch =
        customer.includes(searchText) ||
        eventName.includes(searchText) ||
        bookingId.includes(searchText);

      const isCancelled =
        booking.status?.toLowerCase() === "cancelled";

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !isCancelled) ||
        (statusFilter === "cancelled" && isCancelled);

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  // Statistics
  const activeBookingsCount = bookings.filter(
    (booking) => booking.status?.toLowerCase() !== "cancelled"
  ).length;

  const cancelledBookingsCount = bookings.length - activeBookingsCount;

  // Format date
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

  // Format amount
  const formatAmount = (amount?: number) => {
    if (typeof amount !== "number") return "Not available";

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Customer name
  const getCustomerName = (user?: UserType | null) => {
    if (!user) return "User unavailable";

    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown customer"
    );
  };

  // Booking status
  const isBookingCancelled = (booking: BookingType) =>
    booking.status?.toLowerCase() === "cancelled";

  // Responsive booking card
  const renderBookingCard = (booking: BookingType) => {
    const isCancelled = isBookingCancelled(booking);
    const isCancelling = cancellingId === booking._id;

    return (
      <article
        key={booking._id}
        className="flex min-w-0 flex-col rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
      >
        {/* Booking Header */}
        <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Booking ID
            </p>

            <p className="mt-1 break-all font-mono text-xs font-bold text-[#3E000C]">
              {booking.bookingId || booking._id}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              isCancelled
                ? "border-red-200 bg-red-100 text-red-800"
                : "border-emerald-200 bg-emerald-100 text-emerald-800"
            }`}
          >
            {booking.status || "confirmed"}
          </span>
        </div>

        {/* Customer Information */}
        <div className="mb-4 flex items-start gap-3 border-t border-stone-100 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFECD1] text-[#3E000C]">
            <UserRound className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="break-words text-sm font-bold text-stone-900">
              {getCustomerName(booking.user)}
            </p>

            <p className="mt-0.5 break-all text-xs text-stone-500">
              {booking.user?.email || "Email unavailable"}
            </p>
          </div>
        </div>

        {/* Event Information */}
        <div className="space-y-3 border-t border-stone-100 pt-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Event
            </p>

            <p className="break-words text-sm font-bold text-[#3E000C]">
              {booking.event?.eventName || "Event unavailable"}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#3E000C]" />

            <div>
              <p className="text-xs font-semibold text-stone-700">
                {formatDate(booking.event?.date)}
              </p>

              {booking.event?.time && (
                <p className="mt-0.5 text-xs text-stone-500">
                  {booking.event.time}
                </p>
              )}
            </div>
          </div>

          {(booking.event?.location || booking.event?.venue) && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3E000C]" />

              <p className="break-words text-xs text-stone-600">
                {booking.event.location || booking.event.venue}
              </p>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Tickets
            </p>

            <p className="mt-1 text-sm font-bold text-stone-800">
              {booking.quantity ?? "N/A"} seats
            </p>

            {booking.ticketType && (
              <p className="mt-0.5 break-words text-[10px] font-bold uppercase tracking-wider text-[#3E000C]">
                {booking.ticketType}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Price
            </p>

            <p className="mt-1 text-sm font-bold text-[#3E000C]">
              {formatAmount(booking.totalPrice)}
            </p>
          </div>
        </div>

        {/* Booking Date */}
        <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3">
          <Clock className="h-3.5 w-3.5 text-stone-400" />

          <p className="text-xs text-stone-500">
            Booked on {formatDate(booking.createdAt)}
          </p>
        </div>

        {/* Cancel Action */}
        <div className="mt-4 border-t border-stone-100 pt-4">
          {isCancelled ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-stone-100 px-3 py-3 text-xs font-semibold text-stone-500">
              <XCircle className="h-4 w-4" />
              Already Cancelled
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCancelBooking(booking)}
              disabled={cancellingId !== null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}

              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap");

        .editorial-heading {
          font-family: "Cormorant Garamond", Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen w-full overflow-x-hidden bg-[#FFECD1] px-3 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-5 sm:py-8 md:px-8 md:py-10 lg:p-12">
        <div className="mx-auto w-full max-w-7xl">

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 border-b border-[#F5D8B3] pb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="mb-2 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3E000C] sm:text-[11px]">
                Platform Operations
              </span>

              <h1 className="editorial-heading text-3xl font-bold tracking-tight text-[#3E000C] sm:text-4xl md:text-5xl">
                Manage Bookings
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-relaxed text-stone-600 sm:text-sm">
                View customer bookings, verify ticket credentials, and
                moderate active reservations.
              </p>
            </div>

            <Link
              href="/admin/dashboard"
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50 sm:px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          {/* Statistics */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-5">

            {/* Total Bookings */}
            <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <Ticket className="h-5 w-5" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Total
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Total Bookings
              </p>

              <p className="editorial-heading mt-1 text-3xl font-bold text-[#3E000C] sm:text-4xl">
                {bookings.length}
              </p>
            </div>

            {/* Active Bookings */}
            <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                  <BookmarkCheck className="h-5 w-5" />
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Active
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Active Bookings
              </p>

              <p className="editorial-heading mt-1 text-3xl font-bold text-[#3E000C] sm:text-4xl">
                {activeBookingsCount}
              </p>

              <p className="mt-1 text-xs text-stone-400">
                {cancelledBookingsCount} cancelled bookings
              </p>
            </div>
          </div>

          {/* Search and Bookings */}
          <section className="min-w-0 rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_250px]">

              {/* Search */}
              <div className="min-w-0">
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
                    placeholder="Search by booking ID, customer, or event..."
                    className="w-full min-w-0 rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10 sm:rounded-2xl"
                  />

                  <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="min-w-0">
                <label
                  htmlFor="status-filter"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Filter by Status
                </label>

                <div className="relative">
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pr-10 text-sm font-medium text-stone-700 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10 sm:rounded-2xl"
                  >
                    <option value="all">All Bookings</option>
                    <option value="active">Active Bookings</option>
                    <option value="cancelled">Cancelled Bookings</option>
                  </select>

                  <Filter className="pointer-events-none absolute right-4 top-3.5 h-5 w-5 text-stone-400" />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 sm:items-center sm:p-4 sm:text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 sm:items-center sm:p-4 sm:text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 sm:mt-0" />
                <span className="break-words">{success}</span>
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm font-medium text-stone-600">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
                Loading bookings directory...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-8 text-center sm:p-12">
                <Ticket className="mx-auto mb-3 h-10 w-10 text-stone-400" />

                <p className="text-sm font-medium text-stone-600">
                  {search || statusFilter !== "all"
                    ? "No bookings found for the selected search or filter."
                    : "No bookings found."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile and Tablet Cards */}
                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
                  {filteredBookings.map((booking) =>
                    renderBookingCard(booking)
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500">
                        <th className="whitespace-nowrap px-4 py-3.5">
                          Booking ID
                        </th>

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
                        const customerName = getCustomerName(booking.user);

                        const isCancelled =
                          isBookingCancelled(booking);

                        const isCancelling =
                          cancellingId === booking._id;

                        return (
                          <tr
                            key={booking._id}
                            className="transition hover:bg-stone-50/50"
                          >
                            {/* Booking ID */}
                            <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-bold text-[#3E000C]">
                              {booking.bookingId || booking._id}
                            </td>

                            {/* Customer */}
                            <td className="px-4 py-4">
                              <p className="font-bold text-stone-900">
                                {customerName}
                              </p>

                              <p className="mt-0.5 text-xs font-semibold text-stone-500">
                                {booking.user?.email || "Email unavailable"}
                              </p>
                            </td>

                            {/* Event */}
                            <td className="px-4 py-4">
                              <p className="font-bold text-stone-900">
                                {booking.event?.eventName || "Event unavailable"}
                              </p>

                              <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.event?.date)}
                              </p>
                            </td>

                            {/* Tickets */}
                            <td className="px-4 py-4 text-sm text-stone-700">
                              <p className="font-semibold">
                                {booking.quantity ?? "Not available"} seats
                              </p>

                              {booking.ticketType && (
                                <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                                  {booking.ticketType}
                                </p>
                              )}
                            </td>

                            {/* Total Price */}
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-[#3E000C]">
                              {formatAmount(booking.totalPrice)}
                            </td>

                            {/* Booked On */}
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-stone-600">
                              {formatDate(booking.createdAt)}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                              <span
                                className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                  isCancelled
                                    ? "border-red-200 bg-red-100 text-red-800"
                                    : "border-emerald-200 bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {booking.status || "confirmed"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                              {isCancelled ? (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-stone-400">
                                  <XCircle className="h-3.5 w-3.5" />
                                  Already cancelled
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancelBooking(booking)
                                  }
                                  disabled={cancellingId !== null}
                                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isCancelling ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}

                                  {isCancelling
                                    ? "Cancelling..."
                                    : "Cancel Booking"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}