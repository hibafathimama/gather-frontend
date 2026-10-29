"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000/api";

  // Fetch the user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your profile.");
          return;
        }

        const response = await fetch(
          `${backendUrl}/users/my-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch profile");
        }

        setProfile(result.data);
        setFirstName(result.data.firstName || "");
        setLastName(result.data.lastName || "");
        setEmail(result.data.email || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
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

      const response = await fetch(
        `${backendUrl}/users/my-profile`,
        {
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
        }
      );

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
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C] font-semibold">
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFECD1] px-4 text-center">
        <div className="w-full max-w-md rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-600 mb-4">
            {error || "Unable to load your profile."}
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#3E000C] px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-xl">

        <div className="mt-8 mb-6">
          <Link
            href="/user/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#3E000C] hover:opacity-70 transition-opacity"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#F5D8B3] bg-white shadow-sm">
          {/* Profile Header */}
          <div className="bg-[#3E000C] px-6 py-8 text-center text-[#FFECD1]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-3xl font-black text-white shadow-inner backdrop-blur-md">
              {profile.firstName?.charAt(0).toUpperCase()}
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
              My Profile
            </h1>

            <p className="mt-1 text-xs font-medium text-stone-300">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {error && (
              <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                {error}
              </p>
            )}

            {message && (
              <p className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 shadow-sm">
                {message}
              </p>
            )}

            {isEditing ? (
              <form
                onSubmit={handleUpdateProfile}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition-all focus:bg-white focus:border-[#3E000C]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition-all focus:bg-white focus:border-[#3E000C]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm text-stone-900 outline-none transition-all focus:bg-white focus:border-[#3E000C]"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#3E000C] px-5 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
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
                    className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-xs font-bold text-stone-700 shadow-sm transition-all hover:bg-stone-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                    <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">First Name</span>
                    <span className="font-semibold text-stone-900">
                      {profile.firstName}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                    <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Last Name</span>
                    <span className="font-semibold text-stone-900">
                      {profile.lastName}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                  <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email Address</span>
                  <span className="font-semibold text-stone-900 break-all">
                    {profile.email}
                  </span>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                  <span className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Account Role</span>
                  <span className="font-semibold text-stone-900 capitalize">
                    {profile.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError("");
                    setMessage("");
                  }}
                  className="w-full rounded-xl bg-[#3E000C] px-5 py-3.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#2B0008]"
                >
                  Edit Profile
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-stone-100">
              <Link
                href="/user/bookings"
                className="flex w-full items-center justify-center rounded-xl border border-[#3E000C] px-5 py-3.5 text-xs font-bold text-[#3E000C] transition-all hover:bg-[#3E000C]/5"
              >
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}