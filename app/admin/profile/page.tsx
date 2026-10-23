"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface AdminProfileType {
_id: string;
firstName: string;
lastName: string;
email: string;
image?: string;
role: string;
}

export default function AdminProfilePage() {
const [profile, setProfile] = useState<AdminProfileType | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchProfile = async () => {
try {
const response = await api.get("/users/my-profile", {
withCredentials: true,
});

    setProfile(response.data.data);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };

      setError(
        apiError.response?.data?.message || "Failed to load profile."
      );
    } else {
      setError("Unable to connect to the backend.");
    }
  } finally {
    setLoading(false);
  }
};

fetchProfile();

}, []);

return (
<> <AdminNavbar />

  <main className="min-h-screen bg-gray-100 p-6 md:p-10">
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/dashboard"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-gray-900">
        Admin Profile
      </h1>

      <p className="mt-2 text-gray-600">
        View your account information.
      </p>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading profile...</p>
      ) : error ? (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      ) : profile ? (
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 border-b pb-6 sm:flex-row">
            {profile.image ? (
              <img
                src={
                  profile.image.startsWith("http")
                    ? profile.image
                    : `${process.env.NEXT_PUBLIC_BACKEND_URL?.replace(
                        /\/api\/?$/,
                        ""
                      )}${profile.image}`
                }
                alt="Admin profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
                👤
              </div>
            )}

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="mt-1 text-gray-600">{profile.email}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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

            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="mt-1 font-medium text-gray-900">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <Link
              href="/admin/profile/edit"
              className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Edit Profile
            </Link>
          </div>
        </section>
      ) : (
        <p className="mt-6 text-gray-600">Profile not found.</p>
      )}
    </div>
  </main>
</>

);
}
