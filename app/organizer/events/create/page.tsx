
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      // Get the organizer's token
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before creating an event.");
      }

      // Collect all form values
      const formData = new FormData(e.currentTarget);

      // Backend base URL from .env.local
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        throw new Error("Backend URL is not configured.");
      }

      // Send event details to the backend
      const response = await fetch(
        `${backendUrl}/events/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create event."
        );
      }

      // Show success and return to the dashboard
      alert("Event created successfully!");

      router.push("/organizer/dashboard");
      router.refresh();
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

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/organizer/dashboard"
            className="text-green-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-800">
            Create Event
          </h1>

          <p className="mt-2 text-gray-600">
            Add your event details below.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-5 rounded-xl bg-white p-6 shadow"
        >
          {/* Event Name */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Event Name *
            </label>

            <input
              type="text"
              name="eventName"
              placeholder="Enter event name"
              required
              className="w-full rounded-lg border p-3 text-gray-800 outline-none focus:border-green-700"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Category *
            </label>

            <select
              name="category"
              required
              defaultValue=""
              className="w-full rounded-lg border p-3 text-gray-800 focus:border-green-700"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Concert">Concert</option>
              <option value="Workshop">Workshop</option>
              <option value="Sports">Sports</option>
              <option value="Conference">Conference</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Date *
              </label>

              <input
                type="date"
                name="date"
                required
                className="w-full rounded-lg border p-3 text-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Time *
              </label>

              <input
                type="time"
                name="time"
                required
                className="w-full rounded-lg border p-3 text-gray-800"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Venue *
            </label>

            <input
              type="text"
              name="venue"
              placeholder="Enter venue name"
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Location *
            </label>

            <input
              type="text"
              name="location"
              placeholder="Enter city or location"
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              placeholder="Describe your event"
              rows={4}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>


      {/* Ticket Price and Total Seats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Ticket Price */}
        <div>
          <label className="mb-2 block font-medium text-gray-700">
            Ticket Price (₹) *
          </label>

          <input
            type="number"
            name="ticketPrice"
            min="0"
            step="0.01"
            placeholder="Enter ticket price"
            required
            className="w-full rounded-lg border p-3 text-gray-800"
          />
        </div>

        {/* Total Seats */}
        <div>
          <label
            htmlFor="totalSeats"
            className="mb-2 block font-medium text-gray-700"
          >
            Total Seats *
          </label>

          <input
            type="number"
            id="totalSeats"
            name="totalSeats"
            min="1"
            step="1"
            placeholder="Enter total seats"
            required
            className="w-full rounded-lg border p-3 text-gray-800"
          />
        </div>
      </div>


          {/* Event Image */}
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Event Image
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full rounded-lg border p-3 text-gray-700"
            />

            <p className="mt-1 text-sm text-gray-500">
              Select an image for your event.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>

        </form>
      </div>
    </main>
  );
}

