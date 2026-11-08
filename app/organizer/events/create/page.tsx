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
  AlertCircle,
  WandSparkles,
} from "lucide-react";

// Generate row labels: A, B, C ... Z, AA, AB...
const getRowLabel = (index: number) => {
  let label = "";
  let number = index + 1;

  while (number > 0) {
    number--;
    label = String.fromCharCode(65 + (number % 26)) + label;
    number = Math.floor(number / 26);
  }

  return label;
};

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [seatingType, setSeatingType] = useState("general");

  // Seat generation states
  const [totalSeats, setTotalSeats] = useState("");
  const [seatsPerRow, setSeatsPerRow] = useState("6");
  const [generatedSeats, setGeneratedSeats] = useState<string[]>([]);

  // Generate seat numbers automatically
  const handleGenerateSeats = () => {
    setError(null);

    const total = Number(totalSeats);
    const perRow = Number(seatsPerRow);

    if (!Number.isInteger(total) || total <= 0) {
      setError("Please enter a valid total number of seats.");
      return;
    }

    if (!Number.isInteger(perRow) || perRow <= 0) {
      setError("Seats per row must be greater than 0.");
      return;
    }

    const seats: string[] = [];

    for (let i = 0; i < total; i++) {
      const rowIndex = Math.floor(i / perRow);
      const seatNumber = (i % perRow) + 1;

      const row = getRowLabel(rowIndex);

      seats.push(`${row}${seatNumber}`);
    }

    setGeneratedSeats(seats);
  };

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

      // Validate event image
      const imageFile = formData.get("image");

      if (!(imageFile instanceof File) || imageFile.size === 0) {
        throw new Error("Please upload an event banner image.");
      }

      // Validate description
      const description = String(
        formData.get("description") || ""
      ).trim();

      if (description.length < 10) {
        throw new Error(
          "Description must contain at least 10 characters."
        );
      }

      // Validate ticket price
      const ticketPrice = Number(formData.get("ticketPrice"));

      if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
        throw new Error("Ticket price must be greater than 0.");
      }

      // Validate total seats
      const total = Number(formData.get("totalSeats"));

      if (!Number.isInteger(total) || total <= 0) {
        throw new Error("Total seats must be greater than 0.");
      }

      // Validate generated reserved seats
      if (seatingType === "reserved") {
        if (generatedSeats.length !== total) {
          throw new Error(
            `Please generate exactly ${total} seat numbers before creating the event.`
          );
        }

        formData.set("seats", JSON.stringify(generatedSeats));
      } else {
        formData.delete("seats");
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        throw new Error("Backend URL is not configured.");
      }

      const response = await fetch(`${backendUrl}/events/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event.");
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
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          {/* Form Card */}
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

                <CalendarDays className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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

                <Tag className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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

                  <CalendarDays className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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

                  <Clock className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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

                <Building2 className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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

                <MapPin className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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
                  minLength={10}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />

                <FileText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-stone-400" />
              </div>

              <p className="mt-1.5 text-xs text-stone-500">
                Minimum 10 characters required.
              </p>
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
                  setGeneratedSeats([]);
                  setError(null);
                }}
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 text-sm text-stone-900 outline-none focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
              >
                <option value="general">General Admission</option>
                <option value="reserved">Reserved Seating</option>
              </select>

              <p className="mt-1.5 text-xs text-stone-500">
                Choose whether attendees can select individual seats.
              </p>
            </div>

            {/* Automatic Seat Generation */}
            {seatingType === "reserved" && (
              <div className="space-y-4 rounded-2xl border border-[#F5D8B3] bg-[#FFECD1]/30 p-5">

                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#3E000C]">
                    <Armchair className="h-5 w-5" />
                    Automatic Seat Generation
                  </h3>

                  <p className="mt-1 text-xs text-stone-500">
                    Generate seat numbers automatically instead of typing them manually.
                  </p>
                </div>

                {/* Seats Per Row */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                    Seats Per Row *
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={seatsPerRow}
                    onChange={(e) => {
                      setSeatsPerRow(e.target.value);
                      setGeneratedSeats([]);
                    }}
                    placeholder="6"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none focus:border-[#3E000C] focus:ring-4 focus:ring-[#3E000C]/10"
                  />

                  <p className="mt-1 text-xs text-stone-500">
                    Example: Enter 6 to generate 6 seats in each row.
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateSeats}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E000C] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#2B0008] active:scale-95"
                >
                  <WandSparkles className="h-4 w-4" />
                  Generate Seats
                </button>

                {/* Generated Seats Preview */}
                {generatedSeats.length > 0 && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">

                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-green-800">
                        Seats Generated Successfully!
                      </p>

                      <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-bold text-green-800">
                        {generatedSeats.length} Seats
                      </span>
                    </div>

                    <p className="mb-3 text-xs text-green-700">
                      Preview of your generated seat numbers:
                    </p>

                    <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-green-100 bg-white p-3 sm:grid-cols-6">
                      {generatedSeats.map((seat) => (
                        <div
                          key={seat}
                          className="rounded-lg border border-green-200 bg-green-50 px-2 py-2 text-center text-xs font-bold text-green-800"
                        >
                          {seat}
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs font-medium text-green-700">
                      All {generatedSeats.length} seat numbers will be saved when you publish the event.
                    </p>
                  </div>
                )}
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
                    min="0.01"
                    step="0.01"
                    placeholder="499"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />

                  <IndianRupee className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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
                    value={totalSeats}
                    onChange={(e) => {
                      setTotalSeats(e.target.value);
                      setGeneratedSeats([]);
                    }}
                    placeholder="250"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />

                  <Armchair className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
                </div>

                {seatingType === "reserved" && (
                  <p className="mt-1 text-xs text-stone-500">
                    Generate exactly this number of seats.
                  </p>
                )}
              </div>
            </div>

            {/* Event Image Upload */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Event Banner Image *
              </label>

              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 pl-11 text-sm text-stone-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#3E000C] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white hover:file:bg-[#2B0008]"
                />

                <ImageIcon className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4" />
                  Publish Event
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}