"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Armchair,
  ArrowLeft,
  Pencil,
  Ticket,
  User,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { EventType } from "@/types/event";

interface EventDetailsType extends EventType {
  organizer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(`${backendUrl}/events/${id}`);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch event.");
        }

        setEvent(result.data ?? result);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFECD1] p-8 text-center text-stone-700 flex items-center justify-center">
        <div className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-[#3E000C]" />
          Loading event details...
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[#FFECD1] p-8 flex items-center justify-center">
        <div className="mx-auto max-w-md rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
          <p className="mb-4 font-semibold text-red-600">
            {error || "Event not found."}
          </p>

          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#2B0008]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : `${(process.env.NEXT_PUBLIC_BACKEND_URL || "")
          .replace(/\/api\/?$/, "")}${event.image}`
    : null;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <main className="min-h-screen bg-[#FFECD1] px-4 py-12 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
        <div className="mx-auto max-w-4xl">

          {/* Top Bar Navigation */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Event Details
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                {event.eventName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/organizer/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
              >
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Link>

              <Link
                href={`/organizer/events/edit/${event._id}`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008]"
              >
                <Pencil className="h-4 w-4" /> Edit Event
              </Link>
            </div>
          </div>

          {/* Main Card Container */}
          <article className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">

            {/* Banner Image / Fallback Placeholder */}
            {imageUrl ? (
              <div className="relative h-64 w-full overflow-hidden bg-stone-100 sm:h-96">
                <img
                  src={imageUrl}
                  alt={event.eventName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-[#3E000C] text-[#FFECD1]">
                <Ticket className="h-12 w-12 opacity-80" />
              </div>
            )}

            <div className="p-6 sm:p-10">

              {/* Category Badge */}
              {event.category && (
                <span className="mb-3 inline-block rounded-xl bg-[#3E000C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  {event.category}
                </span>
              )}

              {/* Title Header */}
              <h1 className="editorial-heading mb-8 text-3xl font-bold tracking-tight text-[#3E000C] sm:text-4xl">
                {event.eventName}
              </h1>

              {/* Key Event Metrics Grid */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                
                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Date</p>
                    <p className="text-sm font-bold text-stone-900">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <Clock className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Time</p>
                    <p className="text-sm font-bold text-stone-900">
                      {event.time || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Venue</p>
                    <p className="text-sm font-bold text-stone-900 truncate max-w-[160px]">
                      {event.venue || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Location</p>
                    <p className="text-sm font-bold text-stone-900 truncate max-w-[160px]">
                      {event.location || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <Ticket className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Ticket Price</p>
                    <p className="editorial-heading text-xl font-bold text-[#3E000C]">
                      ₹{event.ticketPrice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
                    <Armchair className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Available Seats</p>
                    <p className="text-sm font-bold text-stone-900">
                      {event.availableSeats}
                    </p>
                  </div>
                </div>

              </div>

              {/* Event Overview Section */}
              <div className="border-t border-stone-100 pt-8">
                <h2 className="editorial-heading mb-3 text-2xl font-bold text-[#3E000C]">
                  About This Event
                </h2>

                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700 font-normal">
                  {event.description || "No description available."}
                </p>
              </div>

              {/* Organizer Contact Info */}
              {event.organizer && (
                <div className="mt-8 border-t border-stone-100 pt-8">
                  <h2 className="editorial-heading mb-4 text-2xl font-bold text-[#3E000C]">
                    Organizer Information
                  </h2>

                  <div className="flex flex-col gap-2 rounded-2xl bg-stone-50 p-4 border border-stone-200/60">
                    <p className="flex items-center gap-2 text-sm font-bold text-stone-800">
                      <User className="h-4 w-4 text-[#3E000C]" />
                      {event.organizer.firstName} {event.organizer.lastName}
                    </p>

                    {event.organizer.email && (
                      <p className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                        <Mail className="h-4 w-4 text-[#3E000C]" />
                        {event.organizer.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </article>
        </div>
      </main>
    </>
  );
}