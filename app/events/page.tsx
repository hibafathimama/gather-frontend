"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import type { EventType } from "@/types/event";

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view events.");
          setEvents([]);
          return;
        }

        const response = await api.get("/events/getevent", {
          params: {
            page,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const result = response.data;

        if (result.status === false) {
          throw new Error(result.message || "Failed to fetch events.");
        }

        const eventList = Array.isArray(result.data) ? result.data : [];

        setEvents(eventList);
        setTotalPages(result.pagination?.totalPages || 1);
      } catch (err: unknown) {
        console.error("Error fetching events:", err);

        setEvents([]);

        if (typeof err === "object" && err !== null && "response" in err) {
          const apiError = err as {
            response?: {
              data?: { message?: string };
              status?: number;
            };
          };

          setError(
            apiError.response?.data?.message ||
              `Failed to fetch events. Status: ${
                apiError.response?.status || "unknown"
              }`
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong while fetching events.");
        }
      } finally {
        setLoading(false);
      }
    };

    getAllEvents();
  }, [page]);

  const getImageUrl = (image?: string | null) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    const imagePath = image.startsWith("/") ? image : `/${image}`;

    return `${backendUrl}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Navigation */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-6">
          <Link href="/user/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-lg font-bold text-[#FFECD1] shadow-sm transition-transform group-hover:scale-105">
              ✦
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#3E000C]">
                Gather<span className="text-[#3E000C]/70">.</span>
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
                Explore Platform
              </p>
            </div>
          </Link>

          <Link
            href="/user/dashboard"
            className="rounded-xl border border-[#3E000C]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#3E000C] transition-all hover:bg-[#3E000C] hover:text-white shadow-sm"
          >
            Dashboard
          </Link>
        </header>

        {/* Page Title Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#3E000C]">
            Explore All Events
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Discover upcoming live experiences and find your next memory.
          </p>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-20 text-center text-stone-600 font-medium">
            Loading events...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-12 text-center shadow-sm">
            <p className="text-stone-500 font-medium">No active events available.</p>
          </div>
        ) : (
          <>
            {/* Event Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const imageUrl = getImageUrl(event.image);

                return (
                  <div
                    key={event._id}
                    className="group overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between"
                  >
                    {/* Event Image & Floating Badges */}
                    <div className="relative h-52 w-full overflow-hidden bg-stone-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.eventName}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            console.error("Failed to load event image:", imageUrl);
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-stone-400">
                          No event image available
                        </div>
                      )}

                      {/* Category Badge */}
                      {event.category && (
                        <span className="absolute top-3 left-3 rounded-lg bg-[#3E000C]/90 px-3 py-1 text-xs font-bold tracking-wide text-[#FFECD1] backdrop-blur-md shadow-sm">
                          {event.category}
                        </span>
                      )}

                      {/* Ticket Price Badge */}
                      <span className="absolute top-3 right-3 rounded-lg bg-white/95 px-3 py-1 text-xs font-extrabold text-[#3E000C] backdrop-blur-md shadow-sm">
                        {event.ticketPrice === undefined || event.ticketPrice === 0
                          ? "Free"
                          : `₹${event.ticketPrice}`}
                      </span>
                    </div>

                    {/* Card Body Details */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                          <span>📅 {new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          {event.venue && (
                            <span className="truncate max-w-[130px]" title={event.venue}>
                              📍 {event.venue}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold tracking-tight text-[#3E000C] line-clamp-1">
                          {event.eventName}
                        </h3>

                        {event.time && (
                          <p className="text-xs text-stone-600 font-medium">🕒 Time: {event.time}</p>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="pt-3 border-t border-stone-100">
                        <Link
                          href={`/events/${event._id}`}
                          className="flex w-full items-center justify-center rounded-xl bg-[#3E000C] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-8">
                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1 || loading}
                  className="rounded-xl border border-[#3E000C] bg-white px-6 py-3 text-sm font-bold text-[#3E000C] shadow-sm transition-all hover:bg-[#3E000C]/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="font-bold text-stone-800 text-sm">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === totalPages || loading}
                  className="rounded-xl bg-[#3E000C] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}