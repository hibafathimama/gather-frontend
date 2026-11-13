"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";

interface UserType {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

interface MessageType {
  _id: string;
  sender: string | UserType;
  receiver: string | UserType;
  message: string;
  createdAt: string;
  isRead?: boolean;
}

export default function OrganizerAdminChatPage() {
  const params = useParams();
  const adminId = params.adminId as string;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!adminId) return;

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/messages/admin-organizer/${adminId}`
      );

      setMessages(response.data.data || []);

      // Mark admin messages as read
      await api.patch(
        `/messages/admin-organizer/${adminId}/read`
      );
    } catch (err) {
      console.error("Fetch admin messages error:", err);
      setError("Failed to load admin messages.");
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const getSenderId = (sender: string | UserType) =>
    typeof sender === "string" ? sender : sender?._id;

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        "/messages/admin-organizer/send",
        {
          receiverId: adminId,
          message: message.trim(),
        }
      );

      setMessages((previous) => [
        ...previous,
        response.data.data,
      ]);

      setMessage("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Backend error:", err.response?.data);
      }

      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="min-h-screen bg-[#FFF9F2] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/organizer/messages"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3E000C] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Messages
        </Link>

        <section className="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 bg-[#3E000C] p-5 text-white">
            <MessageCircle className="h-6 w-6" />

            <div>
              <h1 className="font-semibold">Chat with Admin</h1>
              <p className="text-sm text-white/70">
                Direct admin conversation
              </p>
            </div>
          </div>

          <div className="flex min-h-[400px] flex-col gap-4 p-5">
            {loading ? (
              <p className="m-auto text-stone-500">
                Loading messages...
              </p>
            ) : error && messages.length === 0 ? (
              <p className="m-auto text-red-600">{error}</p>
            ) : messages.length === 0 ? (
              <p className="m-auto text-stone-500">
                No messages found.
              </p>
            ) : (
              messages.map((item) => {
                const isOrganizerMessage =
                  getSenderId(item.sender) !== adminId;

                return (
                  <div
                    key={item._id}
                    className={`flex ${
                      isOrganizerMessage
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isOrganizerMessage
                          ? "bg-[#3E000C] text-white"
                          : "bg-stone-100 text-stone-800"
                      }`}
                    >
                      <p className="break-words text-sm">
                        {item.message}
                      </p>

                      <p
                        className={`mt-2 text-xs ${
                          isOrganizerMessage
                            ? "text-white/60"
                            : "text-stone-500"
                        }`}
                      >
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {error && messages.length > 0 && (
            <p className="mx-5 mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 border-t border-stone-100 p-4"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-stone-200 px-4 py-3 text-sm outline-none focus:border-[#3E000C]"
            />

            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}