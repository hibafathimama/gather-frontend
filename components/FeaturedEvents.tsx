"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import api from "@/lib/api";
import type { EventType } from "@/types/event";

export default function FeaturedEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch actual events from your backend.
        const response = await api.get("/events/getevent", {
          params: {
            page: 1,
            limit: 3,
          },
        });

        const result = response.data;

        if (result.status === false) {
          throw new Error(result.message || "Failed to fetch events.");
        }

        const eventList = Array.isArray(result.data)
          ? result.data
          : [];

        setEvents(eventList);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load events."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const getImageUrl = (image?: string | null) => {
    if (!image) return "";

    // Cloudinary URLs can be used directly.
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";

    return `${backendUrl}/${image.replace(/^\/+/, "")}`;
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-800">
            Something for everyone
          </p>

          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Find your next experience
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-stone-600">
            Discover music, art, sports, and community experiences.
            Browse available events to find the right one for you.
          </p>
        </div>

        {loading ? (
          <p className="py-10 text-center text-stone-600">
            Loading featured events...
          </p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl bg-white p-6 text-center text-red-700"
          >
            {error}
          </p>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-[#F1DDC7] bg-white p-10 text-center">
            <p className="font-semibold">
              No featured events available yet.
            </p>

            <p className="mt-2 text-sm text-stone-600">
              Check back when organizers publish new events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((event) => {
              const imageUrl = getImageUrl(event.image);

              return (
                <article
                  key={event._id}
                  className="overflow-hidden rounded-2xl border border-[#F1DDC7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Actual event image */}
                  <div className="h-56 overflow-hidden bg-gradient-to-br from-rose-900 to-orange-700">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={event.eventName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-white">
                        <CalendarDays className="h-16 w-16" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {event.category && (
                      <span className="rounded-full bg-[#FFF0DE] px-3 py-1 text-xs font-semibold text-[#7B351F]">
                        {event.category}
                      </span>
                    )}

                    <h3 className="mt-4 text-xl font-bold">
                      {event.eventName}
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-stone-600">
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-orange-800" />

                        {event.date
                          ? new Date(event.date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Date not available"}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-orange-800" />

                        {event.location ||
                          event.venue ||
                          "Location not available"}
                      </p>
                    </div>

                    <Link
                      href={`/events/${event._id}`}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3E000C] px-4 py-3 font-semibold text-white transition hover:bg-[#5A1020]"
                    >
                      View Event
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-xl border border-[#3E000C] px-6 py-3 font-semibold transition hover:bg-[#3E000C] hover:text-white"
          >
            View All Events
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}