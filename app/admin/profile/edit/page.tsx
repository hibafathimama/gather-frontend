"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Image as ImageIcon, 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
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
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <AdminNavbar />

      <main className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] md:p-12">
        <div className="mx-auto max-w-2xl">
          
          {/* Back Navigation Link */}
          <Link
            href="/admin/profile"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] transition hover:opacity-75 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>

          {/* Page Header */}
          <div className="mb-8 border-b border-[#F5D8B3] pb-6">
            <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
              Credentials Settings
            </span>
            <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
              Edit Admin Profile
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Update your personal administrator information and profile avatar.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
              Loading profile details...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm"
            >
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  {success}
                </div>
              )}

              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  First Name *
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Last Name *
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <User className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-4 py-3.5 pl-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                  />
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* Profile Picture Upload & Preview */}
              <div>
                <label
                  htmlFor="image"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Profile Picture
                </label>

                <div className="mb-4 flex items-center gap-4">
                  {currentImage && !image && (
                    <img
                      src={getImageUrl(currentImage)}
                      alt="Current profile"
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-[#F5D8B3] shadow-sm"
                    />
                  )}

                  {image && (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Selected profile preview"
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-[#3E000C] shadow-sm"
                    />
                  )}
                </div>

                <div className="relative">
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-3.5 pl-11 text-sm text-stone-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#3E000C] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:text-white hover:file:bg-[#2B0008]"
                  />
                  <ImageIcon className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>

                <p className="mt-1.5 text-xs text-stone-500">
                  Choose a clear square image smaller than 5 MB.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  )}
                </button>

                <Link
                  href="/admin/profile"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
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