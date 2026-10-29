"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  Camera,
  Pencil,
  Save,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import OrganizerHeader from "@/components/OrganizerHeader";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image?: string;
}

export default function OrganizerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!token) {
          throw new Error("Please log in to view your profile.");
        }

        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        const response = await fetch(`${backendUrl}/users/my-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The server returned HTML instead of JSON. Check the API URL and backend route."
          );
        }

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch profile.");
        }

        setProfile(result.data);
        setFormData(result.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Convert a backend image path such as /uploads/profiles/image.png
  // into a full URL using the backend host, not the /api endpoint.
  const getProfileImageUrl = (imagePath?: string) => {
    if (!imagePath) return "";

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return "";

    const backendOrigin = backendUrl.replace(/\/api\/?$/, "");
    return `${backendOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!token || !backendUrl) {
        throw new Error("Please log in again.");
      }

      // FormData lets us send text fields and the optional image together.
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);

      if (selectedImage) {
        data.append("image", selectedImage);
      }

      const response = await fetch(`${backendUrl}/users/my-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile.");
      }

      setProfile(result.data);
      setFormData(result.data);
      setSelectedImage(null);
      setPreviewImage("");
      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) setFormData(profile);

    setSelectedImage(null);
    setPreviewImage("");
    setEditing(false);
    setError("");
    setMessage("");
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white py-3 pl-11 pr-4 text-stone-900 outline-none transition focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15 disabled:cursor-default disabled:border-stone-200 disabled:bg-stone-50 disabled:text-stone-700";
  const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400";

  if (loading) {
    return (
      <>
        <OrganizerHeader />
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#FFECD1] text-[#3E000C]">
          <p className="flex items-center gap-2 font-medium">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your profile...
          </p>
        </main>
      </>
    );
  }

  if (!profile || !formData) {
    return (
      <>
        <OrganizerHeader />
        <main className="min-h-screen bg-[#FFECD1] px-4 py-10">
          <div
            role="alert"
            className="mx-auto max-w-md rounded-xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm"
          >
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
              <AlertCircle className="h-6 w-6" />
            </span>
            <p className="mb-5 text-sm text-stone-700">
              {error || "Unable to load your profile."}
            </p>
            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  const displayedImage = previewImage || getProfileImageUrl(profile.image);

  return (
    <>
      <OrganizerHeader />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/organizer/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3E000C] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm">
            {/* Profile banner */}
            <div className="flex items-center gap-4 bg-[#3E000C] px-6 py-6 text-[#FFECD1]">
              {displayedImage ? (
                <img
                  src={displayedImage}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-[#FFECD1]/40 object-cover"
                />
              ) : (
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#FFECD1] text-2xl font-bold text-[#3E000C]">
                  {profile.firstName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="mt-0.5 text-sm capitalize text-[#FFECD1]/75">
                  {profile.role} account
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#3E000C]">
                    My profile
                  </h2>
                  <p className="mt-0.5 text-sm text-stone-600">
                    View and manage your organizer account information.
                  </p>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profile);
                      setEditing(true);
                      setMessage("");
                      setError("");
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </button>
                )}
              </div>

              {message && (
                <p
                  role="status"
                  className="mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {message}
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <form onSubmit={handleUpdate} className="space-y-5">
                {editing && (
                  <div>
                    <span className={labelClass}>Profile image</span>
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#3E000C]/25 px-3.5 py-2 text-sm font-medium text-[#3E000C] transition focus-within:ring-2 focus-within:ring-[#3E000C]/30 hover:bg-[#3E000C] hover:text-white ${
                        saving ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      <Camera className="h-4 w-4" />
                      {previewImage ? "Choose a different image" : "Change image"}
                      <input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        disabled={saving}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1.5 text-xs text-stone-500">
                      JPG, PNG or WEBP. Maximum size: 2 MB.
                      {previewImage && " The new image shows in the banner above."}
                    </p>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name
                    </label>
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editing || saving}
                        autoComplete="given-name"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last name
                    </label>
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editing || saving}
                        autoComplete="family-name"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className={iconClass} />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editing || saving}
                        autoComplete="email"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="role" className={labelClass}>
                      Account role
                    </label>
                    <div className="relative">
                      <ShieldCheck className={iconClass} />
                      <input
                        id="role"
                        type="text"
                        value={profile.role}
                        disabled
                        className={`${inputClass} capitalize`}
                      />
                    </div>
                  </div>
                </div>

                {editing && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Saving..." : "Save changes"}
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleCancel}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}