"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Heart,
  CalendarDays,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CalendarX2,
} from "lucide-react";
import type { EventType } from "@/types/event";
import type { UserType } from "@/types/user";
import UserNavbar from "@/components/UserNavbar";

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<string | null>(
    null
  );

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filter states
  const [searchName, setSearchName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Check login and fetch events when page or search changes.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }

    fetchEvents();
  }, [router, page, searchTrigger]);

  // Fetch events and the user's wishlist.
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view events.");
        setEvents([]);
        return;
      }

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "6");

      if (searchName.trim()) params.set("name", searchName.trim());
      if (category.trim()) params.set("category", category.trim());
      if (location.trim()) params.set("location", location.trim());
      if (date) params.set("date", date);
      if (minPrice !== "") params.set("minPrice", minPrice);
      if (maxPrice !== "") params.set("maxPrice", maxPrice);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`/api/events?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch events.");
      }

      setEvents(Array.isArray(result.data) ? result.data : []);
      setTotalPages(result.pagination?.totalPages ?? result.totalPages ?? 1);

      // Fetch saved events from the backend.
      const favoritesResponse = await fetch("/api/favorites", {
        headers,
        credentials: "include",
        cache: "no-store",
      });

      const favoritesResult = await favoritesResponse.json();

      if (!favoritesResponse.ok) {
        throw new Error(
          favoritesResult.message || "Failed to fetch your wishlist."
        );
      }

      const favorites = Array.isArray(favoritesResult.data)
        ? favoritesResult.data
        : [];

      const ids = favorites
        .map((favorite: { event?: string | { _id: string } | null }) =>
          typeof favorite.event === "string"
            ? favorite.event
            : favorite.event?._id
        )
        .filter((id: string | undefined): id is string => Boolean(id));

      setFavoriteIds(ids);
    } catch (err: unknown) {
      console.error("Error fetching events or wishlist:", err);

      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add or remove an event from the wishlist.
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
        "Content-Type": "application/json",
      };

      if (favoriteIds.includes(eventId)) {
        const response = await fetch(`/api/favorites/${eventId}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to remove event.");
        }

        setFavoriteIds((previous) => previous.filter((id) => id !== eventId));
        setFavoriteMessage("Event removed from your wishlist.");
      } else {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ eventId }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to add event.");
        }

        setFavoriteIds((previous) =>
          previous.includes(eventId) ? previous : [...previous, eventId]
        );
        setFavoriteMessage("Event added to your wishlist!");
      }
    } catch (err: unknown) {
      console.error("Wishlist update error:", err);

      setFavoriteMessage(
        err instanceof Error ? err.message : "Unable to update your wishlist."
      );
    } finally {
      setUpdatingFavoriteId(null);
    }
  };

  // Image path helper.
const getImageUrl = (image?: string | null) => {
  if (!image) return "";

  const productionBackend = "https://gather-backend-si86.onrender.com";

  // Images saved using localhost should use Render instead.
  if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\//i.test(image)) {
    return image.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
      productionBackend
    );
  }

  // Keep other complete image URLs unchanged.
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Relative image paths are served from Render.
  return `${productionBackend}/${image.replace(/^\/+/, "")}`;
};


  const runSearch = () => {
    setPage(1);
    setSearchTrigger((current) => current + 1);
  };

  const inputClass =
    "w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15";
  const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-7xl">
        <UserNavbar />

        {/* Welcome section */}
        <section className="my-8 rounded-2xl bg-[#3E000C] px-6 py-8 text-[#FFECD1] sm:px-10 sm:py-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {user?.firstName}
          </h1>

          <p className="mt-2 max-w-xl text-sm text-[#FFECD1]/80 sm:text-base">
            Find upcoming concerts, workshops and seminars, and book your next
            ticket.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-[#FFECD1] px-5 py-2.5 text-sm font-semibold text-[#3E000C] transition hover:bg-white"
            >
              Browse all events
            </Link>

            <Link
              href="/user/wishlist"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#FFECD1]/40 px-5 py-2.5 text-sm font-semibold text-[#FFECD1] transition hover:bg-white/10"
            >
              <Heart className="h-4 w-4" />
              My wishlist ({favoriteIds.length})
            </Link>
          </div>
        </section>

        {/* Search bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="Search by event name"
              aria-label="Search by event name"
              className="w-full rounded-lg border border-[#F5D8B3] bg-white py-3 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={runSearch}
              className="rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              aria-expanded={showFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-[#F5D8B3] bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 grid gap-4 rounded-xl border border-[#F5D8B3] bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className={labelClass}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Tech, Music"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kozhikode"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Min price (₹)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Max price (₹)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10000"
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
              <button
                type="button"
                onClick={runSearch}
                className="rounded-lg bg-[#3E000C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
              >
                Apply filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  setLocation("");
                  setDate("");
                  setMinPrice("");
                  setMaxPrice("");
                  runSearch();
                }}
                className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-xl font-bold tracking-tight text-[#3E000C] sm:text-2xl">
            Upcoming events
          </h2>
          <span className="text-sm text-stone-600">
            Page {page} of {totalPages}
          </span>
        </div>

        {favoriteMessage && (
          <p
            role="status"
            aria-live="polite"
            className="mb-5 rounded-lg border border-[#F5D8B3] bg-white px-4 py-3 text-sm text-[#3E000C]"
          >
            {favoriteMessage}
          </p>
        )}

        {/* Events */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading events...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-[#F5D8B3] bg-white p-12 text-center">
            <CalendarX2 className="mx-auto mb-3 h-8 w-8 text-[#3E000C]/60" />
            <p className="text-stone-600">
              No events match your search. Try changing or clearing the
              filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const imageUrl = getImageUrl(event.image);
                const isFavorite = favoriteIds.includes(event._id);
                const isUpdating = updatingFavoriteId === event._id;

                return (
              <article
                key={event._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Larger event image */}
                <div className="relative h-64 w-full overflow-hidden bg-stone-200 sm:h-72">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={event.eventName}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        console.error("Image failed:", imageUrl);
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#F5D8B3] text-sm text-[#3E000C]">
                      No image available
                    </div>
                  )}

                  {/* Dark overlay for better visual appearance */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Event category */}
                  {event.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#3E000C] px-3 py-1.5 text-xs font-semibold text-[#FFECD1] shadow">
                      {event.category}
                    </span>
                  )}

                  {/* Ticket price */}
                  <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#3E000C] shadow">
                    {event.ticketPrice === undefined || event.ticketPrice === 0
                      ? "Free"
                      : `₹${event.ticketPrice}`}
                  </span>

                  {/* Wishlist button */}
                  <button
                    type="button"
                    onClick={() => handleFavorite(event._id)}
                    disabled={isUpdating}
                    aria-label={
                      isFavorite ? "Remove from wishlist" : "Add to wishlist"
                    }
                    aria-pressed={isFavorite}
                    title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                    className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite
                          ? "fill-red-600 text-red-600"
                          : "text-stone-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Event details */}
                <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                  <div className="space-y-3">
                    <h3
                      className="line-clamp-2 min-h-14 text-xl font-bold leading-7 text-[#3E000C]"
                      title={event.eventName}
                    >
                      {event.eventName}
                    </h3>

                    <div className="flex flex-col gap-2.5 text-sm text-stone-600">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 shrink-0 text-[#3E000C]" />
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      {event.venue && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]" />
                          <span className="truncate" title={event.venue}>
                            {event.venue}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto grid grid-cols-2 gap-3 border-t border-stone-100 pt-4">
                    <Link
                      href={`/events/${event._id}`}
                      className="flex min-h-11 items-center justify-center rounded-lg border border-[#3E000C] px-3 py-2.5 text-center text-sm font-semibold text-[#3E000C] transition hover:bg-[#3E000C]/5"
                    >
                      View details
                    </Link>

                    <Link
                      href={`/events/${event._id}/book`}
                      className="flex min-h-11 items-center justify-center rounded-lg bg-[#3E000C] px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                    >
                      Book ticket
                    </Link>
                  </div>
                </div>
              </article>

                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4 pb-8">
                <button
                  onClick={() => setPage((current) => current - 1)}
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
                  onClick={() => setPage((current) => current + 1)}
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