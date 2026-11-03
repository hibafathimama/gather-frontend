"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Ticket,
  Heart,
  LayoutDashboard,
  CalendarDays,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CalendarX2,
} from "lucide-react";

import api from "@/lib/api";
import type { EventType } from "@/types/event";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [events, setEvents] = useState<EventType[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(
    null
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch events from the backend.
  useEffect(() => {
    const getAllEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/events/getevent", {
          params: {
            page,
            limit: 10,
          },
        });

        const result = response.data;

        if (result.status === false) {
          throw new Error(result.message || "Failed to fetch events.");
        }

        const eventList = Array.isArray(result.data) ? result.data : [];

        setEvents(eventList);

        // Update pagination if the backend provides pagination information.
        const pages =
          result.totalPages ??
          result.pagination?.totalPages ??
          result.data?.totalPages;

        if (typeof pages === "number" && pages > 0) {
          setTotalPages(pages);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching events."
        );
      } finally {
        setLoading(false);
      }
    };

    getAllEvents();
  }, [page]);

  // Match homepage categories with possible database category names.
  const categoryAliases: Record<string, string[]> = {
    "music & concerts": [
      "music & concerts",
      "music",
      "concert",
      "concerts",
    ],
    "arts & culture": [
      "arts & culture",
      "arts",
      "art",
      "culture",
    ],
    sports: ["sports", "sport"],
    community: ["community"],
  };

  // Filter the events according to the selected category.
  const filteredEvents = useMemo(() => {
    if (!selectedCategory) {
      return events;
    }

    const selected = selectedCategory.trim().toLowerCase();

    const matchingCategories = categoryAliases[selected] || [selected];

    return events.filter((event) => {
      const eventCategory = event.category?.trim().toLowerCase() || "";

      return matchingCategories.includes(eventCategory);
    });
  }, [events, selectedCategory]);

  // Wishlist functionality.
  const handleFavorite = async (eventId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setFavoriteMessage("Please log in to manage your wishlist.");
      return;
    }

    try {
      setUpdatingFavoriteId(eventId);
      setFavoriteMessage("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (favoriteIds.includes(eventId)) {
        await api.delete(`/favorites/${eventId}`, {
          headers,
          withCredentials: true,
        });

        setFavoriteIds((previous) =>
          previous.filter((id) => id !== eventId)
        );

        setFavoriteMessage("Event removed from your wishlist.");
      } else {
        await api.post(
          "/favorites",
          { eventId },
          {
            headers,
            withCredentials: true,
          }
        );

        setFavoriteIds((previous) =>
          previous.includes(eventId) ? previous : [...previous, eventId]
        );

        setFavoriteMessage("Event added to your wishlist!");
      }
    } catch (err: unknown) {
      console.error("Wishlist update failed:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: {
            data?: { message?: string };
          };
        };

        setFavoriteMessage(
          apiError.response?.data?.message ||
            "Unable to update your wishlist."
        );
      } else {
        setFavoriteMessage("Unable to connect to the server.");
      }
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  // Handle Cloudinary URLs and older local image paths.
  const getImageUrl = (image?: string | null) => {
    if (!image) return "";

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000";

    // Replace old localhost URLs with the configured backend URL.
    if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\//i.test(image)) {
      return image.replace(
        /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
        backendUrl
      );
    }

    // Cloudinary and other complete URLs should remain unchanged.
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Convert a relative image path into an absolute URL.
    return `${backendUrl}/${image.replace(/^\/+/, "")}`;
  };

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight text-[#3E000C]">
                Gather
              </h1>
              <p className="text-xs text-stone-600">Event platform</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/user/wishlist"
              aria-label="My wishlist"
              title="My wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition-colors hover:border-[#3E000C] hover:bg-[#FFECD1]/40"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href="/user/dashboard"
              className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Page title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
            {selectedCategory
              ? `${selectedCategory} Events`
              : "Explore Events"}
          </h2>

          <p className="mt-1 text-sm text-stone-600 sm:text-base">
            {selectedCategory
              ? `Explore events in the ${selectedCategory} category.`
              : "Find upcoming concerts, workshops and seminars near you."}
          </p>

          {selectedCategory && (
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-1 rounded-lg border border-[#3E000C]/25 bg-white px-3 py-2 text-sm font-medium text-[#3E000C] transition hover:bg-[#3E000C] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              View All Events
            </Link>
          )}
        </div>

        {/* Wishlist status message */}
        {favoriteMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mb-5 rounded-lg border border-[#F5D8B3] bg-white px-4 py-3 text-sm text-[#3E000C]"
          >
            {favoriteMessage}
          </p>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading events...
          </div>
        ) : error ? (
          /* Error state */
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
            <CalendarX2 className="mx-auto mb-3 h-8 w-8 text-[#3E000C]/60" />

            <p className="text-stone-600">
              {selectedCategory
                ? `No events found in the ${selectedCategory} category on this page.`
                : "There are no active events right now. Check back soon."}
            </p>

            {selectedCategory && (
              <Link
                href="/events"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
              >
                Explore All Events
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Event cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const imageUrl = getImageUrl(event.image);
                const isFavorite = favoriteIds.includes(event._id);
                const isUpdating = updatingFavoriteId === event._id;

                return (
                  <article
                    key={event._id}
                    className="flex flex-col overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Event image */}
                    <div className="relative h-64 w-full overflow-hidden bg-stone-100 sm:h-72 lg:h-80">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.eventName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(
                              "Failed to load event image:",
                              imageUrl
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-stone-500">
                          No image available
                        </div>
                      )}

                      {event.category && (
                        <span className="absolute left-3 top-3 rounded-md bg-[#3E000C] px-2.5 py-1 text-xs font-medium text-[#FFECD1]">
                          {event.category}
                        </span>
                      )}

                      <span className="absolute right-3 top-3 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-[#3E000C] shadow-sm">
                        {event.ticketPrice === undefined ||
                        event.ticketPrice === 0
                          ? "Free"
                          : `₹${event.ticketPrice}`}
                      </span>

                      {/* Wishlist button */}
                      <button
                        type="button"
                        onClick={() => handleFavorite(event._id)}
                        disabled={isUpdating}
                        aria-label={
                          isFavorite
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        aria-pressed={isFavorite}
                        title={
                          isFavorite
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isFavorite
                              ? "fill-red-600 text-red-600"
                              : "text-stone-500"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Event details */}
                    <div className="flex flex-1 flex-col gap-4 p-5">
                      <div className="space-y-2">
                        <h3
                          className="line-clamp-1 text-lg font-semibold text-[#3E000C]"
                          title={event.eventName}
                        >
                          {event.eventName}
                        </h3>

                        <div className="flex flex-col gap-1 text-sm text-stone-600">
                          <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                            {new Date(event.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                          {event.time && (
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                              {event.time}
                            </span>
                          )}

                          {event.venue && (
                            <span className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                              <span className="truncate" title={event.venue}>
                                {event.venue}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/events/${event._id}`}
                        className="mt-auto flex w-full items-center justify-center rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                      >
                        View details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-8">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#3E000C] bg-white px-4 py-2.5 text-sm font-semibold text-[#3E000C] transition hover:bg-[#3E000C]/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="text-sm font-medium text-stone-700">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
