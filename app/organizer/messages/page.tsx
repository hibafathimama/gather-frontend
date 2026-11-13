"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";

interface UserType {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface EventType {
  _id: string;
  eventName?: string;
}

interface MessageType {
  message: string;
  createdAt: string;
}

interface ConversationType {
  event: EventType;
  user: UserType;
  lastMessage: MessageType;
  unreadCount: number;
}

interface AdminConversationType {
  admin: UserType;
  lastMessage: MessageType;
  unreadCount: number;
}

export default function OrganizerMessagesPage() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [adminConversations, setAdminConversations] = useState<
    AdminConversationType[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

useEffect(() => {
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch existing User-Organizer conversations
      try {
        const userResponse = await api.get(
          "/messages/organizer/conversations"
        );

        setConversations(userResponse.data.data || []);
        console.log("User conversations:", userResponse.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "USER CONVERSATION ERROR:",
            err.response?.status,
            err.response?.data
          );
        }
      }

      // Fetch Admin-Organizer conversations
      try {
        const adminResponse = await api.get(
          "/messages/admin-organizer/conversations"
        );

        setAdminConversations(adminResponse.data.data || []);
        console.log("Admin conversations:", adminResponse.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error(
            "ADMIN CONVERSATION ERROR:",
            err.response?.status,
            err.response?.data
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  fetchConversations();
}, []);

  return (
    <main className="min-h-screen bg-[#FFF9F2] p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/organizer/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3E000C] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-[#3E000C]">
            <MessageCircle className="h-8 w-8" />
            Messages
          </h1>

          <p className="mt-2 text-stone-600">
            View and reply to messages from users and the admin.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center text-stone-500 shadow-sm">
            Loading conversations...
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-5 text-center text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Admin Messages */}
            <section className="mb-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#3E000C]">
                <ShieldCheck className="h-5 w-5" />
                Messages from Admin
              </h2>

              {adminConversations.length === 0 ? (
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-stone-500">
                    No messages from admin yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminConversations.map((conversation, index) => (
                    <Link
                      key={conversation.admin?._id || index}
                      href={`/organizer/messages/admin/${conversation.admin?._id}`}
                      className="block rounded-xl border border-stone-100 bg-white p-5 shadow-sm transition hover:border-[#3E000C]/30 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#3E000C]">
                            Admin
                          </h3>

                          <p className="mt-1 text-sm text-stone-500">
                            {conversation.admin?.email || "Admin"}
                          </p>

                          <p className="mt-3 text-sm text-stone-600">
                            {conversation.lastMessage?.message ||
                              "No messages"}
                          </p>
                        </div>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#3E000C] px-2 text-xs font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Existing User Messages */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#3E000C]">
                <MessageCircle className="h-5 w-5" />
                Messages from Users
              </h2>

              {conversations.length === 0 ? (
                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-stone-500">
                    No messages from users yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation, index) => (
                    <Link
                      key={`${conversation.event?._id}-${conversation.user?._id}-${index}`}
                      href={`/organizer/messages/${conversation.event?._id}?userId=${conversation.user?._id}`}
                      className="block rounded-xl border border-stone-100 bg-white p-5 shadow-sm transition hover:border-[#3E000C]/30 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-[#3E000C]">
                            {conversation.user?.firstName || "User"}{" "}
                            {conversation.user?.lastName || ""}
                          </h3>

                          <p className="mt-1 text-sm text-stone-500">
                            {conversation.user?.email || "Email unavailable"}
                          </p>

                          <p className="mt-3 text-sm font-medium text-stone-700">
                            Event: {conversation.event?.eventName || "Event"}
                          </p>

                          <p className="mt-2 truncate text-sm text-stone-500">
                            {conversation.lastMessage?.message || "No messages"}
                          </p>
                        </div>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#3E000C] px-2 text-xs font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}