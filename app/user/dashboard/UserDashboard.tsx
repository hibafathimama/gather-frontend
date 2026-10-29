"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EventType } from "@/types/event";
import type { UserType } from "@/types/user";
import UserNavbar from "@/components/UserNavbar";

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Check login and fetch events whenever the page changes
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

  // Fetch events for the current page
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "6");

      if (searchName.trim()) params.set("name", searchName.trim());
      if (category.trim()) params.set("category", category.trim());
      if (location.trim()) params.set("location", location.trim());
      if (date) params.set("date", date);
      if (minPrice !== "") params.set("minPrice", minPrice);
      if (maxPrice !== "") params.set("maxPrice", maxPrice);

      const response = await fetch(`/api/events?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch events");
      }

      setEvents(result.data || []);

      setTotalPages(
        result.pagination?.totalPages ??
          result.totalPages ??
          1
      );
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  // Image path helper
  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-7xl">
        <UserNavbar />

        {/* Welcome Hero Section */}
        <section className="relative my-8 overflow-hidden rounded-3xl bg-[#3E000C] p-8 sm:p-10 text-[#FFECD1] shadow-xl">
          <div className="relative z-10 max-w-xl">
            <span className="mb-3 inline-block rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
              Attendee Dashboard
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="mt-2 text-sm text-stone-300 sm:text-base">
              Discover upcoming live experiences, concerts, and professional seminars. Book your next ticket today.
            </p>
            <div className="mt-6">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#3E000C] shadow-md transition-all hover:bg-[#FFECD1] active:scale-95"
              >
                Browse All Events
              </Link>
            </div>
          </div>
        </section>

        {/* Search & Action Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setSearchTrigger((current) => current + 1);
                }
              }}
              placeholder="Search by event name..."
              className="w-full rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3.5 text-stone-900 placeholder-stone-400 shadow-sm outline-none transition-all focus:border-[#3E000C] focus:ring-4 focus:ring-[#3E000C]/10"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setSearchTrigger((current) => current + 1);
              }}
              className="rounded-2xl bg-[#3E000C] px-6 py-3.5 font-bold text-white shadow-sm transition-all hover:bg-[#2B0008] active:scale-95"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3.5 font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50"
            >
              {showFilters ? "Hide Filters" : "Filters ▾"}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showFilters && (
          <div className="mb-8 grid gap-4 rounded-3xl border border-[#F5D8B3] bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Tech, Music"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#3E000C]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#3E000C]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#3E000C]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">Min Price (₹)</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#3E000C]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">Max Price (₹)</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10000"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-3.5 py-2.5 text-sm text-stone-900 outline-none focus:bg-white focus:border-[#3E000C]"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSearchTrigger((current) => current + 1);
                }}
                className="rounded-xl bg-[#3E000C] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("");
                  setLocation("");
                  setDate("");
                  setMinPrice("");
                  setMaxPrice("");
                  setPage(1);
                  setSearchTrigger((current) => current + 1);
                }}
                className="rounded-xl border border-stone-200 bg-stone-100 px-5 py-2.5 text-xs font-semibold text-stone-700 transition-all hover:bg-stone-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-black tracking-tight text-[#3E000C]">
            Upcoming Events
          </h3>
          <span className="text-xs font-semibold text-stone-600">
            Showing page {page} of {totalPages}
          </span>
        </div>

        {/* Events Content Area */}
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
            <p className="text-stone-500 font-medium">No events found matching your criteria.</p>
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
                            console.error("Image failed:", imageUrl);
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-stone-400">
                          No image available
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

                        <h4 className="text-lg font-bold tracking-tight text-[#3E000C] line-clamp-1">
                          {event.eventName}
                        </h4>
                      </div>

                      {/* Action Links */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100">
                        <Link
                          href={`/events/${event._id}`}
                          className="flex items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs font-bold text-stone-700 transition-all hover:border-[#3E000C] hover:text-[#3E000C]"
                        >
                          View Details
                        </Link>

                        <Link
                          href={`/events/${event._id}/book`}
                          className="flex items-center justify-center rounded-xl bg-[#3E000C] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
                        >
                          Book Ticket
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