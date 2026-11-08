"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Tag,
  Users,
  IndianRupee,
  Loader2,
  CalendarX2,
  AlertCircle,
} from "lucide-react";

import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";
import type { EventType } from "@/types/event";

export default function AdminEventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const getEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/events/${id}`);

        setEvent(response.data.data);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === "object" && err !== null && "response" in err
            ? String(
                (
                  err as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message || "Failed to fetch event details."
              )
            : "Unable to connect to the server.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getEvent();
    }
  }, [id]);

  const getImageUrl = (image?: string | null) => {
    if (!image) return "";

    const productionBackend =
      "https://gather-backend-si86.onrender.com";

    // Replace localhost image URLs with production URLs.
    if (/^https?:\/\/(localhost|127\.0\.0\.1):5000\//i.test(image)) {
      return image.replace(
        /^https?:\/\/(localhost|127\.0\.0\.1):5000/i,
        productionBackend
      );
    }

    // Keep complete URLs unchanged.
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    // Handle relative image paths.
    return `${productionBackend}/${image.replace(/^\/+/, "")}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />

        <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading event details...
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <AdminNavbar />

        <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm">
            <CalendarX2 className="mx-auto mb-4 h-10 w-10 text-[#3E000C]" />

            <h2 className="text-xl font-bold text-[#3E000C]">
              Event not found
            </h2>

            <p className="mt-2 text-sm text-stone-600">
              {error || "This event may have been removed."}
            </p>

            <Link
              href="/admin/events"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </>
    );
  }

  const imageUrl = getImageUrl(event.image);

  const showImage = imageUrl && !imageError;

  const isActive = event.isActive !== false;

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap");

        .editorial-heading {
          font-family: "Cormorant Garamond", Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 md:p-12">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Platform Catalog
              </span>

              <h1 className="editorial-heading text-4xl font-bold text-[#3E000C] sm:text-5xl">
                Event Details
              </h1>

              <p className="mt-1 text-sm text-stone-600">
                View complete information about this event.
              </p>
            </div>

            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>

          {/* Event Details Card */}
          <article className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">

            {/* Event Image */}
            {showImage ? (
              <div className="relative h-64 w-full bg-stone-100 sm:h-96">
                <img
                  src={imageUrl}
                  alt={event.eventName || "Event image"}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />

                {event.category && (
                  <span className="absolute left-5 top-5 rounded-lg bg-[#3E000C] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FFECD1]">
                    {event.category}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center gap-3 bg-[#3E000C] text-[#FFECD1]">
                <Ticket className="h-12 w-12" />

                <p className="text-sm text-[#FFECD1]/80">
                  {event.image
                    ? "Event image could not be loaded"
                    : "No event image available"}
                </p>
              </div>
            )}

            {/* Event Information */}
            <div className="space-y-7 p-6 sm:p-8">

              {/* Event Name and Status */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  {event.category && (
                    <span className="mb-3 inline-block rounded-lg bg-[#FFECD1] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                      {event.category}
                    </span>
                  )}

                  <h2 className="editorial-heading text-3xl font-bold text-[#3E000C] sm:text-4xl">
                    {event.eventName || "Untitled Event"}
                  </h2>
                </div>

                <span
                  className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    isActive
                      ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                      : "border-stone-200 bg-stone-100 text-stone-700"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Event Information Grid */}
              <div className="grid gap-5 rounded-2xl bg-[#FFECD1]/50 p-5 sm:grid-cols-2">

                {/* Date */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <CalendarDays className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Event Date</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <Clock className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Event Time</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {event.time || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <MapPin className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Venue</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {event.venue || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <MapPin className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Location</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {event.location || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <Tag className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Category</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {event.category || "General"}
                    </p>
                  </div>
                </div>

                {/* Available Seats */}
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#3E000C]">
                    <Users className="h-5 w-5" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Available Seats</p>
                    <p className="mt-1 font-semibold text-stone-900">
                      {typeof event.availableSeats === "number"
                        ? event.availableSeats
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Price */}
              <div className="rounded-2xl border border-[#F5D8B3] bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
                    <IndianRupee className="h-6 w-6" />
                  </span>

                  <div>
                    <p className="text-sm text-stone-500">Ticket Price</p>

                    <p className="editorial-heading text-3xl font-bold text-[#3E000C]">
                      {event.ticketPrice === undefined ||
                      event.ticketPrice === 0
                        ? "Free"
                        : `₹${event.ticketPrice}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-stone-100 pt-6">
                <h3 className="editorial-heading mb-3 text-2xl font-bold text-[#3E000C]">
                  About This Event
                </h3>

                <p className="whitespace-pre-line text-sm leading-7 text-stone-600 sm:text-base">
                  {event.description || "No event description available."}
                </p>
              </div>

              {/* Back Button */}
              <div className="border-t border-stone-100 pt-6">
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3E000C] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2B0008]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Manage Events
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}