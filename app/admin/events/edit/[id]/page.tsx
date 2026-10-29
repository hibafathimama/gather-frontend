"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  FileText, 
  IndianRupee, 
  Users, 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface EventForm {
  eventName: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  ticketPrice: string;
  totalSeats: string;
  availableSeats: string;
}

const initialForm: EventForm = {
  eventName: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  description: "",
  ticketPrice: "0",
  totalSeats: "1",
  availableSeats: "0",
};

export default function AdminEditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;

  const [form, setForm] = useState<EventForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/admin/events/${eventId}`);
        const event = response.data.data;

        if (!event) {
          throw new Error("Event details were not found.");
        }

        setForm({
          eventName: event.eventName || event.name || "",
          category: event.category || "",
          date: event.date
            ? new Date(event.date).toISOString().slice(0, 10)
            : "",
          time: event.time || "",
          venue: event.venue || "",
          location: event.location || "",
          description: event.description || "",
          ticketPrice: String(event.ticketPrice ?? 0),
          totalSeats: String(event.totalSeats ?? 1),
          availableSeats: String(event.availableSeats ?? 0),
        });
      } catch (err: unknown) {
        const errorMessage =
          typeof err === "object" && err !== null && "response" in err
            ? String(
                (
                  err as {
                    response?: { data?: { message?: string } };
                  }
                ).response?.data?.message || "Failed to load event."
              )
            : err instanceof Error
              ? err.message
              : "Unable to connect to the server.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const price = Number(form.ticketPrice);
    const totalSeats = Number(form.totalSeats);
    const availableSeats = Number(form.availableSeats);

    if (!Number.isFinite(price) || price < 0) {
      setError("Ticket price must be zero or greater.");
      return;
    }

    if (!Number.isInteger(totalSeats) || totalSeats < 1) {
      setError("Total seats must be at least 1.");
      return;
    }

    if (
      !Number.isInteger(availableSeats) ||
      availableSeats < 0
    ) {
      setError("Available seats must be a non-negative whole number.");
      return;
    }

    if (availableSeats > totalSeats) {
      setError("Available seats cannot exceed total seats.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(`/admin/events/${eventId}`, {
        eventName: form.eventName.trim(),
        category: form.category.trim(),
        date: form.date,
        time: form.time,
        venue: form.venue.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        ticketPrice: price,
        totalSeats,
        availableSeats,
      });

      setMessage(
        response.data.message || "Event updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/events");
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? String(
              (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to update event."
            )
          : err instanceof Error
            ? err.message
            : "Unable to connect to the server.";

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-stone-600 font-medium">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
          Loading event details...
        </main>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-3xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Event Moderation
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Edit Event
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Update and adjust the event information and availability metrics below.
              </p>
            </div>

            <Link
              href="/admin/events"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Events
            </Link>
          </div>

          {!error || form.eventName ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm"
            >
              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  {message}
                </div>
              )}

              {/* Event Name */}
              <div>
                <label
                  htmlFor="eventName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Event Name *
                </label>
                <div className="relative">
                  <input
                    id="eventName"
                    name="eventName"
                    value={form.eventName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    placeholder="Enter official event title"
                  />
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Category *
                </label>
                <div className="relative">
                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    placeholder="e.g. Music, Tech, Workshop"
                  />
                  <Tag className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />
                    <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Time *
                  </label>
                  <div className="relative">
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />
                    <Clock className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Venue */}
              <div>
                <label
                  htmlFor="venue"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Venue *
                </label>
                <div className="relative">
                  <input
                    id="venue"
                    name="venue"
                    value={form.venue}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    placeholder="Specific hall, building or online link"
                  />
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Location
                </label>
                <div className="relative">
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    placeholder="City, State or Region"
                  />
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    placeholder="Write a clear summary about the event..."
                  />
                  <FileText className="absolute left-4 top-4 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Pricing & Seats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="ticketPrice"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Ticket Price (₹) *
                  </label>
                  <div className="relative">
                    <input
                      id="ticketPrice"
                      name="ticketPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.ticketPrice}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />
                    <IndianRupee className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="totalSeats"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Total Seats *
                  </label>
                  <div className="relative">
                    <input
                      id="totalSeats"
                      name="totalSeats"
                      type="number"
                      min="1"
                      step="1"
                      value={form.totalSeats}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />
                    <Users className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="availableSeats"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Available Seats *
                  </label>
                  <div className="relative">
                    <input
                      id="availableSeats"
                      name="availableSeats"
                      type="number"
                      min="0"
                      step="1"
                      value={form.availableSeats}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    />
                    <Users className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>

                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : null}

        </div>
      </main>
    </>
  );
}