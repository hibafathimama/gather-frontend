"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  Pencil, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
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
        <div className="mx-auto max-w-3xl">
          
          {/* Back Navigation Link */}
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3E000C] transition hover:opacity-75 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          {/* Page Header */}
          <div className="mb-8 border-b border-[#F5D8B3] pb-6">
            <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
              Super Admin Account
            </span>
            <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
              Admin Profile
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Manage and view your administrator credentials and account status.
            </p>
          </div>

          {/* Conditional States */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-stone-600 font-medium">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#3E000C]" />
              Loading profile details...
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          ) : profile ? (
            <section className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
              
              {/* Profile Card Header */}
              <div className="flex flex-col items-center gap-6 border-b border-stone-100 pb-8 sm:flex-row">
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
                    className="h-28 w-28 rounded-2xl object-cover shadow-md border-2 border-[#F5D8B3]"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C] shadow-sm border border-[#F5D8B3]">
                    <User className="h-12 w-12" />
                  </div>
                )}

                <div className="text-center sm:text-left">
                  <h2 className="editorial-heading text-3xl font-bold text-[#3E000C]">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="mt-1 text-sm text-stone-600 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="h-4 w-4 text-[#3E000C]" /> {profile.email}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#3E000C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
                    <ShieldCheck className="h-3.5 w-3.5" /> {profile.role}
                  </span>
                </div>
              </div>

              {/* Profile Information Grid */}
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">First Name</p>
                  <p className="mt-1 text-base font-bold text-stone-900">
                    {profile.firstName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Last Name</p>
                  <p className="mt-1 text-base font-bold text-stone-900">
                    {profile.lastName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F5D8B3]/60 bg-[#FFECD1]/30 p-4 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Email Address</p>
                  <p className="mt-1 text-base font-bold text-stone-900">
                    {profile.email}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-8 border-t border-stone-100 pt-6">
                <Link
                  href="/admin/profile/edit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] active:scale-95"
                >
                  <Pencil className="h-4 w-4" /> Edit Admin Profile
                </Link>
              </div>

            </section>
          ) : (
            <div className="rounded-3xl border border-[#F5D8B3] bg-white p-12 text-center shadow-sm">
              <p className="text-stone-600 font-medium">Profile data not found.</p>
            </div>
          )}

        </div>
      </main>
    </>
  );
}