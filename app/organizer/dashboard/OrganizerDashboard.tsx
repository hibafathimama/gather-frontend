
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventType } from "@/types/event";
import OrganizerHeader from "@/components/OrganizerHeader";

interface NotificationType {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(
    null
  );
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No token found. Please log in.");
          return;
        }

        if (!backendUrl) {
          setError("Backend URL is not configured.");
          return;
        }

        const response = await fetch(`${backendUrl}/events/my-events`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch events");
        }

        setEvents(result.data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setNotificationError("Please log in to view notifications.");
          return;
        }

        if (!backendUrl) {
          setNotificationError("Backend URL is not configured.");
          return;
        }

        const response = await fetch(
          `${backendUrl}/notifications/organizer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch notifications"
          );
        }

        setNotifications(result.data || []);
        setUnreadCount(result.unreadCount || 0);
      } catch (err: unknown) {
        setNotificationError(
          err instanceof Error
            ? err.message
            : "Failed to fetch notifications"
        );
      } finally {
        setNotificationLoading(false);
      }
    };

    fetchMyEvents();
    fetchNotifications();
  }, [backendUrl]);

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingReadId(notificationId);
      setNotificationError(null);

      const token = localStorage.getItem("token");

      if (!token || !backendUrl) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${backendUrl}/notifications/organizer/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to mark notification as read"
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((previousCount) => Math.max(0, previousCount - 1));
    } catch (err: unknown) {
      setNotificationError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  // Delete an event
  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      if (!backendUrl) {
        alert("Backend URL is not configured.");
        return;
      }

      const response = await fetch(`${backendUrl}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete event.");
      }

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== eventId)
      );

      alert("Event deleted successfully!");
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the event."
      );
    }
  };

  const formatNotificationDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <>
      <OrganizerHeader />

      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Organizer Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your events and notifications in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/organizer/bookings"
                className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
              >
                Manage Bookings
              </Link>
              <Link
                href="/organizer/verify-ticket"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Verify Ticket
              </Link>
              <Link
                href="/organizer/events/create"
                className="rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
              >
                + Create Event
              </Link>
              
            </div>
          </div>

          {/* Notifications */}
          {/* <section className="mb-8 rounded-xl bg-white p-6 shadow">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Notifications
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Updates about your events from the admin.
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                Unread: {unreadCount}
              </span>
            </div>

            {notificationError && (
              <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
                {notificationError}
              </p>
            )}

            {notificationLoading ? (
              <p className="py-6 text-center text-gray-500">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">
                You don't have any notifications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <article
                    key={notification._id}
                    className={`rounded-lg border p-4 ${
                      notification.isRead
                        ? "border-gray-200 bg-white"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              notification.isRead
                                ? "bg-gray-200 text-gray-700"
                                : "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {notification.isRead ? "Read" : "Unread"}
                          </span>

                          <span className="text-xs text-gray-500">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-800">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(notification._id)
                          }
                          disabled={markingReadId !== null}
                          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {markingReadId === notification._id
                            ? "Saving..."
                            : "Mark as read"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section> */}

          {/* Total events */}
          <section className="mb-8 rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total Events</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : events.length}
            </p>
          </section>

          <h2 className="mb-5 text-2xl font-semibold text-gray-800">
            My Events
          </h2>

          {loading && (
            <p className="text-gray-600">Loading your events...</p>
          )}

          {error && (
            <p className="rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              <p className="mb-4 text-gray-600">
                You haven't created any events yet.
              </p>

              <Link
                href="/organizer/events/create"
                className="font-medium text-green-700 hover:underline"
              >
                Create your first event
              </Link>

            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event._id}
                className="overflow-hidden rounded-xl bg-white shadow"
              >
                {event.image && (
                  <img
                    src={
                      event.image.startsWith("http")
                        ? event.image
                        : `${(backendUrl || "").replace(/\/api\/?$/, "")}${event.image}`
                    }
                    alt={event.eventName}
                    className="h-48 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3 className="mb-2 text-xl font-semibold text-gray-800">
                    {event.eventName}
                  </h3>

                  <p className="mb-3 text-sm text-gray-500">
                    {event.category}
                  </p>

                  <p className="mb-2 text-gray-700">
                    <strong>Date:</strong>{" "}
                    {new Date(event.date).toLocaleDateString()}
                  </p>

                  <p className="mb-2 text-gray-700">
                    <strong>Time:</strong> {event.time}
                  </p>

                  <p className="mb-2 text-gray-700">
                    <strong>Venue:</strong> {event.venue}
                  </p>

                  <p className="mb-2 text-gray-700">
                    <strong>Location:</strong> {event.location}
                  </p>

                  <p className="mb-3 text-lg font-bold text-green-700">
                    ₹{event.ticketPrice}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm text-gray-600">
                      Available Seats:{" "}
                      <span className="font-semibold text-gray-900">
                        {event.availableSeats}
                      </span>
                    </p>

                    <p>
                      Total Seats:{" "}
                      <strong>
                        {event.totalSeats ?? event.availableSeats}
                      </strong>
                    </p>

                    <p>
                      Tickets Sold:{" "}
                      <strong>
                        {(event.totalSeats ?? event.availableSeats) -
                          event.availableSeats}
                      </strong>
                    </p>

                    {event.availableSeats > 0 ? (
                      <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Tickets Available
                      </span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Sold Out
                      </span>
                    )}
                  </div>
                  

                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4">
                    <Link
                      href={`/organizer/events/${event._id}`}
                      className="font-medium text-green-700 hover:underline"
                    >
                      View Event
                    </Link>

                    <Link
                      href={`/organizer/events/edit/${event._id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(event._id)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
