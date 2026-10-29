"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

  // Fetch the user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your profile.");
          return;
        }

        const response = await fetch(`${backendUrl}/users/my-profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch profile");
        }

        setProfile(result.data);
        setFirstName(result.data.firstName || "");
        setLastName(result.data.lastName || "");
        setEmail(result.data.email || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl]);

  // Update the user's profile
  const handleUpdateProfile = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      const response = await fetch(`${backendUrl}/users/my-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile");
      }

      // Update the displayed profile immediately
      setProfile(result.data);
      setFirstName(result.data.firstName || "");
      setLastName(result.data.lastName || "");
      setEmail(result.data.email || "");

      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white py-3 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15";
  const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4">
        <div
          role="alert"
          className="w-full max-w-md rounded-xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm"
        >
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </span>
          <p className="mb-5 text-sm text-stone-700">
            {error || "Unable to load your profile."}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const details = [
    { label: "First name", value: profile.firstName, Icon: User },
    { label: "Last name", value: profile.lastName, Icon: User },
    { label: "Email address", value: profile.email, Icon: Mail },
    { label: "Account role", value: profile.role, Icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-xl">
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

        <div className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm">
          {/* Profile header */}
          <div className="flex items-center gap-4 bg-[#3E000C] px-6 py-6 text-[#FFECD1]">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#FFECD1] text-2xl font-bold text-[#3E000C]">
              {profile.firstName?.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="mt-0.5 text-sm capitalize text-[#FFECD1]/75">
                {profile.role} account
              </p>
            </div>
          </div>

          {/* Profile content */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#3E000C]">
                My profile
              </h2>
              <p className="mt-0.5 text-sm text-stone-600">
                Manage your account information.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="mb-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </p>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name
                    </label>
                    <div className="relative">
                      <User className={iconClass} />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
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
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

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
                    onClick={() => {
                      setFirstName(profile.firstName);
                      setLastName(profile.lastName);
                      setEmail(profile.email);
                      setIsEditing(false);
                      setError("");
                      setMessage("");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <dl className="grid gap-5 sm:grid-cols-2">
                  {details.map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className={`flex items-start gap-3 ${
                        label === "Email address" ? "sm:col-span-2" : ""
                      }`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#FFECD1] text-[#3E000C]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-sm text-stone-500">{label}</dt>
                        <dd
                          className={`break-all font-semibold text-stone-900 ${
                            label === "Account role" ? "capitalize" : ""
                          }`}
                        >
                          {value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError("");
                    setMessage("");
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-stone-100 pt-6">
              <Link
                href="/user/bookings"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#3E000C] px-5 py-3 text-sm font-semibold text-[#3E000C] transition hover:bg-[#3E000C]/5"
              >
                <Ticket className="h-4 w-4" />
                View my bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}