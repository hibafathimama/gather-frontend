"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  };
}

export default function OrganizerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizerBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!token) {
          throw new Error("Please log in to view your bookings.");
        }

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(
          `${backendUrl}/bookings/getorganizersbooking`,
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
            result.message || "Failed to fetch organizer bookings."
          );
        }

        setBookings(result.data || []);
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

    fetchOrganizerBookings();
  }, []);

  // Download booking report as CSV
  const downloadBookingReport = () => {
    if (bookings.length === 0) {
      alert("There are no bookings to download.");
      return;
    }

    const headers = [
      "Booking ID",
      "Customer Name",
      "Email",
      "Event Name",
      "Event Date",
      "Ticket Type",
      "Quantity",
      "Ticket Price",
      "Total Price",
      "Status",
    ];

    const escapeCSV = (value: string | number) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = bookings.map((booking) => {
      const customerName = booking.user
        ? `${booking.user.firstName || ""} ${
            booking.user.lastName || ""
          }`.trim()
        : "Unknown customer";

      return [
        booking.bookingId || booking._id,
        customerName,
        booking.user?.email || "",
        booking.event?.eventName || "Event unavailable",
        booking.event?.date
          ? new Date(booking.event.date).toLocaleDateString("en-GB")
          : "",
        booking.ticketType || "Standard",
        booking.quantity,
        booking.quantity > 0
          ? booking.totalPrice / booking.quantity
          : 0,
        booking.totalPrice,
        booking.status || "confirmed",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "organizer-booking-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // Customer name
  const getCustomerName = (booking: Booking) => {
    if (!booking.user) return "Unknown customer";

    return (
      `${booking.user.firstName || ""} ${
        booking.user.lastName || ""
      }`.trim() || "Unknown customer"
    );
  };

  // Booking status styles
  const getStatusStyles = (status?: string) => {
    if (status?.toLowerCase() === "cancelled") {
      return {
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
      };
    }

    return {
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    };
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

      <main className="min-h-screen w-full overflow-x-hidden bg-[#FFECD1] p-3 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:p-6">
        <div className="mx-auto w-full max-w-7xl">

          {/* Header Section */}
          <div className="mb-6 flex flex-col gap-5 border-b border-[#F5D8B3] pb-6 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">
              <span className="mb-2 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Organizer Portal
              </span>

              <h1 className="editorial-heading text-3xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Bookings
              </h1>

              <p className="mt-1 max-w-xl text-sm text-stone-600">
                Monitor ticket purchases, track customer engagement,
                and export data reports.
              </p>
            </div>

            {/* Header Buttons */}
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

              <button
                type="button"
                onClick={downloadBookingReport}
                disabled={loading || bookings.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E000C] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none sm:w-auto sm:px-6"
              >
                <span>📥</span>
                Download CSV Report
              </button>

              <Link
                href="/organizer/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-[#FFECD1]/40 sm:w-auto sm:px-6"
              >
                <span>←</span>
                Back to Dashboard
              </Link>

            </div>
          </div>

          {/* Metrics Card */}
          <section className="mb-6 rounded-3xl border border-[#F5D8B3] bg-white p-5 shadow-sm sm:mb-8 sm:p-8">

            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Total Bookings Secured
                </p>

                <p className="editorial-heading mt-2 text-4xl font-bold tracking-tight text-[#3E000C]">
                  {loading ? "..." : bookings.length}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3E000C]/10 text-2xl text-[#3E000C] sm:h-14 sm:w-14">
                🎫
              </div>

            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <div className="py-20 text-center font-medium text-stone-600">
              Loading booking records...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600 shadow-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm sm:p-16">

              <div className="mb-3 text-4xl">📭</div>

              <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                No bookings found
              </h2>

              <p className="mt-2 text-sm text-stone-600">
                Customer bookings for your scheduled events will
                display here once completed.
              </p>

            </div>
          )}

          {/* Booking Records */}
          {!loading && !error && bookings.length > 0 && (
            <>

              {/* ================================== */}
              {/* MOBILE AND TABLET BOOKING CARDS */}
              {/* ================================== */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">

                {bookings.map((booking) => {
                  const statusStyles = getStatusStyles(booking.status);

                  return (
                    <article
                      key={booking._id}
                      className="min-w-0 overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                    >

                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-3">

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Booking ID
                          </p>

                          <p className="mt-1 break-all font-mono text-xs font-bold text-[#3E000C]">
                            #{booking.bookingId || booking._id.slice(-6)}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:text-xs ${statusStyles.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                          />

                          {booking.status || "Confirmed"}
                        </span>

                      </div>

                      {/* Customer Details */}
                      <div className="mt-4">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Customer
                        </p>

                        <p className="mt-1 break-words text-sm font-bold text-stone-900">
                          {getCustomerName(booking)}
                        </p>

                        <p className="mt-0.5 break-all text-xs text-stone-500">
                          {booking.user?.email || "No email available"}
                        </p>

                      </div>

                      {/* Event Details */}
                      <div className="mt-4 rounded-xl bg-[#FFECD1]/40 p-3">

                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Event Name
                        </p>

                        <p className="mt-1 break-words text-sm font-bold text-[#3E000C]">
                          {booking.event?.eventName || "Event unavailable"}
                        </p>

                        {booking.event?.date && (
                          <p className="mt-1 text-xs text-stone-500">
                            📅{" "}
                            {new Date(
                              booking.event.date
                            ).toLocaleDateString("en-GB")}
                          </p>
                        )}

                        {(booking.event?.venue || booking.event?.location) && (
                          <p className="mt-1 break-words text-xs text-stone-500">
                            📍{" "}
                            {booking.event.venue ||
                              booking.event.location}
                          </p>
                        )}

                      </div>

                      {/* Booking Summary */}
                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-lg font-bold text-stone-900">
                            {booking.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Total Price
                          </p>

                          <p className="mt-1 text-lg font-black text-[#3E000C]">
                            ₹{booking.totalPrice}
                          </p>
                        </div>

                      </div>

                      {/* View Details Button */}
                      <div className="mt-4 border-t border-stone-100 pt-4">

                        <Link
                          href={`/organizer/bookings/${booking._id}`}
                          className="flex w-full items-center justify-center rounded-xl border border-[#3E000C] bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-[#3E000C] hover:text-[#FFECD1]"
                        >
                          View Details →
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>

              {/* ================================== */}
              {/* DESKTOP BOOKING TABLE */}
              {/* ================================== */}

              <div className="hidden overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm lg:block">

                <div className="w-full overflow-x-auto">

                  <table className="w-full border-collapse text-left">

                    <thead className="bg-[#3E000C] text-[#FFECD1]">
                      <tr>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Booking ID
                        </th>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Customer
                        </th>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Event Name
                        </th>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Qty
                        </th>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Total Price
                        </th>

                        <th className="whitespace-nowrap p-4 text-xs font-bold uppercase tracking-wider">
                          Status
                        </th>

                        <th className="whitespace-nowrap p-4 text-right text-xs font-bold uppercase tracking-wider">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100 text-sm">

                      {bookings.map((booking) => {
                        const statusStyles = getStatusStyles(booking.status);

                        return (
                          <tr
                            key={booking._id}
                            className="transition-colors hover:bg-stone-50"
                          >

                            {/* Booking ID */}
                            <td className="whitespace-nowrap p-4 font-mono text-xs font-semibold text-stone-500">
                              #{booking.bookingId || booking._id.slice(-6)}
                            </td>

                            {/* Customer */}
                            <td className="p-4">
                              <p className="font-bold text-stone-900">
                                {getCustomerName(booking)}
                              </p>

                              <p className="text-xs text-stone-500">
                                {booking.user?.email || "No email available"}
                              </p>
                            </td>

                            {/* Event */}
                            <td className="max-w-xs p-4 font-semibold text-[#3E000C]">
                              <span className="block truncate">
                                {booking.event?.eventName || "Event unavailable"}
                              </span>
                            </td>

                            {/* Quantity */}
                            <td className="p-4 font-bold text-stone-900">
                              {booking.quantity}
                            </td>

                            {/* Total Price */}
                            <td className="whitespace-nowrap p-4 font-black text-[#3E000C]">
                              ₹{booking.totalPrice}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusStyles.badge}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`}
                                />

                                {booking.status || "Confirmed"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="whitespace-nowrap p-4 text-right">
                              <Link
                                href={`/organizer/bookings/${booking._id}`}
                                className="inline-flex items-center justify-center rounded-xl border border-[#3E000C] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-[#3E000C] hover:text-[#FFECD1]"
                              >
                                View Details →
                              </Link>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>
              </div>

            </>
          )}

        </div>
      </main>
    </>
  );
}