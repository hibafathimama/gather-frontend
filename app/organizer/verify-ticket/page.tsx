"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanLine, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Ticket } from "lucide-react";
import api from "@/lib/api";

export default function VerifyTicketPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/bookings/verify-ticket", {
        token: token.trim(),
      });

      setSuccess(true);
      setMessage(
        response.data.message || "Ticket verified successfully!"
      );
      setToken("");
    } catch (error: unknown) {
      setSuccess(false);

      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? String(
              (
                error as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message || "Failed to verify ticket."
            )
          : "Unable to connect to the server.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
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

      <main className="min-h-screen bg-[#FFECD1] px-4 py-12 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1] sm:px-6">
        <div className="mx-auto max-w-xl">
          
          {/* Top Header & Navigation */}
          <div className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-6">
            <div>
              <span className="mb-1 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#3E000C]">
                Pass Check-in
              </span>
              <h1 className="editorial-heading text-4xl font-bold tracking-tight text-[#3E000C] sm:text-5xl">
                Verify Ticket
              </h1>
            </div>

            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#F5D8B3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#3E000C] shadow-sm transition-all hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          {/* Verification Form Card */}
          <div className="rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFECD1] text-[#3E000C]">
                <ScanLine className="h-6 w-6" />
              </span>
              <div>
                <h2 className="editorial-heading text-2xl font-bold text-[#3E000C]">
                  Attendee Validation
                </h2>
                <p className="text-xs font-semibold text-stone-500">
                  Enter or scan the attendee ticket token to validate admission.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label
                  htmlFor="ticket-token"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
                >
                  Ticket Token Code
                </label>

                <div className="relative">
                  <input
                    id="ticket-token"
                    type="text"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="e.g. TKT-9842-X7L"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 px-5 py-3.5 pr-12 text-sm text-stone-900 placeholder-stone-400 outline-none transition-all focus:border-[#3E000C] focus:bg-white focus:ring-4 focus:ring-[#3E000C]/10"
                    required
                  />
                  <Ticket className="absolute right-4 top-3.5 h-5 w-5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3E000C] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#3E000C]/20 transition-all hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Pass...
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" /> Verify Ticket Pass
                  </>
                )}
              </button>
            </form>

            {/* Status Feedback Message */}
            {message && (
              <div
                role="status"
                className={`mt-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-medium shadow-sm border ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {success ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-xs uppercase tracking-wider">
                    {success ? "Verification Successful" : "Verification Error"}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">{message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}