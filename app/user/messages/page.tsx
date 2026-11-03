"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface EventType {
_id: string;
eventName?: string;
}

interface OrganizerType {
_id: string;
firstName?: string;
lastName?: string;
}

interface ConversationType {
event: EventType;
organizer: OrganizerType;
lastMessage: string;
updatedAt: string;
unreadCount?: number;
}

export default function UserMessagesPage() {
const [conversations, setConversations] = useState<ConversationType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
const fetchConversations = async () => {
try {
setLoading(true);
setError("");

    const response = await api.get("/messages/user/conversations");

    setConversations(response.data.data || []);
  } catch (err: unknown) {
    console.error("Fetch conversations error:", err);
    setError("Unable to load your conversations. Please try again.");
  } finally {
    setLoading(false);
  }
};

fetchConversations();

}, []);

const formatDate = (date: string) => {
return new Date(date).toLocaleString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
});
};

return ( <main className="min-h-screen bg-[#FFECD1] px-4 py-8 text-stone-900 sm:px-8"> <div className="mx-auto max-w-4xl">

    <Link
      href="/user/dashboard"
      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#3E000C] hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Dashboard
    </Link>

    <section className="overflow-hidden rounded-2xl border border-[#F5D8B3] bg-white shadow-sm">

      <div className="flex items-center gap-3 bg-[#3E000C] p-6 text-[#FFECD1]">
        <MessageCircle className="h-7 w-7" />

        <div>
          <h1 className="text-2xl font-bold">My Messages</h1>
          <p className="mt-1 text-sm text-[#FFECD1]/75">
            Your conversations with event organizers
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">

        {loading ? (
          <div className="flex justify-center gap-2 py-12 text-stone-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading conversations...
          </div>
        ) : error ? (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-[#3E000C]/40" />

            <h2 className="text-lg font-semibold text-[#3E000C]">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Contact an event organizer from an event details page to
              start a conversation.
            </p>

            <Link
              href="/events"
              className="mt-5 inline-flex rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2B0008]"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation, index) => (
              <div
                key={`${conversation.event?._id}-${conversation.organizer?._id}-${index}`}
                className="flex flex-col justify-between gap-4 rounded-xl border border-[#F5D8B3] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#3E000C]">
                    {conversation.event?.eventName || "Event"}
                  </h2>

                  <p className="mt-1 text-sm text-stone-600">
                    Organizer:{" "}
                    {conversation.organizer
                      ? `${conversation.organizer.firstName || ""} ${
                          conversation.organizer.lastName || ""
                        }`.trim() || "Organizer"
                      : "Organizer"}
                  </p>

                  <p className="mt-2 break-words text-sm text-stone-500">
                    {conversation.lastMessage}
                  </p>

                  <p className="mt-2 text-xs text-stone-400">
                    {formatDate(conversation.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {conversation.unreadCount ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      {conversation.unreadCount} unread
                    </span>
                  ) : null}

                  <Link
                    href={`/user/messages/${conversation.event?._id}`}
                    className="rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2B0008]"
                  >
                    Open Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  </div>
</main>

);
}
