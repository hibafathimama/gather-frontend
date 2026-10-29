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

  // Download the report of bookings in CSV format
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
        ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim()
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
        <div className="mx-auto max-w-7xl">
          
          {/* Top Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-2 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Organizer Portal
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Manage Bookings
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Monitor ticket purchases, track customer engagement, and export data reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={downloadBookingReport}
                disabled={loading || bookings.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
              >
                <span>📥</span> Download CSV Report
              </button>

              <Link
                href="/organizer/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-[#FFECD1]/40"
              >
                <span>←</span> Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Metrics Card */}
          <section className="mb-8 rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Total Bookings Secured
                </p>
                <p className="editorial-heading mt-2 text-4xl font-bold tracking-tight text-[#3E000C]">
                  {loading ? "..." : bookings.length}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3E000C]/10 text-2xl text-[#3E000C]">
                🎫
              </div>
            </div>
          </section>

          {/* Loading, Error & Empty States */}
          {loading && (
            <div className="py-20 text-center text-stone-600 font-medium">
              Loading booking records...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600 shadow-sm">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-16 text-center shadow-sm">
              <div className="text-4xl mb-3">📭</div>
              <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                No bookings found
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Customer bookings for your scheduled events will display here once completed.
              </p>
            </div>
          )}

          {/* Bookings Data Table */}
          {!loading && !error && bookings.length > 0 && (
            <div className="overflow-x-auto rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#3E000C] text-[#FFECD1]">
                  <tr>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-4.5 text-xs font-bold uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 text-sm">
                  {bookings.map((booking) => (
                    <tr 
                      key={booking._id} 
                      className="transition-colors hover:bg-stone-50"
                    >
                      <td className="p-4.5 font-mono text-xs font-semibold text-stone-500">
                        #{booking.bookingId || booking._id.slice(-6)}
                      </td>

                      <td className="p-4.5">
                        <p className="font-bold text-stone-900">
                          {booking.user
                            ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() ||
                              "Unknown customer"
                            : "Unknown customer"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {booking.user?.email || "No email available"}
                        </p>
                      </td>

                      <td className="p-4.5 font-semibold text-[#3E000C]">
                        {booking.event?.eventName || "Event unavailable"}
                      </td>

                      <td className="p-4.5 font-bold text-stone-900">
                        {booking.quantity}
                      </td>

                      <td className="p-4.5 font-black text-[#3E000C]">
                        ₹{booking.totalPrice}
                      </td>

                      <td className="p-4.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            booking.status?.toLowerCase() === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${booking.status?.toLowerCase() === "cancelled" ? "bg-red-500" : "bg-emerald-500"}`} />
                          {booking.status || "Confirmed"}
                        </span>
                      </td>

                      <td className="p-4.5 text-right">
                        <Link
                          href={`/organizer/bookings/${booking._id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-white border border-[#3E000C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-[#3E000C] hover:text-[#FFECD1]"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}