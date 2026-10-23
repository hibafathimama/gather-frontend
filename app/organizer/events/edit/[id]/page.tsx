"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface EventFormData {
  eventName: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  ticketPrice: string;
  availableSeats: string;
}

const emptyForm: EventFormData = {
  eventName: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  description: "",
  ticketPrice: "",
  availableSeats: "",
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [formData, setFormData] =
    useState<EventFormData>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Load the existing event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        // Get the event details
        const response = await fetch(
        `${backendUrl}/events/${eventId}`,
        {
            method: "GET",
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

const responseText = await response.text();

console.log("Response status:", response.status);
console.log("Response URL:", response.url);
console.log("Response:", responseText);

const result = JSON.parse(responseText);
        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load event."
          );
        }

        // Support common API response structures
        const event = result.data ?? result.event ?? result;

        if (!event || !event.eventName) {
          throw new Error("Event details were not found.");
        }

        // Convert the date to YYYY-MM-DD for the date input
        const dateValue = event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "";

        setFormData({
          eventName: event.eventName ?? "",
          category: event.category ?? "",
          date: dateValue,
          time: event.time ?? "",
          venue: event.venue ?? "",
          location: event.location ?? "",
          description: event.description ?? "",
          ticketPrice: String(event.ticketPrice ?? ""),
          availableSeats: String(event.availableSeats ?? ""),
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, backendUrl]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update the event
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      if (!backendUrl) {
        throw new Error("Backend URL is not configured.");
      }

      const response = await fetch(
        `${backendUrl}/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventName: formData.eventName,
            category: formData.category,
            date: formData.date,
            time: formData.time,
            venue: formData.venue,
            location: formData.location,
            description: formData.description,
            ticketPrice: Number(formData.ticketPrice),
            availableSeats: Number(formData.availableSeats),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update event."
        );
      }

      alert("Event updated successfully!");

      router.push("/organizer/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-gray-600">Loading event details...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/organizer/dashboard"
            className="text-green-700 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-800">
            Edit Event
          </h1>

          <p className="mt-2 text-gray-600">
            Update your event details below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl bg-white p-6 shadow"
        >
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Event Name *
            </label>

            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
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
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-3 text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Venue *
            </label>

            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Location *
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full rounded-lg border p-3 text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Ticket Price (₹) *
              </label>

              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border p-3 text-gray-800"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Available Seats *
              </label>

              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="0"
                step="1"
                required
                className="w-full rounded-lg border p-3 text-gray-800"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Updating Event..." : "Update Event"}
          </button>
        </form>
      </div>
    </main>
  );
}