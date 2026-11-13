"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  AlertCircle,
  CalendarX2,
  ArrowRight,
  Check,
} from "lucide-react";

import api from "@/lib/api";
import type { EventType } from "@/types/event";

const CATEGORY_CHIPS = [
  "Music & Concerts",
  "Arts & Culture",
  "Sports",
  "Community",
];

/* Fades + slides children in when they scroll into view */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

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

  // Check whether an event has expired.
  const isEventActive = (event: EventType) => {
    const eventDate = new Date(event.date);

    if (isNaN(eventDate.getTime())) {
      return false;
    }

    const now = new Date();

    // Get event date without time.
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    // Get today's date without time.
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Hide events from previous dates.
    if (eventDay < today) {
      return false;
    }

    // Display events scheduled for future dates.
    if (eventDay > today) {
      return true;
    }

    // If the event has no time, display it until the end of today.
    if (!event.time) {
      return true;
    }

    // Extract event time (12-hour or 24-hour format).
    const timeMatch = event.time.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i
    );

    if (!timeMatch) {
      return true;
    }

    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const period = timeMatch[3]?.toUpperCase();

    // Convert 12-hour time into 24-hour time.
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    const eventTime = new Date(eventDay);
    eventTime.setHours(hours, minutes, 0, 0);

    // Hide events if their start time has passed.
    return eventTime > now;
  };

  // Fetch events from the backend.
  useEffect(() => {
    const getAllEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/events/getevent", {
          params: {
            page,
            // 9 events per page = 3 rows of 3
            limit: 9,
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
        } else {
          setTotalPages(1);
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

  // Wishlist toast disappears by itself
  useEffect(() => {
    if (!favoriteMessage) return;
    const timer = setTimeout(() => setFavoriteMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [favoriteMessage]);

  // Match homepage categories with possible database category names.
  const categoryAliases: Record<string, string[]> = {
    "music & concerts": ["music & concerts", "music", "concert", "concerts"],
    "arts & culture": ["arts & culture", "arts", "art", "culture"],
    sports: ["sports", "sport"],
    community: ["community"],
  };

  // Filter expired events first, then apply category filtering.
  const filteredEvents = useMemo(() => {
    // Remove expired events.
    const activeEvents = events.filter(isEventActive);

    // Display all active events if no category is selected.
    if (!selectedCategory) {
      return activeEvents;
    }

    const selected = selectedCategory.trim().toLowerCase();

    const matchingCategories = categoryAliases[selected] || [selected];

    // Apply category filtering.
    return activeEvents.filter((event) => {
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

        setFavoriteIds((previous) => previous.filter((id) => id !== eventId));

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
          apiError.response?.data?.message || "Unable to update your wishlist."
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

  // Numbered pagination with ellipsis
  const pageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const isActiveChip = (label: string) =>
    selectedCategory?.trim().toLowerCase() === label.toLowerCase();

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition active:scale-95 ${
      active
        ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
        : "border-[#F5D8B3] bg-white text-stone-700 hover:border-[#3E000C]/50"
    }`;

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg,#f3e3c8 25%,#fbefd9 50%,#f3e3c8 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
        .heart-pop { animation: pop 0.35s ease-out; }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-in { animation: toastIn 0.3s ease-out; }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5D8B3] bg-white text-stone-700 transition hover:-translate-y-0.5 hover:border-[#3E000C] hover:shadow-md"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href="/user/dashboard"
              className="flex h-10 items-center gap-2 rounded-xl border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition hover:-translate-y-0.5 hover:bg-[#3E000C] hover:text-white hover:shadow-md"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <Reveal className="mb-6">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] p-6 text-[#FFECD1] shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FFECD1]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-[#FFECD1]/5 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFECD1]/70">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {selectedCategory ? "Category" : "Discover"}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {selectedCategory ? `${selectedCategory} Events` : "Explore Events"}
                </h2>

                <p className="mt-2 max-w-lg text-sm text-[#FFECD1]/70 sm:text-base">
                  {selectedCategory
                    ? `Explore events in the ${selectedCategory} category.`
                    : "Find upcoming concerts, workshops and seminars near you."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!loading && !error && (
                  <div className="rounded-2xl border border-[#FFECD1]/15 bg-[#FFECD1]/10 px-5 py-3 backdrop-blur">
                    <span className="block text-2xl font-bold leading-tight">
                      {filteredEvents.length}
                    </span>
                    <span className="block text-xs text-[#FFECD1]/70">
                      Upcoming {filteredEvents.length === 1 ? "event" : "events"}
                    </span>
                  </div>
                )}

                {selectedCategory && (
                  <Link
                    href="/events"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#FFECD1] px-4 py-3 text-sm font-semibold text-[#3E000C] transition hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    View all events
                  </Link>
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Category chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/events" className={chipClass(!selectedCategory)}>
            All events
          </Link>

          {CATEGORY_CHIPS.map((label) => (
            <Link
              key={label}
              href={`/events?category=${encodeURIComponent(label)}`}
              className={chipClass(isActiveChip(label))}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-96 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-[#3E000C]/25 bg-white/60 p-14 text-center">
            <CalendarX2 className="mx-auto mb-3 h-9 w-9 text-[#3E000C]/60" />

            <p className="font-semibold text-[#3E000C]">No events found</p>

            <p className="mt-1 text-sm text-stone-600">
              {selectedCategory
                ? `No upcoming events found in the ${selectedCategory} category.`
                : "No upcoming events available right now. Check back soon."}
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
            {/* Event cards: 3 per row */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => {
                const imageUrl = getImageUrl(event.image);
                const isFavorite = favoriteIds.includes(event._id);
                const isUpdating = updatingFavoriteId === event._id;

                return (
                  <Reveal key={event._id} delay={(index % 3) * 80}>
                    <article className="group relative h-96 overflow-hidden rounded-2xl bg-[#3E000C] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      {/* Event image */}
                      <div className="absolute inset-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={event.eventName}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              console.error("Failed to load event image:", imageUrl);
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#F5D8B3] text-sm text-[#3E000C]">
                            No image available
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#3E000C] via-[#3E000C]/50 to-transparent" />

                      {/* Price + wishlist */}
                      <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
                        <span className="rounded-full bg-[#FFECD1] px-3 py-1 text-sm font-bold text-[#3E000C]">
                          {event.ticketPrice === undefined ||
                          event.ticketPrice === 0
                            ? "Free"
                            : `₹${event.ticketPrice}`}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleFavorite(event._id)}
                          disabled={isUpdating}
                          aria-label={
                            isFavorite ? "Remove from wishlist" : "Add to wishlist"
                          }
                          aria-pressed={isFavorite}
                          title={
                            isFavorite ? "Remove from wishlist" : "Add to wishlist"
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                            isFavorite
                              ? "border-red-200 bg-red-50"
                              : "border-stone-200 bg-white/90"
                          }`}
                        >
                          <Heart
                            key={String(isFavorite)}
                            className={`h-4 w-4 ${
                              isFavorite
                                ? "heart-pop fill-red-600 text-red-600"
                                : "text-stone-600"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Event details */}
                      <div className="absolute inset-x-0 bottom-0 p-4 text-[#FFECD1]">
                        {event.category && (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FFECD1]/70">
                            {event.category}
                          </span>
                        )}

                        <h3
                          className="line-clamp-2 text-lg font-bold leading-snug"
                          title={event.eventName}
                        >
                          {event.eventName}
                        </h3>

                        <div className="mt-2 space-y-1 text-xs text-[#FFECD1]/80">
                          <p className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            {new Date(event.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}

                            {event.time && (
                              <>
                                <span>·</span>
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                {event.time}
                              </>
                            )}
                          </p>

                          {event.venue && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate" title={event.venue}>
                                {event.venue}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Always visible on mobile, slides in on hover on desktop */}
                        <div className="mt-3 max-h-12 overflow-hidden opacity-100 transition-all duration-300 lg:mt-0 lg:max-h-0 lg:opacity-0 lg:group-hover:mt-3 lg:group-hover:max-h-12 lg:group-hover:opacity-100">
                          <Link
                            href={`/events/${event._id}`}
                            className="group/btn flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FFECD1] py-2.5 text-sm font-semibold text-[#3E000C] transition hover:bg-white"
                          >
                            View details
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            {/* Pagination */}
            {!selectedCategory && totalPages > 1 && (
              <nav
                aria-label="Pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-2 pb-8"
              >
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1 || loading}
                  aria-label="Previous page"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3E000C]/30 bg-white text-[#3E000C] transition hover:bg-[#3E000C] hover:text-[#FFECD1] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-stone-500">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      disabled={loading}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                      className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold transition active:scale-95 ${
                        p === page
                          ? "bg-[#3E000C] text-[#FFECD1] shadow"
                          : "border border-[#3E000C]/20 bg-white text-[#3E000C] hover:border-[#3E000C]/60"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page === totalPages || loading}
                  aria-label="Next page"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3E000C] text-[#FFECD1] transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Wishlist toast */}
      {favoriteMessage && (
        <div
          role="status"
          aria-live="polite"
          className="toast-in fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#3E000C] px-5 py-3 text-sm font-medium text-[#FFECD1] shadow-xl"
        >
          <Check className="h-4 w-4" />
          {favoriteMessage}
        </div>
      )}
    </div>
  );
}