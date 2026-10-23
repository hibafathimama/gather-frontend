
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EventType } from "@/types/event";

interface EventDetailsType extends EventType {
  organizer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(
          `${backendUrl}/events/${id}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch event.");
        }

        // Supports an API response containing either { data: event }
        // or the event object directly.
        setEvent(result.data ?? result);
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

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="p-8 text-center text-gray-700">
        Loading event details...
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="p-8 text-center">
        <p className="mb-4 text-red-600">
          {error || "Event not found."}
        </p>

        <Link
          href="/organizer/dashboard"
          className="text-green-700 hover:underline"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : `${(process.env.NEXT_PUBLIC_BACKEND_URL || "")
          .replace(/\/api\/?$/, "")}${event.image}`
    : null;

  return (
    
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/organizer/dashboard"
          className="mb-6 inline-block font-medium text-green-700 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <article className="overflow-hidden rounded-xl bg-white shadow">

          {imageUrl && (
            <img
              src={imageUrl}
              alt={event.eventName}
              className="h-64 w-full object-cover sm:h-96"
            />
          )}

          <div className="p-6 sm:p-8">

            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
              {event.category}
            </p>

            <h1 className="mb-6 text-3xl font-bold text-gray-900">
              {event.eventName}
            </h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="mt-1 font-medium text-gray-800">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="mt-1 font-medium text-gray-800">
                  {event.time || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Venue</p>
                <p className="mt-1 font-medium text-gray-800">
                  {event.venue || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 font-medium text-gray-800">
                  {event.location || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ticket Price</p>
                <p className="mt-1 text-2xl font-bold text-green-700">
                  ₹{event.ticketPrice}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Available Seats</p>
                <p className="mt-1 font-medium text-gray-800">
                  {event.availableSeats}
                </p>
              </div>

            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                About This Event
              </h2>

              <p className="whitespace-pre-line leading-7 text-gray-700">
                {event.description || "No description available."}
              </p>
            </div>

            {event.organizer && (
              <div className="mt-8 border-t pt-6">
                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  Organizer Information
                </h2>

                <p className="text-gray-700">
                  {event.organizer.firstName}{" "}
                  {event.organizer.lastName}
                </p>

                {event.organizer.email && (
                  <p className="mt-1 text-gray-600">
                    {event.organizer.email}
                  </p>
                )}
              </div>
            )}

              <Link
                href={`/organizer/events/edit/${event._id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                Edit
              </Link>
              
          </div>
        </article>
      </div>
    </main>
  );
}
