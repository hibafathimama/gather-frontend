"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  Send,
  MessageCircle,
  ArrowLeft,
  User,
} from "lucide-react";
import Link from "next/link";

interface UserType {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface MessageType {
  _id: string;
  sender: string | UserType;
  receiver: string | UserType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface EventType {
  _id: string;
  eventName?: string;
  organizer: string | UserType;
}

export default function UserMessagesPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [organizer, setOrganizer] = useState<UserType | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Get logged-in user
// Get logged-in user
useEffect(() => {
  const storedUser = localStorage.getItem("user");

  console.log("Stored user:", storedUser);

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);

      const loggedInUserId = user._id;

      console.log("Logged-in user ID:", loggedInUserId);

      if (loggedInUserId) {
        setUserId(loggedInUserId);
      } else {
        setError("User ID not found. Please log in again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("User details error:", error);
      setError("Unable to read user details.");
      setLoading(false);
    }
  } else {
    setError("User details not found. Please log in again.");
    setLoading(false);
  }
}, []);

  // Get organizer details
  const fetchOrganizer = async () => {
    try {
      // Correct URL according to your event routes
      const response = await api.get(
        `/events/${eventId}`,
        { timeout: 10000 }
      );

      const event: EventType =
        response.data.data;

      if (event?.organizer) {
        if (typeof event.organizer !== "string") {
          setOrganizer(event.organizer);
        }
      }
    } catch (error) {
      console.error("Fetch organizer error:", error);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setError("");

      const response = await api.get(
        `/messages/${eventId}`,
        { timeout: 10000 }
      );

      const fetchedMessages: MessageType[] =
        response.data.data || [];

      // Oldest message first
      const sortedMessages = [...fetchedMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      setMessages(sortedMessages);

    } catch (error) {
      console.error("Fetch messages error:", error);
      setError("Unable to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    if (!userId) return;

    try {
      await api.patch(
        `/messages/${eventId}/conversation/${userId}/read`,
        {},
        { timeout: 10000 }
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  // Load conversation
// Load conversation
useEffect(() => {
  if (!eventId) {
    setLoading(false);
    setError("Event ID is missing.");
    return;
  }

  if (!userId) {
    return;
  }

  let isMounted = true;

  const loadConversation = async () => {
    console.log("Loading conversation...");
    console.log("Event ID:", eventId);
    console.log("User ID:", userId);

    setLoading(true);

    await Promise.all([
      fetchOrganizer(),
      fetchMessages(),
    ]);

    if (isMounted) {
      await markAsRead();
    }
  };

  loadConversation();

  return () => {
    isMounted = false;
  };
}, [eventId, userId]);

  // Get organizer name
  const getOrganizerName = () => {
    if (!organizer) {
      return "Event Organizer";
    }

    const fullName = `${organizer.firstName || ""} ${
      organizer.lastName || ""
    }`.trim();

    return fullName || organizer.name || "Event Organizer";
  };

  // Automatically scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    try {
      setSending(true);
      setError("");

      const response = await api.post(
        "/messages/send",
        {
          eventId,
          message: message.trim(),
        },
        { timeout: 10000 }
      );

      const newMessage: MessageType =
        response.data.data;

      setMessages((previous) =>
        [...previous, newMessage].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        )
      );

      setMessage("");

    } catch (error) {
      console.error("Send message error:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 py-8 text-[#3E000C] sm:px-8">

      <div className="mx-auto max-w-4xl">

        {/* Back Button */}
        <Link
          href="/user/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#7A3540] hover:text-[#3E000C]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#EADBD0] bg-white shadow-sm">

          {/* Organizer Header */}
          <div className="flex items-center gap-4 bg-[#3E000C] px-5 py-4 text-white">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <User size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold">
                {getOrganizerName()}
              </h1>

              <p className="text-sm text-white/75">
                Event Organizer
              </p>
            </div>

            <MessageCircle
              size={24}
              className="ml-auto"
            />

          </div>

          {/* Chat Section */}
          <div className="min-h-[420px] max-h-[600px] space-y-4 overflow-y-auto bg-[#FFF9F2] p-5">

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
                  Send a message to {getOrganizerName()}.
                </p>

              </div>

            ) : (

              messages.map((item) => {

                const senderId =
                  typeof item.sender === "string"
                    ? item.sender
                    : item.sender?._id;

                const isMyMessage =
                  senderId === userId;

                return (
                  <div
                    key={item._id}
                    className={`flex w-full ${
                      isMyMessage
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        isMyMessage
                          ? "rounded-br-sm bg-[#3E000C] text-white"
                          : "rounded-bl-sm border border-[#EADBD0] bg-white text-[#3E000C]"
                      }`}
                    >

                      <p
                        className={`mb-1 text-xs font-semibold ${
                          isMyMessage
                            ? "text-white/70"
                            : "text-[#8B2635]"
                        }`}
                      >
                        {isMyMessage
                          ? "You"
                          : getOrganizerName()}
                      </p>

                      <p className="break-words text-sm">
                        {item.message}
                      </p>

                      <p
                        className={`mt-2 text-right text-[10px] ${
                          isMyMessage
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                );
              })

            )}

            <div ref={bottomRef} />

          </div>

          {/* Error */}
          {error && (
            <p className="mx-5 mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Message Input */}
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