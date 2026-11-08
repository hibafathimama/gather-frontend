"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Armchair,
  ArrowLeft,
  Tag,
  FileText,
  IndianRupee,
  Calendar,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

interface EventFormData {
  eventName: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  description: string;
  ticketPrice: string;
  availableSeats: string;
}

const emptyForm: EventFormData = {
  eventName: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  location: "",
  description: "",
  ticketPrice: "",
  availableSeats: "",
};

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [formData, setFormData] = useState<EventFormData>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image states
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Load existing event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in again.");
        }

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(
          `${backendUrl}/events/${eventId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || "Failed to load event.");
        }

        const event = result.data ?? result.event ?? result;

        if (!event || !event.eventName) {
          throw new Error("Event details were not found.");
        }

        // Load existing event image
        if (event.image) {
          const backendOrigin = backendUrl.replace(/\/api\/?$/, "");

          const imageUrl = event.image.startsWith("http")
            ? event.image
            : `${backendOrigin}/${event.image.replace(/^\/+/, "")}`;

          setCurrentImage(imageUrl);
        }

        const dateValue = event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "";

        setFormData({
          eventName: event.eventName ?? "",
          category: event.category ?? "",
          date: dateValue,
          time: event.time ?? "",
          venue: event.venue ?? "",
          location: event.location ?? "",
          description: event.description ?? "",
          ticketPrice: String(event.ticketPrice ?? ""),
          availableSeats: String(event.availableSeats ?? ""),
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, backendUrl]);

  // Handle text field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle image selection
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedImage(file);

    // Create image preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // Update event
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      if (!backendUrl) {
        throw new Error("Backend URL is not configured.");
      }

      // Validate description
      if (formData.description.trim().length < 10) {
        throw new Error(
          "Description must contain at least 10 characters."
        );
      }

      // Validate ticket price
      const ticketPrice = Number(formData.ticketPrice);

      if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
        throw new Error("Ticket price must be greater than 0.");
      }

      // Validate available seats
      const availableSeats = Number(formData.availableSeats);

      if (
        !Number.isInteger(availableSeats) ||
        availableSeats <= 0
      ) {
        throw new Error(
          "Available seats must be greater than 0."
        );
      }

      // Create FormData for image and event details
      const updateData = new FormData();

      updateData.append("eventName", formData.eventName.trim());
      updateData.append("category", formData.category);
      updateData.append("date", formData.date);
      updateData.append("time", formData.time);
      updateData.append("venue", formData.venue.trim());
      updateData.append("location", formData.location.trim());
      updateData.append(
        "description",
        formData.description.trim()
      );
      updateData.append("ticketPrice", String(ticketPrice));
      updateData.append(
        "availableSeats",
        String(availableSeats)
      );

      // Add new image only if selected
      if (selectedImage) {
        updateData.append("image", selectedImage);
      }

      const response = await fetch(
        `${backendUrl}/events/${eventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: updateData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update event."
        );
      }

      alert("Event updated successfully!");

      router.push("/organizer/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFECD1] p-8 flex items-center justify-center text-stone-700">
        <div className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-[#3E000C]" />
          Loading event details...
        </div>
      </main>
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

      <main className="min-h-screen bg-[#FFECD1] px-4 py-12 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
        <div className="mx-auto max-w-3xl">

          {/* Header Section */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Organizer Portal
              </span>

              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Edit Event
              </h1>

              <p className="mt-1 text-sm text-stone-600">
                Modify your event specifications and update attendee details below.
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
            className="space-y-6 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                <Calendar className="h-6 w-6" />
              </span>

              <div>
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Event Configuration
                </h2>

                <p className="text-xs font-semibold text-stone-500">
                  Make sure all critical fields are accurate before saving changes.
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
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
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
                  value={formData.category}
                  onChange={handleChange}
                  required
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
                    value={formData.date}
                    onChange={handleChange}
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
                    value={formData.time}
                    onChange={handleChange}
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
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Enter venue name"
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
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter city or location"
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event (minimum 10 characters)"
                  rows={4}
                  minLength={10}
                  required
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                />

                <FileText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-stone-400" />
              </div>

              <p className="mt-1 text-xs text-stone-500">
                Minimum 10 characters required.
              </p>
            </div>

            {/* Ticket Price and Available Seats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Ticket Price (₹) *
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter ticket price"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />

                  <IndianRupee className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                  Available Seats *
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="Enter available seats"
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />

                  <Armchair className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-stone-400" />
                </div>
              </div>
            </div>

            {/* Event Image Upload */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                Event Banner Image
              </label>

              {/* Image Preview */}
              {(imagePreview || currentImage) && (
                <div className="mb-4">
                  <img
                    src={imagePreview || currentImage || ""}
                    alt="Event Banner"
                    className="h-56 w-full rounded-2xl border border-stone-200 object-cover"
                  />

                  <p className="mt-2 text-xs font-medium text-stone-500">
                    {imagePreview
                      ? "New image preview"
                      : "Current event image"}
                  </p>
                </div>
              )}

              {/* Select New Image */}
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 text-sm text-stone-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#3E000C] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white hover:file:bg-[#2B0008]"
                />

                <ImageIcon className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-stone-400" />
              </div>

              <p className="mt-2 text-xs text-stone-500">
                Select a new image to replace the existing event banner.
                Leave empty to keep the current image.
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
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Event...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Update Event
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
