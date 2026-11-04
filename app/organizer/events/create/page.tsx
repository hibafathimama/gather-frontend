"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CalendarPlus, 
  ArrowLeft, 
  Image as ImageIcon, 
  IndianRupee, 
  Armchair, 
  MapPin, 
  Building2, 
  CalendarDays, 
  Clock, 
  Tag, 
  FileText, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatingType, setSeatingType] = useState("general");
  const [seatNumbers, setSeatNumbers] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before creating an event.");
      }

      const formData = new FormData(e.currentTarget);
      formData.set("seatingType", seatingType);

      if (seatingType === "reserved") {
        const seats = seatNumbers
          .split(",")
          .map((seat) => seat.trim())
          .filter(Boolean);

        const totalSeats = Number(formData.get("totalSeats"));

        if (seats.length !== totalSeats) {
          throw new Error(
            `Please enter exactly ${totalSeats} seat numbers.`
          );
        }

        if (new Set(seats).size !== seats.length) {
          throw new Error("Duplicate seat numbers are not allowed.");
        }

        formData.set("seats", JSON.stringify(seats));
      } else {
        formData.delete("seats");
      }
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        throw new Error("Backend URL is not configured.");
      }

      const response = await fetch(
        `${backendUrl}/events/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to create event."
        );
      }

      alert("Event created successfully!");

      router.push("/organizer/dashboard");
      router.refresh();
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
        <div className="mx-auto max-w-3xl">

          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Organizer Portal
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Create Event
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Fill in the details below to publish your upcoming live experience.
              </p>
            </div>

            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Form Card Container */}
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="space-y-6 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                <CalendarPlus className="h-6 w-6" />
              </span>
              <div>
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Event Specifications
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Provide accurate details to attract attendees.
                </p>
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Event Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="eventName"
                  placeholder="e.g. Symphony of Strings Live"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Category *
              </label>
              <div className="relative">
                <select
                  name="category"
                  required
                  defaultValue=""
                  className="w-full appearance-none rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="Concert">Concert</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Sports">Sports</option>
                  <option value="Conference">Conference</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
                <Tag className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Time *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="time"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <Clock className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Venue *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="venue"
                  placeholder="e.g. Grand Theatre Hall"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Mumbai, Maharashtra"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Description *
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  placeholder="Describe your event highlights, performers, or schedules..."
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />
                <FileText className="absolute left-4 top-4 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
            </div>
            {/* Seating Type */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Seating Type *
              </label>

              <select
                value={seatingType}
                onChange={(e) => {
                  setSeatingType(e.target.value);
                  setSeatNumbers("");
                }}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 text-sm text-stone-900 outline-none focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
              >
                <option value="general">General Admission</option>
                <option value="reserved">Reserved Seating</option>
              </select>

              <p className="mt-1.5 text-xs text-stone-500">
                Choose whether attendees can select individual seats.
              </p>
            </div>

            {/* Reserved Seat Numbers */}
            {seatingType === "reserved" && (
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Seat Numbers *
                </label>

                <textarea
                  value={seatNumbers}
                  onChange={(e) => setSeatNumbers(e.target.value)}
                  placeholder="Example: A1, A2, A3, A4, B1, B2"
                  rows={3}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />

                <p className="mt-1.5 text-xs text-stone-500">
                  Separate each seat number with a comma. The number of
                  seat numbers must match Total Seats.
                </p>
              </div>
            )}
            {/* Ticket Price and Total Seats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Ticket Price (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="ticketPrice"
                    min="0"
                    step="0.01"
                    placeholder="499"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
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
                    type="number"
                    id="totalSeats"
                    name="totalSeats"
                    min="1"
                    step="1"
                    placeholder="250"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <Armchair className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Event Image Upload */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Event Banner Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 pl-11 text-sm text-stone-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#3E000C] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white hover:file:bg-[#2B0008]"
                />
                <ImageIcon className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
              </div>
              <p className="mt-1.5 text-xs text-stone-500">
                Upload a high-resolution promotional poster for your event.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing Event...
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4" /> Publish Event
                </>
              )}
            </button>

          </form>
        </div>
      </main>
    </>
  );
}