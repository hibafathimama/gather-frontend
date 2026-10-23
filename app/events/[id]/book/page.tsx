"use client";

import { useEffect, useState } from "react";

interface EventData {
_id: string;
eventName: string;
ticketPrice: number;
}

export default function BookEvent({
params,
}: {
params: Promise<{ id: string }>;
}) {
const [eventId, setEventId] = useState("");
const [event, setEvent] = useState<EventData | null>(null);
const [ticketType, setTicketType] = useState("General");
const [quantity, setQuantity] = useState(1);
const [message, setMessage] = useState("");

const backendUrl =
process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

// Get event ID from URL
useEffect(() => {
params.then((value) => setEventId(value.id));
}, [params]);

// Fetch event details
useEffect(() => {
if (!eventId) return;

const fetchEvent = async () => {
  try {
const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Please log in first");
    return;
  }

  const response = await fetch(`${backendUrl}/events/getevent`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch events");
    }

    const events = Array.isArray(result.data) ? result.data : [];

    const selectedEvent = events.find(
      (item: EventData) => item._id === eventId
    );

if (selectedEvent) {
  setEvent(selectedEvent);
} else {
  console.log("API response:", result);
  setMessage("Event not found in the API response");
}

} catch (error) {
  console.error("Event fetch error:", error);

  setMessage(
    error instanceof Error
      ? error.message
      : "Failed to load event details"
  );
}
};

fetchEvent();


}, [eventId, backendUrl]);

const handleBooking = async () => {
try {
const token = localStorage.getItem("token");


  if (!token) {
    setMessage("Please log in first");
    return;
  }

  const response = await fetch(`${backendUrl}/bookings/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      event: eventId,
      ticketType,
      quantity,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    setMessage(result.message || "Booking failed");
    return;
  }

  setMessage("Booking successful!");
} catch {
  setMessage("Something went wrong");
}


};

if (!event) {
return <p className="p-6">{message || "Loading event..."}</p>;
}

return ( <div className="mx-auto mt-10 max-w-md rounded-lg border p-6"> <h1 className="mb-4 text-2xl font-bold">Book Event</h1>

  <h2 className="mb-2 text-lg">{event.eventName}</h2>

  <p className="mb-4">Price per ticket: ₹{event.ticketPrice}</p>

  <label>Ticket Type</label>

  <select
    className="mb-4 w-full rounded border p-2"
    value={ticketType}
    onChange={(e) => setTicketType(e.target.value)}
  >
    <option value="General">General</option>
    <option value="VIP">VIP</option>
    <option value="Premium">Premium</option>
  </select>

  <label>Number of Tickets</label>

  <input
    type="number"
    min="1"
    value={quantity}
    onChange={(e) =>
      setQuantity(Math.max(1, Number(e.target.value) || 1))
    }
    className="mb-4 w-full rounded border p-2"
  />

  <p className="mb-4 text-lg font-semibold">
    Total Price: ₹{event.ticketPrice * quantity}
  </p>

  <button
    onClick={handleBooking}
    className="w-full rounded bg-green-700 p-3 text-white"
  >
    Confirm Booking
  </button>

  {message && <p className="mt-4">{message}</p>}
</div>

);
}
