"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

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

return ( <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-8"> <div className="mx-auto max-w-7xl"> <div className="mb-8 flex flex-wrap items-center justify-between gap-4"> <div> <h1 className="text-3xl font-bold">Manage Bookings</h1> <p className="mt-2 text-gray-600">
View customer bookings and ticket details. </p> </div>

      <Link
        href="/admin/dashboard"
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
      >
        Back to Dashboard
      </Link>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Bookings</p>
        <p className="mt-2 text-3xl font-bold">{bookings.length}</p>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Matching Bookings</p>
        <p className="mt-2 text-3xl font-bold">
          {filteredBookings.length}
        </p>
      </div>
    </div>

    <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <label
        htmlFor="booking-search"
        className="mb-2 block font-medium"
      >
        Search bookings
      </label>

      <input
        id="booking-search"
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by booking ID, customer, or event..."
        className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading bookings...
        </p>
      ) : filteredBookings.length === 0 ? (
        <p className="py-10 text-center text-gray-500">
          {search
            ? "No matching bookings found."
            : "No bookings found."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Tickets</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Booked On</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => {
                const customerName = booking.user
                  ? `${booking.user.firstName || ""} ${
                      booking.user.lastName || ""
                    }`.trim() || "Unknown customer"
                  : "User unavailable";

                return (
                  <tr
                    key={booking._id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 font-medium">
                      {booking.bookingId || booking._id}
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">{customerName}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {booking.user?.email || "Email unavailable"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {booking.event?.eventName || "Event unavailable"}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(booking.event?.date)}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p>{booking.quantity ?? "Not available"}</p>
                      {booking.ticketType && (
                        <p className="mt-1 text-sm capitalize text-gray-500">
                          {booking.ticketType}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {formatAmount(booking.totalPrice)}
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(booking.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm capitalize text-blue-700">
                        {booking.status || "Confirmed"}
                      </span>
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

);
}
