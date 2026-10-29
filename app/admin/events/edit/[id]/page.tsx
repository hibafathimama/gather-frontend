"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface EventForm {
  eventName: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  ticketPrice: string;
  totalSeats: string;
  availableSeats: string;
}

const initialForm: EventForm = {
  eventName: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  description: "",
  ticketPrice: "0",
  totalSeats: "1",
  availableSeats: "0",
};

export default function AdminEditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/admin/events/${eventId}`);
        const event = response.data.data;

        if (!event) {
          throw new Error("Event details were not found.");
        }

        setForm({
          eventName: event.eventName || event.name || "",
          category: event.category || "",
          date: event.date
            ? new Date(event.date).toISOString().slice(0, 10)
            : "",
          time: event.time || "",
          venue: event.venue || "",
          location: event.location || "",
          description: event.description || "",
          ticketPrice: String(event.ticketPrice ?? 0),
          totalSeats: String(event.totalSeats ?? 1),
          availableSeats: String(event.availableSeats ?? 0),
        });
      } catch (err: unknown) {
        const errorMessage =
          typeof err === "object" && err !== null && "response" in err
            ? String(
                (
                  err as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message || "Failed to load event."
              )
            : err instanceof Error
              ? err.message
              : "Unable to connect to the server.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const price = Number(form.ticketPrice);
    const totalSeats = Number(form.totalSeats);
    const availableSeats = Number(form.availableSeats);

    if (!Number.isFinite(price) || price < 0) {
      setError("Ticket price must be zero or greater.");
      return;
    }

    if (!Number.isInteger(totalSeats) || totalSeats < 1) {
      setError("Total seats must be at least 1.");
      return;
    }

    if (
      !Number.isInteger(availableSeats) ||
      availableSeats < 0
    ) {
      setError("Available seats must be a non-negative whole number.");
      return;
    }

    if (availableSeats > totalSeats) {
      setError("Available seats cannot exceed total seats.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/admin/events/${eventId}`, {
        eventName: form.eventName.trim(),
        category: form.category.trim(),
        date: form.date,
        time: form.time,
        venue: form.venue.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        ticketPrice: price,
        totalSeats,
        availableSeats,
      });

      setMessage(
        response.data.message || "Event updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/events");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to update event."
            )
          : err instanceof Error
            ? err.message
            : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8 text-center text-gray-600">
        Loading event details...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="mt-2 text-gray-600">
              Update the event information below.
            </p>
          </div>

          <Link
            href="/admin/events"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Back to Events
          </Link>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-50 p-3 text-green-700"
          >
            {message}
          </p>
        )}

        {!error || form.eventName ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl bg-white p-5 shadow-sm sm:p-8"
          >
            <div>
              <label
                htmlFor="eventName"
                className="mb-2 block font-medium"
              >
                Event Name
              </label>
              <input
                id="eventName"
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block font-medium"
              >
                Category
              </label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block font-medium"
                >
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="mb-2 block font-medium"
                >
                  Time
                </label>
                <input
                  id="time"
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="venue"
                className="mb-2 block font-medium"
              >
                Venue
              </label>
              <input
                id="venue"
                name="venue"
                value={form.venue}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block font-medium"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ticketPrice"
                  className="mb-2 block font-medium"
                >
                  Ticket Price (₹)
                </label>
                <input
                  id="ticketPrice"
                  name="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ticketPrice}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="totalSeats"
                  className="mb-2 block font-medium"
                >
                  Total Seats
                </label>
                <input
                  id="totalSeats"
                  name="totalSeats"
                  type="number"
                  min="1"
                  step="1"
                  value={form.totalSeats}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label
                  htmlFor="availableSeats"
                  className="mb-2 block font-medium"
                >
                  Available Seats
                </label>
                <input
                  id="availableSeats"
                  name="availableSeats"
                  type="number"
                  min="0"
                  step="1"
                  value={form.availableSeats}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
