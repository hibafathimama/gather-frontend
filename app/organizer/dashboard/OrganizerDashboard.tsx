"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {EventType} from "@/types/event";
import OrganizerHeader from "@/components/OrganizerHeader";

export default function OrganizerDashboard() {

const [events,setEvents]=useState<EventType[]>([]);
const [loading,setLoading]=useState<boolean>(true);
const [error,setError]=useState<string | null>(null);

useEffect(()=>{

    const fetchMyEvents=async()=>{
        try{
            const token=localStorage.getItem("token");

            if(!token){
                setError("No token found. Please log in.");
                return;
            }
            const backendUrl=process.env.NEXT_PUBLIC_BACKEND_URL;

            const response=await fetch(`${backendUrl}/events/my-events`,{
                method:"GET",
                headers:{
                    "Authorization":`Bearer ${token}`
                }
            });
            const result=await response.json();
            if(!response.ok){
                throw new Error(result.message || "Failed to fetch events");
            }
            setEvents(result.data || []);

        }catch(err:unknown){
            setError(err instanceof Error ? err.message : "An unknown error occurred");
    }finally{
        setLoading(false);
    }   
};
fetchMyEvents();

},[]);

//delete event
const handleDelete = async (eventId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this event?"
  );

  if (!confirmed) return;

  try {
    const token = localStorage.getItem("token");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!token) {
      alert("Please log in again.");
      return;
    }

    if (!backendUrl) {
      alert("Backend URL is not configured.");
      return;
    }

    const response = await fetch(`${backendUrl}/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete event.");
    }

    setEvents((previousEvents) =>
      previousEvents.filter((event) => event._id !== eventId)
    );

    alert("Event deleted successfully!");
  } catch (error: unknown) {
    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong while deleting the event."
    );
  }
};

return (
  <>
 <OrganizerHeader />
<main className="min-h-screen bg-gray-100 p-6">
<div className="mx-auto max-w-6xl">
<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
<div>
<h1 className="text-3xl font-bold text-gray-800">
Organizer Dashboard
</h1>

        <p className="mt-2 text-gray-600">
          Manage your events in one place.
        </p>
      </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/organizer/bookings"
            className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
          >
            Manage Bookings
          </Link>

          <Link
            href="/organizer/events/create"
            className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
          >
            + Create Event
          </Link>
        </div>

    </div>

    <section className="mb-8 rounded-xl bg-white p-6 shadow">
      <p className="text-sm text-gray-500">Total Events</p>

      <p className="mt-2 text-3xl font-bold text-gray-800">
        {loading ? "..." : events.length}
      </p>
    </section>

    <h2 className="mb-5 text-2xl font-semibold text-gray-800">
      My Events
    </h2>

    {loading && (
      <p className="text-gray-600">Loading your events...</p>
    )}

    {error && (
      <p className="rounded-lg bg-red-100 p-4 text-red-700">
        {error}
      </p>
    )}

    {!loading && !error && events.length === 0 && (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="mb-4 text-gray-600">
          You haven't created any events yet.
        </p>

        <Link
          href="/organizer/events/create"
          className="font-medium text-green-700 hover:underline"
        >
          Create your first event
        </Link>
      </div>
    )}

    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <article
          key={event._id}
          className="overflow-hidden rounded-xl bg-white shadow"
        >
          {event.image && (
            <img
              src={
                event.image.startsWith("http")
                  ? event.image
                  : `${(process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(
                      /\/api\/?$/,
                      ""
                    )}${event.image}`
              }
              alt={event.eventName}
              className="h-48 w-full object-cover"
            />
          )}

          <div className="p-5">
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              {event.eventName}
            </h3>

            <p className="mb-3 text-sm text-gray-500">
              {event.category}
            </p>

            <p className="mb-2 text-gray-700">
              <strong>Date:</strong>{" "}
              {new Date(event.date).toLocaleDateString()}
            </p>

            <p className="mb-2 text-gray-700">
              <strong>Time:</strong> {event.time}
            </p>

            <p className="mb-2 text-gray-700">
              <strong>Venue:</strong> {event.venue}
            </p>

            <p className="mb-2 text-gray-700">
              <strong>Location:</strong> {event.location}
            </p>

            <p className="mb-3 text-lg font-bold text-green-700">
              ₹{event.ticketPrice}
            </p>

            <div className="mt-3">
              <p className="text-sm text-gray-600">
                Available Seats:{" "}
                <span className="font-semibold text-gray-900">
                  {event.availableSeats}
                </span>
              </p>
              <p>
              Total Seats: <strong>{event.totalSeats ?? event.availableSeats}</strong>
            </p>

            <p>
              Tickets Sold:{" "}
              <strong>
                {(event.totalSeats ?? event.availableSeats) - event.availableSeats}
              </strong>
            </p>

              {event.availableSeats > 0 ? (
                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Tickets Available
                </span>
              ) : (
                <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  Sold Out
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4">
              {/* View Event */}
              <Link
                href={`/organizer/events/${event._id}`}
                className="font-medium text-green-700 hover:underline"
              >
                View Event
              </Link>

              {/* Edit Event */} 
              <Link
                href={`/organizer/events/edit/${event._id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                Edit
              </Link>


              {/* Delete Event */}
              <button
                type="button"
                onClick={() => handleDelete(event._id)}
                className="font-medium text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
</main>
</>
);



}