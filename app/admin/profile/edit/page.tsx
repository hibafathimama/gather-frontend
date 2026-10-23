"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AdminNavbar from "@/components/AdminNavbar";

interface AdminProfileType {
firstName: string;
lastName: string;
email: string;
image?: string;
role: string;
}

export default function EditAdminProfilePage() {
const router = useRouter();

const [formData, setFormData] = useState({
firstName: "",
lastName: "",
email: "",
});

const [image, setImage] = useState<File | null>(null);
const [currentImage, setCurrentImage] = useState("");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

useEffect(() => {
const fetchProfile = async () => {
try {
const response = await api.get("/users/my-profile", {
withCredentials: true,
});

    const profile: AdminProfileType = response.data.data;

    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
    });

    setCurrentImage(profile.image || "");
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

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
setFormData({
...formData,
[event.target.name]: event.target.value,
});
};

const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
const selectedFile = event.target.files?.[0];

if (!selectedFile) return;

if (!selectedFile.type.startsWith("image/")) {
  setError("Please select a valid image file.");
  event.target.value = "";
  return;
}

if (selectedFile.size > 5 * 1024 * 1024) {
  setError("Image size must be less than 5 MB.");
  event.target.value = "";
  return;
}

setError("");
setImage(selectedFile);

};

const getImageUrl = (imagePath: string) => {
if (!imagePath) return "";

if (imagePath.startsWith("http")) return imagePath;

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(
  /\/api\/?$/,
  ""
);

return `${backendUrl || ""}${imagePath}`;

};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
event.preventDefault();

setError("");
setSuccess("");

if (!formData.firstName.trim() || !formData.lastName.trim()) {
  setError("First name and last name are required.");
  return;
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
  setError("Please enter a valid email address.");
  return;
}

try {
  setSaving(true);

  const data = new FormData();

  data.append("firstName", formData.firstName.trim());
  data.append("lastName", formData.lastName.trim());
  data.append("email", formData.email.trim().toLowerCase());

  if (image) {
    data.append("image", image);
  }

  const response = await api.put("/users/my-profile", data, {
    withCredentials: true,
  });

  setSuccess(response.data.message || "Profile updated successfully.");

  setTimeout(() => {
    router.push("/admin/profile");
    router.refresh();
  }, 1000);
} catch (err: unknown) {
  if (err && typeof err === "object" && "response" in err) {
    const apiError = err as {
      response?: { data?: { message?: string } };
    };

    setError(
      apiError.response?.data?.message || "Failed to update profile."
    );
  } else {
    setError("Unable to connect to the backend.");
  }
} finally {
  setSaving(false);
}

};

return (
<> <AdminNavbar />

  <main className="min-h-screen bg-gray-100 p-6 md:p-10">
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/profile"
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        ← Back to Profile
      </Link>

      <h1 className="mt-5 text-3xl font-bold text-gray-900">
        Edit Admin Profile
      </h1>

      <p className="mt-2 text-gray-600">
        Update your personal information.
      </p>

      {loading ? (
        <p className="mt-6 text-gray-600">Loading profile...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow-sm"
        >
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <div>
            <label
              htmlFor="firstName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Profile Picture
            </label>

            {currentImage && !image && (
              <img
                src={getImageUrl(currentImage)}
                alt="Current profile"
                className="mb-3 h-20 w-20 rounded-full object-cover"
              />
            )}

            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Selected profile preview"
                className="mb-3 h-20 w-20 rounded-full object-cover"
              />
            )}

            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600"
            />

            <p className="mt-1 text-xs text-gray-500">
              Choose an image smaller than 5 MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href="/admin/profile"
              className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  </main>
</>

);
}
