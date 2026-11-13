"use client";

import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  Loader2,
  UserRound,
} from "lucide-react";

import api from "@/lib/api";

interface UserType {
  _id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface MessageType {
  _id: string;
  sender: UserType;
  receiver: UserType;
  message: string;
  createdAt: string;
}

export default function AdminOrganizerChatPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [organizer, setOrganizer] = useState<UserType | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation messages
  const fetchMessages = useCallback(async () => {
    if (!userId) return;

    try {
      setError("");

      const response = await api.get(
        `/messages/admin-organizer/${userId}`,
        {
          withCredentials: true,
        }
      );

      const messageData: MessageType[] = response.data.data || [];

      setMessages(messageData);

      if (messageData.length > 0) {
        const firstMessage = messageData[0];

        const otherUser =
          firstMessage.sender.role === "organizer"
            ? firstMessage.sender
            : firstMessage.receiver;

        setOrganizer(otherUser);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark organizer messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await api.patch(
        `/messages/admin-organizer/${userId}/read`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  }, [userId]);

  // Initial load and periodic refresh
  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const loadChat = async () => {
      await fetchMessages();

      if (!isMounted) return;

      await markMessagesAsRead();
    };

    loadChat();

    // Refresh conversation every 15 seconds
    const interval = setInterval(async () => {
      if (!isMounted) return;

      await fetchMessages();

      if (!isMounted) return;

      await markMessagesAsRead();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId, fetchMessages, markMessagesAsRead]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message
  const handleSendMessage = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const messageText = newMessage.trim();

    if (!messageText || !userId) return;

    try {
      setSending(true);
      setError("");

      await api.post(
        "/messages/admin-organizer/send",
        {
          receiverId: userId,
          message: messageText,
        },
        {
          withCredentials: true,
        }
      );

      setNewMessage("");

      await fetchMessages();
      await markMessagesAsRead();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F2] p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Back Button */}
        <Link
          href="/admin/messages"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#3E000C] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Messages
        </Link>

        {/* Chat Header */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#EADFD3] bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3E000C]/10 text-[#3E000C]">
            <UserRound size={24} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#3E000C]">
              {organizer
                ? `${organizer.firstName || ""} ${
                    organizer.lastName || ""
                  }`.trim()
                : "Organizer"}
            </h1>

            <p className="text-sm text-gray-500">
              Organizer Conversation
            </p>
          </div>
        </div>

        {/* Chat Box */}
        <div className="overflow-hidden rounded-xl border border-[#EADFD3] bg-white shadow-sm">

          {/* Messages */}
          <div className="min-h-[400px] max-h-[550px] space-y-4 overflow-y-auto p-4 sm:p-6">

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2
                  className="animate-spin text-[#3E000C]"
                  size={30}
                />
              </div>
            ) : error && messages.length === 0 ? (
              <p className="py-12 text-center text-sm text-red-600">
                {error}
              </p>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle
                  size={40}
                  className="mb-3 text-gray-300"
                />

                <h3 className="font-semibold text-gray-700">
                  Start a conversation
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Send your first message to this organizer.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender?.role === "admin";

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? "rounded-br-sm bg-[#3E000C] text-white"
                          : "rounded-bl-sm bg-[#FFF0E0] text-[#3E000C]"
                      }`}
                    >
                      <p className="break-words text-sm">
                        {msg.message}
                      </p>

                      <p
                        className={`mt-2 text-right text-[10px] ${
                          isAdmin
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && messages.length > 0 && (
            <p className="px-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 border-t border-[#EADFD3] p-4"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              maxLength={2000}
              className="flex-1 rounded-lg border border-[#EADFD3] px-4 py-3 text-sm outline-none focus:border-[#3E000C]"
            />

            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#3E000C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5A0012] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}

              <span className="hidden sm:inline">
                Send
              </span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}