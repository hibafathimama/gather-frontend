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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">
          {error || "Unable to load your profile."}
        </p>

        <Link
          href="/login"
          className="rounded-lg bg-amber-800 px-5 py-2 text-white hover:bg-amber-900"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 px-4 py-12">
  <div className="mx-auto max-w-xl">
    <Link
      href="/user/dashboard"
      className="mb-6 inline-block text-sm text-gray-600 hover:text-amber-800"
    >
      ← Back to Dashboard
    </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Profile Header */}
          <div className="bg-amber-800 px-6 py-8 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-amber-800">
              {profile.firstName?.charAt(0).toUpperCase()}
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              My Profile
            </h1>

            <p className="mt-1 text-amber-100">
              Manage your account information
            </p>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            {error && (
              <p className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
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
                    className="mb-1 block text-sm font-medium text-gray-700"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1 block text-sm font-medium text-gray-700"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-gray-700"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-amber-800 px-5 py-3 font-medium text-white hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.firstName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="mt-1 break-words font-medium text-gray-900">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <p className="mt-1 font-medium capitalize text-gray-900">
                    {profile.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setError("");
                    setMessage("");
                  }}
                  className="w-full rounded-lg bg-amber-800 px-5 py-3 font-medium text-white hover:bg-amber-900"
                >
                  Edit Profile
                </button>
              </div>
            )}

            <Link
              href="/user/bookings"
              className="mt-4 block rounded-lg border border-amber-800 px-5 py-3 text-center font-medium text-amber-800 hover:bg-amber-50"
            >
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}