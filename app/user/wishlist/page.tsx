"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Heart,
  HeartOff,
  ArrowLeft,
  Compass,
  CalendarDays,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface EventType {
  _id: string;
  eventName?: string;
  category?: string;
  date?: string;
  time?: string;
  venue?: string;
  location?: string;
  ticketPrice?: number;
  image?: string;
}

interface FavoriteType {
  _id: string;
  event?: EventType | null;
}

export default function WishlistPage() {
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

    const baseUrl = backendUrl.replace(/\/api\/?$/, "");

    return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/favorites", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load your wishlist.");
      }

      const favoriteData = result.data ?? result.favorites ?? [];

      setFavorites(Array.isArray(favoriteData) ? favoriteData : []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (eventId: string) => {
    try {
      setError("");
      setRemovingId(eventId);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `/api/favorites/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to remove this event.");
      }

      setFavorites((previous) =>
        previous.filter((favorite) => favorite.event?._id !== eventId)
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to remove this event."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight text-[#3E000C]">
                Gather
              </p>
              <p className="text-xs text-stone-600">Event platform</p>
            </div>
          </Link>

          <Link
            href="/user/dashboard"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </header>

        {/* Page title and count */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
              My wishlist
            </h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              All your favorite events in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#F5D8B3] bg-white px-4 py-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
              <Heart className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-stone-600">Saved events</p>
              <p className="text-xl font-bold leading-tight text-[#3E000C]">
                {loading ? "..." : favorites.length}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchFavorites}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium text-red-700 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your wishlist...
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-xl border border-[#F5D8B3] bg-white px-5 py-14 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <HeartOff className="h-7 w-7" />
            </span>

            <h2 className="text-lg font-semibold text-[#3E000C]">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-1.5 max-w-md text-sm text-stone-600">
              Explore events and tap the heart to save the ones you like.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
            >
              <Compass className="h-4 w-4" />
              Explore events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const event = favorite.event;

              if (!event?._id) return null;

              const imageUrl = getImageUrl(event.image);
              const isRemoving = removingId === event._id;
              const place = [event.venue, event.location]
                .filter(Boolean)
                .join(", ");

              return (
                <article
                  key={favorite._id}
                  className="flex flex-col overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-48 bg-stone-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={event.eventName || "Event"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-stone-500">
                        No image available
                      </div>
                    )}

                    {event.category && (
                      <span className="absolute left-3 top-3 rounded-md bg-[#3E000C] px-2.5 py-1 text-xs font-medium text-[#FFECD1]">
                        {event.category}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(event._id)}
                      disabled={removingId !== null}
                      aria-label={`Remove ${event.eventName || "event"} from wishlist`}
                      title="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
                      ) : (
                        <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[#3E000C]">
                          {event.eventName || "Untitled event"}
                        </h2>

                        {typeof event.ticketPrice === "number" && (
                          <span className="shrink-0 text-lg font-bold text-[#3E000C]">
                            ₹{event.ticketPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1 text-sm text-stone-600">
                        <span className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                          {formatDate(event.date)}
                        </span>

                        {event.time && (
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                            {event.time}
                          </span>
                        )}

                        {place && (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-[#3E000C]/70" />
                            <span className="truncate" title={place}>
                              {place}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex items-center justify-center rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-[#3E000C] hover:text-[#3E000C]"
                      >
                        View details
                      </Link>

                      <Link
                        href={`/events/${event._id}/book`}
                        className="flex items-center justify-center rounded-lg bg-[#3E000C] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                      >
                        Book ticket
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}