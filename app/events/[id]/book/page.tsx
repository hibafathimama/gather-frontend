"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventData {
  _id: string;
  eventName: string;
  ticketPrice: number;
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface BookingResponse {
  bookingId: string;
  ticketToken: string;
  quantity: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  qrCode: string;
}

interface RazorpayVerifyResult {
  success: boolean;
  message: string;
  data?: BookingResponse;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] =useState<BookingResponse | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000/api";

  useEffect(() => {
    params.then((value) => setEventId(value.id));
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
          setMessage("Please log in first.");
          return;
        }

        const response = await fetch(
          `${backendUrl}/events/getevent`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch events."
          );
        }

        const events = Array.isArray(result.data)
          ? result.data
          : [];

        const selectedEvent = events.find(
          (item: EventData) => item._id === eventId
        );

        if (selectedEvent) {
          setEvent(selectedEvent);
        } else {
          setMessage("Event not found.");
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load event details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, backendUrl]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      ) as HTMLScriptElement | null;

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          resolve(Boolean(window.Razorpay));
        });

        existingScript.addEventListener("error", () => {
          resolve(false);
        });

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!event) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in first.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setMessage("Please enter a valid number of tickets.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      // Load Razorpay Checkout.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Please try again."
        );
      }

      // Ask the backend to create a Razorpay order.
      const orderResponse = await fetch(
        `${backendUrl}/payments/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            eventId,
            quantity,
            ticketType,
          }),
        }
      );

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(
          orderResult.message || "Could not create payment order."
        );
      }

      const order: RazorpayOrder = orderResult.data;

      // Open the Razorpay payment window.
      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Gather",
        description: `Tickets for ${event.eventName}`,
        order_id: order.orderId,

        handler: async (paymentResponse) => {
          try {
            setSubmitting(true);
            setMessage("Payment received. Verifying payment...");

            /*
             * IMPORTANT:
             * We will create this verification endpoint
             * in the next step.
             *
             * Do not create or confirm a booking until the
             * backend verifies the Razorpay signature.
             */
            const verifyResponse = await fetch(
              `${backendUrl}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  eventId,
                  quantity,
                  ticketType,
                }),
              }
            );

          const verifyResult: RazorpayVerifyResult =
            await verifyResponse.json();

          if (!verifyResponse.ok || !verifyResult.success) {
            throw new Error(
              verifyResult.message ||
                "Payment verification failed."
            );
          }

          if (!verifyResult.data?.bookingId) {
            throw new Error(
              "Booking details were not returned. Please check My Bookings."
            );
          }

          setBookingDetails(verifyResult.data);
          setMessage("Payment verified and booking confirmed!");

          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Unable to verify payment."
            );
          } finally {
            setSubmitting(false);
          }
        },

        theme: {
          color: "#3E000C",
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setMessage("Payment window closed. No booking confirmed.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] font-semibold text-[#3E000C]">
        Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFECD1] p-6 text-center">
        <div className="w-full max-w-md rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-medium text-stone-600">
            {message || "Event not found."}
          </p>

          <Link
            href="/events"
            className="inline-flex rounded-xl bg-[#3E000C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2B0008]"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-10 text-stone-900">
      <div className="mx-auto max-w-xl">
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-6">
          <Link
            href="/user/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-lg font-bold text-[#FFECD1]">
              ✦
            </div>

            <div>
              <h1 className="text-xl font-black text-[#3E000C]">
                Gather.
              </h1>
              <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
                Checkout
              </p>
            </div>
          </Link>

          <Link
            href="/events"
            className="rounded-xl border border-[#3E000C]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#3E000C] hover:bg-[#3E000C] hover:text-white"
          >
            All Events
          </Link>
        </header>

        <div className="space-y-6 rounded-3xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          <div>
            <span className="mb-2 inline-block rounded-lg bg-[#3E000C]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3E000C]">
              Ticket Reservation
            </span>

            <h2 className="text-2xl font-black text-[#3E000C]">
              {event.eventName}
            </h2>

            <p className="mt-1 text-sm font-semibold text-stone-600">
              Price per ticket:{" "}
              <span className="text-[#3E000C]">
                ₹{event.ticketPrice}
              </span>
            </p>
          </div>

          <div className="space-y-4 border-t border-stone-100 pt-4">
            <div>
              <label
                htmlFor="ticketType"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
              >
                Ticket Type
              </label>

              <select
                id="ticketType"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm outline-none focus:border-[#3E000C] focus:bg-white"
              >
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#3E000C]"
              >
                Number of Tickets
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Number(e.target.value) || 1)
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-3 text-sm outline-none focus:border-[#3E000C] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Price
            </span>

            <span className="text-xl font-black text-[#3E000C]">
              ₹{event.ticketPrice * quantity}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBooking}
            disabled={submitting}
            className="w-full rounded-xl bg-[#3E000C] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Processing Payment..."
              : "Pay with Razorpay"}
          </button>

          {message && (
            <p
              role="status"
              className={`rounded-xl p-4 text-sm font-semibold ${
                message.includes("verified")
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}
          {bookingDetails && (

  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
    <h3 className="mb-4 text-xl font-black text-green-900">
      Booking Confirmed!
    </h3>

<div className="space-y-3 text-sm text-green-900">
  <p>
    <strong>Booking ID:</strong>{" "}
    {bookingDetails.bookingId}
  </p>

  <p>
    <strong>Event:</strong> {event.eventName}
  </p>

  <p>
    <strong>Number of Tickets:</strong>{" "}
    {bookingDetails.quantity}
  </p>

  <p>
    <strong>Total Price:</strong> ₹
    {bookingDetails.totalPrice}
  </p>

  <p>
    <strong>Payment Status:</strong>{" "}
    {bookingDetails.paymentStatus}
  </p>

  <p>
    <strong>Booking Status:</strong>{" "}
    {bookingDetails.status}
  </p>
</div>

{bookingDetails.qrCode && (
  <div className="mt-6 text-center">
    <h4 className="mb-3 font-bold text-green-900">
      Your Ticket QR Code
    </h4>

    <img
      src={bookingDetails.qrCode}
      alt="Ticket QR code"
      className="mx-auto h-48 w-48 rounded-lg border border-green-200 bg-white p-2"
    />

    <p className="mt-3 text-xs text-green-800">
      Keep this QR code ready for ticket verification.
    </p>
  </div>
)}

<Link
  href="/user/bookings"
  className="mt-6 inline-block rounded-xl bg-[#3E000C] px-5 py-3 text-sm font-bold text-white hover:bg-[#2B0008]"
>
  View My Bookings
</Link>

  </div>
)}

        </div>
      </div>
    </div>
  );
}
