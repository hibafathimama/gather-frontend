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


  //download the report of bookings in csv format

const downloadBookingReport = () => {
  if (bookings.length === 0) {
    alert("There are no bookings to download.");
    return;
  }

  // CSV column headings
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

  // Escape special characters so the CSV remains valid
  const escapeCSV = (value: string | number) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  // Convert booking data into CSV rows
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

  // Add BOM so Excel handles UTF-8 text correctly
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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">
            Manage Bookings
            </h1>

            <p className="mt-2 text-gray-600">
            View and download bookings for your events.
            </p>
        </div>

        <div className="flex flex-wrap gap-3">
            <button
            type="button"
            onClick={downloadBookingReport}
            disabled={loading || bookings.length === 0}
            className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
            Download CSV Report
            </button>

            <Link
            href="/organizer/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
            Back to Dashboard
            </Link>
        </div>
        </div>




        <section className="mb-6 rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Total Bookings</p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {loading ? "..." : bookings.length}
          </p>
        </section>

        {loading && (
          <p className="text-gray-600">Loading bookings...</p>
        )}

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No bookings yet
            </h2>

            <p className="mt-2 text-gray-600">
              Bookings for your events will appear here.
            </p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Booking ID
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Event
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Tickets
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Total Price
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700">
                    Action
                    </th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="border-t">
                    <td className="p-4 text-sm text-gray-700">
                      {booking.bookingId || booking._id}
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-gray-800">
                        {booking.user
                          ? `${booking.user.firstName || ""} ${booking.user.lastName || ""}`.trim() ||
                            "Unknown customer"
                          : "Unknown customer"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {booking.user?.email || "No email"}
                      </p>
                    </td>

                    <td className="p-4 text-gray-700">
                      {booking.event?.eventName || "Event unavailable"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {booking.quantity}
                    </td>

                    <td className="p-4 font-semibold text-gray-800">
                      ₹{booking.totalPrice}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {booking.status || "Confirmed"}
                      </span>
                    </td>
                    <td className="p-4">
                    <Link
                        href={`/organizer/bookings/${booking._id}`}
                        className="font-medium text-blue-700 hover:underline"
                    >
                        View Details
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
  );
}
