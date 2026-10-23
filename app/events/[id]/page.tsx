"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import type { EventType } from "@/types/event";

function EventDetailsContent() {
const params = useParams();
const id = params.id as string;

const [event, setEvent] = useState<EventType | null>(null);
const [loading, setLoading] = useState(true);
const [imageError, setImageError] = useState(false);

useEffect(() => {
const getEvent = async () => {
try {
const response = await api.get(`/events/${id}`);
setEvent(response.data.data);
} catch (error) {
console.error("Error fetching event:", error);
} finally {
setLoading(false);
}
};


if (id) {
  getEvent();
}


}, [id]);

if (loading) {
return <p className="p-8">Loading event...</p>;
}

if (!event) {
return ( <div className="p-8"> <p>Event not found.</p> <Link href="/events" className="mt-4 inline-block text-green-700">
Back to Events </Link> </div>
);
}

const imageUrl = event.image
? event.image.startsWith("http")
? event.image
: `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "")}${event.image.startsWith("/") ? "" : "/"}${event.image}`
: "";

return ( <div className="min-h-screen bg-[#F7FAF8] p-6"> <header className="mb-8 flex items-center justify-between"> <Link href="/user/dashboard"> <h1 className="text-2xl font-bold">
gather<span className="text-green-700">.</span> </h1> </Link>


    <Link
      href="/events"
      className="rounded bg-green-700 px-4 py-2 text-white"
    >
      All Events
    </Link>
  </header>

  <div className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow">
    {imageUrl && !imageError ? (
      <img
        src={imageUrl}
        alt={event.eventName}
        className="h-72 w-full object-cover"
        onError={() => setImageError(true)}
      />
    ) : (
      <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-500">
        {event.image
          ? "Event image could not be loaded"
          : "No event image available"}
      </div>
    )}

    <div className="p-8">
      <h2 className="text-3xl font-bold">{event.eventName}</h2>

      <p className="mt-3 text-green-700">{event.category}</p>

      <p className="mt-4">
        <strong>Date:</strong>{" "}
        {new Date(event.date).toLocaleDateString("en-IN")}
      </p>

      {event.time && (
        <p className="mt-2">
          <strong>Time:</strong> {event.time}
        </p>
      )}

      {event.venue && (
        <p className="mt-2">
          <strong>Venue:</strong> {event.venue}
        </p>
      )}

      {event.description && (
        <p className="mt-4 text-gray-600">{event.description}</p>
      )}

      {event.ticketPrice !== undefined && (
        <p className="mt-5 text-xl font-bold text-green-700">
          {event.ticketPrice === 0 ? "Free" : `₹${event.ticketPrice}`}
        </p>
      )}

      <button
        onClick={() => alert("Ticket booking will be added next!")}
        className="mt-6 rounded bg-green-700 px-6 py-3 text-white hover:bg-green-800"
      >
        Book Tickets
      </button>
    </div>
  </div>
</div>


);
}

export default function EventDetailsPage() {
return (
<Suspense fallback={<p className="p-8">Loading event...</p>}> <EventDetailsContent /> </Suspense>
);
}
