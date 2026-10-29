"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

  const handleReportSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C] font-semibold">
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFECD1] p-6 text-center">
        <div className="w-full max-w-md rounded-2xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          <p className="text-lg font-bold text-[#3E000C]">Event not found.</p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2B0008]"
          >
            Back to Events
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

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-3xl">
        
        {/* Navigation Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-6">
          <Link href="/user/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-lg font-bold text-[#FFECD1] shadow-sm transition-transform group-hover:scale-105">
              ✦
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#3E000C]">
                Gather<span className="text-[#3E000C]/70">.</span>
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
                Event Details
              </p>
            </div>
          </Link>

          <Link
            href="/events"
            className="rounded-xl border border-[#3E000C]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#3E000C] transition-all hover:bg-[#3E000C] hover:text-white shadow-sm"
          >
            All Events
          </Link>
        </header>

        {/* Event Card Container */}
        <div className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">
          
          {/* Event Image Banner */}
          {imageUrl && !imageError ? (
            <div className="relative h-72 w-full bg-stone-100">
              <img
                src={imageUrl}
                alt={event.eventName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
              {event.category && (
                <span className="absolute top-4 left-4 rounded-xl bg-[#3E000C]/90 px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#FFECD1] backdrop-blur-md shadow-sm">
                  {event.category}
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-stone-100 text-xs font-semibold text-stone-400">
              {event.image
                ? "Event image could not be loaded"
                : "No event image available"}
            </div>
          )}

          {/* Body Content */}
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#3E000C]">
                {event.eventName}
              </h2>
              {event.category && !imageUrl && (
                <p className="mt-2 text-sm font-bold text-[#3E000C]">
                  {event.category}
                </p>
              )}
            </div>

            {/* Meta Details Grid */}
            <div className="grid gap-4 rounded-2xl border border-stone-200 bg-stone-50/50 p-5 sm:grid-cols-2 text-sm text-stone-700">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-[#3E000C] mb-1">Date</span>
                <span className="font-semibold text-stone-900">
                  📅 {new Date(event.date).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {event.time && (
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#3E000C] mb-1">Time</span>
                  <span className="font-semibold text-stone-900">🕒 {event.time}</span>
                </div>
              )}

              {event.venue && (
                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#3E000C] mb-1">Venue</span>
                  <span className="font-semibold text-stone-900">📍 {event.venue}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#3E000C] mb-2">About Event</h3>
                <p className="text-stone-600 leading-relaxed text-sm">
                  {event.description}
                </p>
              </div>
            )}

            {/* Ticket Pricing & Book Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-stone-100">
              <div>
                <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wider">Ticket Price</span>
                <span className="text-2xl font-black text-[#3E000C]">
                  {event.ticketPrice === undefined || event.ticketPrice === 0 ? "Free" : `₹${event.ticketPrice}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => alert("Ticket booking will be added next!")}
                className="rounded-xl bg-[#3E000C] px-8 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2B0008] active:scale-95"
              >
                Book Tickets
              </button>
            </div>

            {/* Report Section */}
            <div className="mt-8 border-t border-stone-200 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowReportForm((previous) => !previous);
                  setReportError("");
                  setReportMessage("");
                }}
                className="rounded-xl border border-red-300 bg-red-50/50 px-5 py-2.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 shadow-sm"
              >
                {showReportForm ? "Close Report Form" : "Report Event"}
              </button>

              {reportMessage && (
                <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
                  {reportMessage}
                </p>
              )}

              {reportError && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {reportError}
                </p>
              )}

              {showReportForm && (
                <form onSubmit={handleReportSubmit} className="mt-5 space-y-4 rounded-2xl border border-stone-200 bg-stone-50/50 p-6 shadow-inner">
                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                    >
                      Reason for reporting *
                    </label>

                    <select
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-[#3E000C]"
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
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
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
                      className="w-full rounded-xl border border-stone-300 bg-white p-4 text-sm text-stone-900 outline-none focus:border-[#3E000C]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C] font-semibold">
          Loading event...
        </div>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}