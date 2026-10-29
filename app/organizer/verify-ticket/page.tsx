"use client";

import { useState } from "react";
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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Verify Ticket
        </h1>

        <p className="mt-2 text-gray-600">
          Enter the ticket token to verify a booking.
        </p>

        <form onSubmit={handleVerify} className="mt-6">
          <label
            htmlFor="ticket-token"
            className="mb-2 block font-medium text-gray-700"
          >
            Ticket Token
          </label>

          <input
            id="ticket-token"
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Enter ticket token"
            className="w-full rounded-lg border border-gray-300 p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Ticket"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-lg p-3 ${
              success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
