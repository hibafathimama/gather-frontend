"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MessageType {
_id: string;
sender: string | { _id: string };
receiver: string | { _id: string };
message: string;
isRead: boolean;
createdAt: string;
}

export default function UserMessagesPage() {
const params = useParams();
const eventId = params.eventId as string;

const [messages, setMessages] = useState<MessageType[]>([]);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
const [error, setError] = useState("");

const getUserId = () => {
if (typeof window === "undefined") return "";

const user = localStorage.getItem("user");

if (!user) return "";

try {
  return JSON.parse(user)._id || "";
} catch {
  return "";
}

};

const userId = getUserId();

const fetchMessages = async () => {
try {
const response = await api.get(`/messages/${eventId}`);

  setMessages(response.data.data || []);
} catch (err: unknown) {
  console.error("Fetch messages error:", err);
  setError("Unable to load messages.");
} finally {
  setLoading(false);
}

};

const markAsRead = async () => {
if (!userId) return;

try {
  await api.patch(
    `/messages/${eventId}/conversation/${userId}/read`
  );
} catch (err) {
  console.error("Mark as read error:", err);
}

};

useEffect(() => {
if (!eventId) return;

const loadConversation = async () => {
  await fetchMessages();
  await markAsRead();
};

loadConversation();

}, [eventId]);

const handleSendMessage = async (e: FormEvent) => {
e.preventDefault();

if (!message.trim()) return;

try {
  setSending(true);
  setError("");

  const response = await api.post("/messages/send", {
    eventId,
    message: message.trim(),
  });

  setMessages((previous) => [
    ...previous,
    response.data.data,
  ]);

  setMessage("");
} catch (err: unknown) {
  console.error("Send message error:", err);
  setError("Failed to send message. Please try again.");
} finally {
  setSending(false);
}

};

return ( <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 text-[#3E000C] sm:px-8"> <div className="mx-auto max-w-4xl"> <Link
       href="/user/dashboard"
       className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A3540] hover:text-[#3E000C]"
     > <ArrowLeft size={18} />
Back to Dashboard </Link>

    <div className="overflow-hidden rounded-2xl border border-[#EADBD0] bg-white shadow-sm">
      <div className="flex items-center gap-3 bg-[#3E000C] p-5 text-white">
        <div className="rounded-full bg-white/15 p-3">
          <MessageCircle size={23} />
        </div>

        <div>
          <h1 className="text-xl font-bold">
            Message Organizer
          </h1>
          <p className="text-sm text-white/75">
            Ask questions about this event
          </p>
        </div>
      </div>

      <div className="min-h-[420px] space-y-4 bg-[#FFF9F2] p-5">
        {loading ? (
          <p className="py-16 text-center text-gray-500">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <MessageCircle
              size={42}
              className="mx-auto mb-3 text-[#A77A70]"
            />
            <h2 className="font-semibold">
              Start a conversation
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Send a message to the event organizer.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const senderId =
              typeof item.sender === "string"
                ? item.sender
                : item.sender?._id;

            const isMyMessage = senderId === userId;

            return (
              <div
                key={item._id}
                className={`flex ${
                  isMyMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMyMessage
                      ? "rounded-br-sm bg-[#3E000C] text-white"
                      : "rounded-bl-sm border border-[#EADBD0] bg-white text-[#3E000C]"
                  }`}
                >
                  <p className="break-words text-sm">
                    {item.message}
                  </p>

                  <p
                    className={`mt-2 text-right text-xs ${
                      isMyMessage
                        ? "text-white/60"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && (
        <p className="mx-5 mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex gap-3 border-t border-[#EADBD0] bg-white p-4"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl border border-[#EADBD0] px-4 py-3 text-sm outline-none focus:border-[#8B2635]"
        />

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="flex items-center gap-2 rounded-xl bg-[#3E000C] px-5 py-3 font-semibold text-white transition hover:bg-[#650018] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />
          <span className="hidden sm:inline">
            {sending ? "Sending..." : "Send"}
          </span>
        </button>
      </form>
    </div>
  </div>
</main>

);
}
