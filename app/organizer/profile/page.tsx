"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
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

        console.log("Request URL:", `${backendUrl}/users/my-profile`);
        console.log("Response status:", response.status);
        console.log("Response:", responseText);

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

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch profile.");
        }

        setProfile(result.data);
        setFormData(result.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
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
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
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

  if (loading) {
    return (
      <>
        <OrganizerHeader />
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-gray-600">Loading your profile...</p>
        </main>
      </>
    );
  }

  if (!profile || !formData) {
    return (
      <>
        <OrganizerHeader />
        <main className="min-h-screen bg-gray-100 p-6">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
            <p className="text-red-600">
              {error || "Unable to load your profile."}
            </p>
            <Link
              href="/organizer/dashboard"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  const displayedImage =
    previewImage || getProfileImageUrl(profile.image);




  return (
    <>
      <OrganizerHeader />

      <main className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="mt-2 text-gray-600">
              View and manage your organizer account information.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
              <div className="flex items-center gap-4">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                    {profile.firstName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-sm capitalize text-gray-500">
                    {profile.role}
                  </p>
                </div>
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
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <p className="mb-5 rounded-lg bg-green-100 p-3 text-green-700">
                {message}
              </p>
            )}

            {error && (
              <p className="mb-5 rounded-lg bg-red-100 p-3 text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleUpdate}>
              {editing && (
                <div className="mb-6">
                  <label
                    htmlFor="image"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Update Profile Image
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="block w-full rounded-lg border border-gray-300 p-3 text-gray-700"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    JPG, PNG, or WEBP. Maximum size: 2 MB.
                  </p>
                  {previewImage && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-gray-600">
                        Image preview
                      </p>
                      <img
                        src={previewImage}
                        alt="Selected profile preview"
                        width={120}
                        height={120}
                        className="h-[120px] w-[120px] rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing || saving}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block font-medium text-gray-700">
                    Account Role
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 capitalize text-gray-600"
                  />
                </div>
              </div>

              {editing && (
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8 border-t pt-5">
              <Link
                href="/organizer/dashboard"
                className="font-medium text-blue-600 hover:underline"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
