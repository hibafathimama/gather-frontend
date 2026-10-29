"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  Compass,
  CalendarDays,
  Clock,
  MapPin,
  Flag,
  X,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarX2,
} from "lucide-react";
import api from "@/lib/api";
import type { EventType } from "@/types/event";

function EventDetailsContent() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    const getEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getEvent();
    }
  }, [id]);

  const handleReportSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reason) {
      setReportError("Please select a reason for reporting this event.");
      return;
    }

    try {
      setSubmitting(true);
      setReportError("");
      setReportMessage("");

      const response = await api.post(
        `/events/${id}/report`,
        {
          reason,
          description,
        },
        { withCredentials: true }
      );

      setReportMessage(
        response.data.message || "Report submitted successfully."
      );
      setReason("");
      setDescription("");
      setShowReportForm(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        setReportError(
          apiError.response?.data?.message ||
            "Failed to submit report. Please try again."
        );
      } else {
        setReportError("Unable to connect to the backend.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading event...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] p-6">
        <div className="w-full max-w-md rounded-xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
            <CalendarX2 className="h-6 w-6" />
          </span>
          <p className="text-lg font-semibold text-[#3E000C]">
            Event not found
          </p>
          <p className="mt-1 text-sm text-stone-600">
            It may have been removed or the link is incorrect.
          </p>
          <Link
            href="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
          >
            <Compass className="h-4 w-4" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = event.image
    ? event.image.startsWith("http")
      ? event.image
      : `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/?$/, "")}${
          event.image.startsWith("/") ? "" : "/"
        }${event.image}`
    : "";

  const showImage = imageUrl && !imageError;

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15";

  const details = [
    {
      label: "Date",
      value: new Date(event.date).toLocaleDateString("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      Icon: CalendarDays,
      wide: false,
    },
    ...(event.time
      ? [{ label: "Time", value: event.time, Icon: Clock, wide: false }]
      : []),
    ...(event.venue
      ? [{ label: "Venue", value: event.venue, Icon: MapPin, wide: true }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-3xl">
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
            href="/events"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">All events</span>
          </Link>
        </header>

        {/* Event card */}
        <article className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm">
          {/* Image */}
          {showImage ? (
            <div className="relative h-64 w-full bg-stone-100 sm:h-72">
              <img
                src={imageUrl}
                alt={event.eventName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              {event.category && (
                <span className="absolute left-4 top-4 rounded-md bg-[#3E000C] px-2.5 py-1 text-xs font-medium text-[#FFECD1]">
                  {event.category}
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-2 bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-10 w-10 opacity-80" />
              <p className="text-sm text-[#FFECD1]/75">
                {event.image
                  ? "Event image could not be loaded"
                  : "No event image available"}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6 p-6 sm:p-8">
            <div>
              {event.category && !showImage && (
                <span className="mb-2 inline-block rounded-md bg-[#FFECD1] px-2.5 py-1 text-xs font-medium text-[#3E000C]">
                  {event.category}
                </span>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-[#3E000C] sm:text-3xl">
                {event.eventName}
              </h1>
            </div>

            {/* Details */}
            <dl className="grid gap-5 rounded-lg bg-[#FFECD1]/40 p-5 sm:grid-cols-2">
              {details.map(({ label, value, Icon, wide }) => (
                <div
                  key={label}
                  className={`flex items-start gap-3 ${
                    wide ? "sm:col-span-2" : ""
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#3E000C]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm text-stone-500">{label}</dt>
                    <dd className="font-semibold text-stone-900">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {/* Description */}
            {event.description && (
              <div>
                <h2 className="mb-2 text-lg font-semibold text-[#3E000C]">
                  About this event
                </h2>
                <p className="text-sm leading-relaxed text-stone-600 sm:text-base">
                  {event.description}
                </p>
              </div>
            )}

            {/* Price and booking */}
            <div className="flex flex-col gap-4 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-stone-500">Ticket price</p>
                <p className="text-2xl font-bold text-[#3E000C]">
                  {event.ticketPrice === undefined || event.ticketPrice === 0
                    ? "Free"
                    : `₹${event.ticketPrice}`}
                </p>
              </div>

              <Link
                href={`/events/${event._id}/book`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
              >
                <Ticket className="h-4 w-4" />
                Book tickets
              </Link>
            </div>

            {/* Report section */}
            <div className="border-t border-stone-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setShowReportForm((previous) => !previous);
                  setReportError("");
                  setReportMessage("");
                }}
                aria-expanded={showReportForm}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                {showReportForm ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                {showReportForm ? "Close report form" : "Report event"}
              </button>

              {reportMessage && (
                <p
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {reportMessage}
                </p>
              )}

              {reportError && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {reportError}
                </p>
              )}

              {showReportForm && (
                <form
                  onSubmit={handleReportSubmit}
                  className="mt-5 space-y-4 rounded-lg border border-stone-200 bg-stone-50/60 p-5"
                >
                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-1.5 block text-sm font-medium text-stone-700"
                    >
                      Reason for reporting
                    </label>

                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="">Select a reason</option>
                      <option value="Fake or suspicious event">
                        Fake or suspicious event
                      </option>
                      <option value="Incorrect event details">
                        Incorrect event details
                      </option>
                      <option value="Misleading ticket price">
                        Misleading ticket price
                      </option>
                      <option value="Inappropriate content">
                        Inappropriate content
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-1.5 block text-sm font-medium text-stone-700"
                    >
                      Additional details (optional)
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                      rows={4}
                      placeholder="Explain why you are reporting this event..."
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? "Submitting..." : "Submit report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
          <p className="flex items-center gap-2 font-medium">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading event...
          </p>
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}