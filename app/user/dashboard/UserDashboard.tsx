"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  CalendarDays,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CalendarX2,
  X,
  ArrowRight,
  Check,
  LayoutGrid,
  List,
} from "lucide-react";

import type { EventType } from "@/types/event";
import type { UserType } from "@/types/user";
import UserNavbar from "@/components/UserNavbar";

type Filters = {
  search: string;
  category: string;
  location: string;
  date: string;
  minPrice: string;
  maxPrice: string;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  category: "",
  location: "",
  date: "",
  minPrice: "",
  maxPrice: "",
};

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

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filters
  const [searchName, setSearchName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false);

  // Unread messages
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);

  const [showFilters, setShowFilters] = useState(false);

  // Check login
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
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);

        const response = await fetch("/api/events/filter-options", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch filter options.");
        }

        setCategoryOptions(
          Array.isArray(result.data?.categories) ? result.data.categories : []
        );

        setLocationOptions(
          Array.isArray(result.data?.locations) ? result.data.locations : []
        );
      } catch (err) {
        console.error("Error fetching filter options:", err);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch events
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          if (isMounted) {
            setError("Please log in to view events.");
            setEvents([]);
          }
          return;
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        // 9 events per page = 3 rows of 3
        params.set("limit", "9");

        if (appliedFilters.search) params.set("search", appliedFilters.search);
        if (appliedFilters.category)
          params.set("category", appliedFilters.category);
        if (appliedFilters.location)
          params.set("location", appliedFilters.location);
        if (appliedFilters.date) params.set("date", appliedFilters.date);
        if (appliedFilters.minPrice !== "")
          params.set("minPrice", appliedFilters.minPrice);
        if (appliedFilters.maxPrice !== "")
          params.set("maxPrice", appliedFilters.maxPrice);

        const response = await fetch(`/api/events?${params.toString()}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || result.message || "Failed to fetch events."
          );
        }

        if (!isMounted) return;

        setEvents(Array.isArray(result.data) ? result.data : []);
        setTotalPages(Math.max(1, result.pagination?.totalPages ?? 1));

        // Fetch wishlist
        const favoritesResponse = await fetch("/api/favorites", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });

        const favoritesResult = await favoritesResponse.json();

        if (!favoritesResponse.ok) {
          throw new Error(
            favoritesResult.message || "Failed to fetch your wishlist."
          );
        }

        if (!isMounted) return;

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

        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard data."
          );
          setEvents([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [user, page, appliedFilters]);

  // Fetch unread message count directly from backend
  useEffect(() => {
    let isMounted = true;

    const fetchUnreadMessageCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
          console.error("NEXT_PUBLIC_BACKEND_URL is not configured.");
          return;
        }

        const response = await fetch(`${backendUrl}/messages/user/unread-count`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch unread messages.");
        }

        if (isMounted) setUnreadMessageCount(result.unreadCount || 0);
      } catch (err) {
        console.error("Unread message count error:", err);
      }
    };

    fetchUnreadMessageCount();

    // Refresh every 15 seconds
    const interval = setInterval(fetchUnreadMessageCount, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Live search – applies the name search 500ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchName.trim();
      setAppliedFilters((prev) => {
        if (prev.search === trimmed) return prev;
        setPage(1);
        return { ...prev, search: trimmed };
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchName]);

  // Wishlist toast disappears by itself
  useEffect(() => {
    if (!favoriteMessage) return;
    const timer = setTimeout(() => setFavoriteMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [favoriteMessage]);

  // Search
  const runSearch = () => {
    setPage(1);

    setAppliedFilters({
      search: searchName.trim(),
      category: category.trim(),
      location: location.trim(),
      date,
      minPrice,
      maxPrice,
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchName("");
    setCategory("");
    setLocation("");
    setDate("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
    setAppliedFilters(EMPTY_FILTERS);
  };

  // One-click category chips
  const selectCategory = (value: string) => {
    setCategory(value);
    setPage(1);
    setAppliedFilters((prev) => ({ ...prev, category: value }));
  };

  // Remove a single applied filter
  const removeFilter = (key: keyof Filters) => {
    setPage(1);
    if (key === "search") setSearchName("");
    if (key === "category") setCategory("");
    if (key === "location") setLocation("");
    if (key === "date") setDate("");
    if (key === "minPrice") setMinPrice("");
    if (key === "maxPrice") setMaxPrice("");
    setAppliedFilters((prev) => ({ ...prev, [key]: "" }));
  };

  // Wishlist
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

  // Image URL
  const getImageUrl = (image?: string | null) => {
    if (!image) return "";

    const productionBackend = "https://gather-backend-si86.onrender.com";

    if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\//i.test(image)) {
      return image.replace(
        /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
        productionBackend
      );
    }

    if (/^https?:\/\//i.test(image)) return image;

    return `${productionBackend}/${image.replace(/^\/+/, "")}`;
  };

  // Opens in block (grid) view by default
  const [view, setView] = useState<"list" | "grid">("grid");

  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const quickDate = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const value = toISO(d);
    setDate(value);
    setPage(1);
    setAppliedFilters((p) => ({ ...p, date: value }));
  };

  const quickPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
    setAppliedFilters((p) => ({ ...p, minPrice: min, maxPrice: max }));
  };

  const fieldInput =
    "w-full rounded-lg border border-stone-200 bg-[#FFFBF5] px-3 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:bg-white focus:ring-2 focus:ring-[#3E000C]/15";

  const quickChip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition active:scale-95 ${
      active
        ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
        : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C]/50"
    }`;

  const filterLabels: Record<keyof Filters, string> = {
    search: "Search",
    category: "Category",
    location: "Location",
    date: "Date",
    minPrice: "Min ₹",
    maxPrice: "Max ₹",
  };

  const activeFilters = (Object.keys(appliedFilters) as (keyof Filters)[]).filter(
    (key) => appliedFilters[key] !== ""
  );

  const priceText = (event: EventType) =>
    event.ticketPrice === undefined || event.ticketPrice === 0
      ? "Free"
      : `₹${event.ticketPrice}`;

  // Greeting + date follow the user's own device time (set after mount to avoid hydration mismatch)
  const [greeting, setGreeting] = useState("Welcome");
  const [todayText, setTodayText] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) setGreeting("Good morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
      else if (hour >= 17 && hour < 21) setGreeting("Good evening");
      else setGreeting("Hello, night owl");

      setTodayText(
        new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })
      );
    };

    updateGreeting();

    // Re-check every minute so it changes even if the page stays open
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

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

  const FavButton = ({ event, className = "" }: { event: EventType; className?: string }) => {
    const isFavorite = favoriteIds.includes(event._id);
    return (
      <button
        type="button"
        onClick={() => handleFavorite(event._id)}
        disabled={updatingFavoriteId === event._id}
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={isFavorite}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition hover:scale-110 disabled:opacity-50 ${
          isFavorite
            ? "border-red-200 bg-red-50"
            : "border-stone-200 bg-white/90 hover:border-[#3E000C]/40"
        } ${className}`}
      >
        <Heart
          key={String(isFavorite)}
          className={`h-4 w-4 ${
            isFavorite ? "heart-pop fill-red-600 text-red-600" : "text-stone-600"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <style>{`
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .skeleton { background: linear-gradient(90deg,#f3e3c8 25%,#fbefd9 50%,#f3e3c8 75%); background-size: 800px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
        .heart-pop { animation: pop 0.35s ease-out; }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .toast-in { animation: toastIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease-out; }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <UserNavbar />

        {/* Hero */}
        <Reveal className="my-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] p-6 text-[#FFECD1] shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FFECD1]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-[#FFECD1]/5 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFECD1] text-2xl font-bold text-[#3E000C] shadow-lg sm:h-16 sm:w-16">
                  {(user?.firstName?.[0] || "G").toUpperCase()}
                </div>

                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FFECD1]/70">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {greeting}
                    {todayText && (
                      <span className="hidden font-medium normal-case tracking-normal sm:inline">
                        · {todayText}
                      </span>
                    )}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {user?.firstName ? `${user.firstName}, what's next?` : "What's next?"}
                  </h1>
                  <p className="mt-1 max-w-md text-sm text-[#FFECD1]/70">
                    Find concerts, workshops and seminars, and book your next ticket.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:w-[440px]">
                {/* Saved */}
                <Link
                  href="/user/wishlist"
                  className="group flex flex-col gap-3 rounded-2xl border border-[#FFECD1]/15 bg-[#FFECD1]/10 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFECD1]/20"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFECD1]/15 transition-transform duration-300 group-hover:scale-110">
                    <Heart className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-2xl font-bold">{favoriteIds.length}</span>
                    <span className="block text-xs text-[#FFECD1]/70">Saved events</span>
                  </span>
                </Link>

                {/* Messages */}
                <Link
                  href="/user/messages"
                  className="group flex flex-col gap-3 rounded-2xl border border-[#FFECD1]/15 bg-[#FFECD1]/10 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-[#FFECD1]/20"
                >
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFECD1]/15 transition-transform duration-300 group-hover:scale-110">
                    <MessageCircle className="h-4 w-4" />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/80" />
                        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[#3E000C] bg-red-500" />
                      </span>
                    )}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-2xl font-bold">
                      {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                    </span>
                    <span className="block text-xs text-[#FFECD1]/70">Unread messages</span>
                  </span>
                </Link>

                {/* Browse */}
                <Link
                  href="/events"
                  className="group flex flex-col gap-3 rounded-2xl bg-[#FFECD1] p-4 text-[#3E000C] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1] transition-transform duration-300 group-hover:scale-110">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="flex items-center gap-1 text-lg font-bold">
                      Browse
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="block text-xs text-[#3E000C]/70">All events</span>
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </Reveal>

        <div>
          {/* Search & filter bar */}
          <div className="mb-6 rounded-2xl border border-[#F5D8B3] bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder="Search events by name"
                  aria-label="Search by event name"
                  className={`${fieldInput} py-2.5 pl-10 pr-9`}
                />
                {searchName && (
                  <button
                    type="button"
                    onClick={() => setSearchName("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((c) => !c)}
                aria-expanded={showFilters}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  showFilters
                    ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
                    : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C]/40"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                More filters
                {activeFilters.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFECD1] px-1 text-xs font-bold text-[#3E000C]">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Category chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["", ...categoryOptions].map((item) => (
                <button
                  key={item || "all"}
                  type="button"
                  onClick={() => selectCategory(item)}
                  className={`shrink-0 ${quickChip(appliedFilters.category === item)} px-4 py-1.5 text-sm`}
                >
                  {item || "All events"}
                </button>
              ))}
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div className="fade-in mt-4 grid gap-5 border-t border-stone-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Date
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => quickDate(0)} className={quickChip(appliedFilters.date === toISO(new Date()))}>
                      Today
                    </button>
                    <button type="button" onClick={() => quickDate(1)} className={quickChip(appliedFilters.date === toISO(new Date(Date.now() + 86400000)))}>
                      Tomorrow
                    </button>
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={fieldInput}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Location
                  </span>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={filterOptionsLoading}
                    className={fieldInput}
                  >
                    <option value="">
                      {filterOptionsLoading ? "Loading..." : "All locations"}
                    </option>
                    {locationOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                    Price (₹)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Free", min: "0", max: "0" },
                      { label: "Under 500", min: "", max: "500" },
                      { label: "500 – 1000", min: "500", max: "1000" },
                      { label: "1000+", min: "1000", max: "" },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => quickPrice(p.min, p.max)}
                        className={quickChip(
                          appliedFilters.minPrice === p.min &&
                            appliedFilters.maxPrice === p.max &&
                            (p.min !== "" || p.max !== "")
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      aria-label="Minimum price"
                      className={fieldInput}
                    />
                    <span className="text-stone-400">–</span>
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      aria-label="Maximum price"
                      className={fieldInput}
                    />
                  </div>
                </div>

                <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
                  <button
                    type="button"
                    onClick={runSearch}
                    className="rounded-lg bg-[#3E000C] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008] active:scale-95"
                  >
                    Apply filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-stone-200 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-95"
                  >
                    Reset all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <main className="min-w-0">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-1 text-lg font-bold text-[#3E000C]">
                  Upcoming events
                </h2>
                {!loading && !error && (
                  <span className="mr-1 text-xs text-stone-500">
                    {events.length} {events.length === 1 ? "event" : "events"}
                  </span>
                )}
                {activeFilters.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => removeFilter(key)}
                    className="fade-in inline-flex items-center gap-1 rounded-full bg-[#3E000C]/10 px-2.5 py-1 text-xs font-medium text-[#3E000C] transition hover:bg-[#3E000C] hover:text-[#FFECD1]"
                  >
                    {filterLabels[key]}: {appliedFilters[key]}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>

              <div className="flex rounded-lg border border-[#3E000C]/20 bg-white p-1">
                {(["list", "grid"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    aria-label={`${mode} view`}
                    aria-pressed={view === mode}
                    className={`rounded-md p-1.5 transition ${
                      view === mode
                        ? "bg-[#3E000C] text-[#FFECD1]"
                        : "text-stone-500 hover:text-[#3E000C]"
                    }`}
                  >
                    {mode === "list" ? (
                      <List className="h-4 w-4" />
                    ) : (
                      <LayoutGrid className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-96 rounded-2xl" />
                ))}
              </div>
            ) : error ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="fade-in rounded-2xl border border-dashed border-[#3E000C]/25 bg-white/60 p-14 text-center">
                <CalendarX2 className="mx-auto mb-3 h-9 w-9 text-[#3E000C]/60" />
                <p className="font-semibold text-[#3E000C]">No events found</p>
                <p className="mt-1 text-sm text-stone-600">
                  Try changing or clearing your filters.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    view === "list"
                      ? "space-y-4"
                      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {events.map((event, index) => {
                    const imageUrl = getImageUrl(event.image);
                    const d = new Date(event.date);
                    const day = d.toLocaleDateString("en-IN", { day: "numeric" });
                    const month = d.toLocaleDateString("en-IN", { month: "short" });
                    const full = d.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    const image = imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={event.eventName}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#F5D8B3] text-xs text-[#3E000C]">
                        No image
                      </div>
                    );

                    /* ---------- LIST ROW ---------- */
                    if (view === "list") {
                      return (
                        <Reveal key={event._id} delay={index * 50}>
                          <article className="group flex flex-col gap-4 rounded-2xl border border-[#F5D8B3] bg-white p-3 transition-all duration-300 hover:border-[#3E000C]/40 hover:shadow-lg sm:flex-row sm:items-center">
                            <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-stone-200 sm:h-32 sm:w-48">
                              {image}
                              <div className="absolute left-2 top-2 flex flex-col items-center rounded-lg bg-white px-2.5 py-1 text-[#3E000C] shadow">
                                <span className="text-base font-bold leading-none">{day}</span>
                                <span className="text-[10px] font-semibold uppercase">{month}</span>
                              </div>
                            </div>

                            <div className="min-w-0 flex-1 space-y-2 px-1">
                              {event.category && (
                                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#3E000C]/60">
                                  {event.category}
                                </span>
                              )}
                              <h3 className="line-clamp-1 text-lg font-bold text-[#3E000C]" title={event.eventName}>
                                {event.eventName}
                              </h3>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays className="h-4 w-4 text-[#3E000C]" />
                                  {full}
                                </span>
                                {event.venue && (
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]" />
                                    <span className="truncate">{event.venue}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-stone-100 px-1 pt-3 sm:w-44 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-[#3E000C]">
                                  {priceText(event)}
                                </span>
                                <FavButton event={event} />
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  href={`/events/${event._id}`}
                                  className="rounded-lg border border-[#3E000C]/30 px-3 py-2 text-sm font-semibold text-[#3E000C] transition hover:bg-[#3E000C]/5"
                                >
                                  Details
                                </Link>
                                <Link
                                  href={`/events/${event._id}/book`}
                                  className="rounded-lg bg-[#3E000C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                                >
                                  Book
                                </Link>
                              </div>
                            </div>
                          </article>
                        </Reveal>
                      );
                    }

                    /* ---------- GRID: image-overlay card ---------- */
                    return (
                      <Reveal key={event._id} delay={(index % 3) * 80}>
                        <article className="group relative h-96 overflow-hidden rounded-2xl bg-[#3E000C] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                          <div className="absolute inset-0">{image}</div>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#3E000C] via-[#3E000C]/50 to-transparent" />

                          <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
                            <span className="rounded-full bg-[#FFECD1] px-3 py-1 text-sm font-bold text-[#3E000C]">
                              {priceText(event)}
                            </span>
                            <FavButton event={event} />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-4 text-[#FFECD1]">
                            {event.category && (
                              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FFECD1]/70">
                                {event.category}
                              </span>
                            )}
                            <h3 className="line-clamp-2 text-lg font-bold leading-snug">
                              {event.eventName}
                            </h3>
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#FFECD1]/80">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {full}
                              {event.venue && (
                                <>
                                  <span>·</span>
                                  <span className="truncate">{event.venue}</span>
                                </>
                              )}
                            </p>

                            <div className="grid max-h-0 grid-cols-2 gap-2 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-12 group-hover:opacity-100">
                              <Link
                                href={`/events/${event._id}`}
                                className="rounded-lg border border-[#FFECD1]/50 py-2 text-center text-sm font-semibold transition hover:bg-[#FFECD1]/10"
                              >
                                Details
                              </Link>
                              <Link
                                href={`/events/${event._id}/book`}
                                className="rounded-lg bg-[#FFECD1] py-2 text-center text-sm font-semibold text-[#3E000C] transition hover:bg-white"
                              >
                                Book
                              </Link>
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex flex-wrap items-center justify-center gap-2 pb-8"
                  >
                    <button
                      type="button"
                      onClick={() => setPage((c) => Math.max(1, c - 1))}
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
                      onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
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
          </main>
        </div>
      </div>

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