"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageCircle,
  ArrowLeft,
  Loader2,
  UserRound,
  Mail,
  Building2,
  Bell,
} from "lucide-react";

import api from "@/lib/api";

interface OrganizerType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  organizerDetails?: {
    organizationName?: string;
  };
}

interface ConversationType {
  organizer: {
    _id: string;
  };
  unreadCount: number;
}

export default function AdminMessagesPage() {
  const [organizers, setOrganizers] = useState<OrganizerType[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessagesData = useCallback(async () => {
    try {
      const [organizerResponse, conversationResponse] = await Promise.all([
        api.get("/messages/admin-organizer/organizers"),
        api.get("/messages/admin-organizer/admin/conversations"),
      ]);

      setOrganizers(organizerResponse.data.data || []);

      const counts: Record<string, number> = {};

      const conversations: ConversationType[] =
        conversationResponse.data.data || [];

      conversations.forEach((conversation) => {
        const organizerId = conversation.organizer?._id;

        if (organizerId) {
          counts[organizerId] = conversation.unreadCount || 0;
        }
      });

      setUnreadCounts(counts);
      setError("");
    } catch (err) {
      console.error("Failed to fetch messages data:", err);
      setError("Failed to load organizers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessagesData();

    const interval = setInterval(() => {
      fetchMessagesData();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchMessagesData]);

  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (total, count) => total + count,
    0
  );

  return (
    <main className="min-h-screen bg-[#FFF9F2] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <Link
          href="/admin/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3E000C] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#3E000C] text-white">
            <MessageCircle size={24} />
          </div>

          <h1 className="text-2xl font-bold text-[#3E000C] sm:text-3xl">
            Organizer Messages
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Select an organizer to view messages and start a direct conversation.
          </p>

          {totalUnreadMessages > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <Bell size={17} />
              {totalUnreadMessages} unread message
              {totalUnreadMessages !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Organizer List */}
        <div className="rounded-2xl border border-[#EADFD3] bg-white p-4 shadow-sm sm:p-6">

          <h2 className="mb-5 text-lg font-semibold text-[#3E000C]">
            All Organizers ({organizers.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center py-16">
              <Loader2
                size={32}
                className="animate-spin text-[#3E000C]"
              />
              <p className="mt-3 text-sm text-gray-500">
                Loading organizers...
              </p>
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-600">
              {error}
            </p>
          ) : organizers.length === 0 ? (
            <div className="py-16 text-center">
              <UserRound
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />
              <h3 className="font-semibold text-gray-700">
                No organizers found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Registered organizers will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {organizers.map((organizer) => {
                const unreadCount = unreadCounts[organizer._id] || 0;

                return (
                  <div
                    key={organizer._id}
                    className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      unreadCount > 0
                        ? "border-red-200 bg-red-50/40"
                        : "border-[#F0E5DA] hover:bg-[#FFF9F2]"
                    }`}
                  >
                    {/* Organizer Details */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3E000C]/10 text-[#3E000C]">
                        <UserRound size={24} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#3E000C]">
                            {organizer.firstName} {organizer.lastName}
                          </h3>

                          {unreadCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              {unreadCount} New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Mail size={13} />
                          {organizer.email}
                        </p>

                        {organizer.organizerDetails?.organizationName && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Building2 size={13} />
                            {organizer.organizerDetails.organizationName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message Button */}
                    <Link
                      href={`/admin/messages/${organizer._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A0012]"
                    >
                      <MessageCircle size={17} />
                      {unreadCount > 0 ? "View Messages" : "Message"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}