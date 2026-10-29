"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Compass,
  Tag,
  Minus,
  Plus,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  CalendarX2,
  Hash,
  Users,
  Wallet,
  CreditCard,
  BadgeCheck,
  QrCode,
} from "lucide-react";

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
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
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
  const [bookingDetails, setBookingDetails] =
    useState<BookingResponse | null>(null);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

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

        const response = await fetch(`${backendUrl}/events/getevent`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch events.");
        }

        const events = Array.isArray(result.data) ? result.data : [];

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

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

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
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      // Ask the backend to create a Razorpay order.
      const orderResponse = await fetch(`${backendUrl}/payments/create-order`, {
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
      });

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
            const verifyResponse = await fetch(`${backendUrl}/payments/verify`, {
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
            });

            const verifyResult: RazorpayVerifyResult =
              await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(
                verifyResult.message || "Payment verification failed."
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
        error instanceof Error ? error.message : "Something went wrong."
      );

      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15";
  const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] text-[#3E000C]">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFECD1] p-6">
        <div className="w-full max-w-md rounded-xl border border-[#F5D8B3] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
            <CalendarX2 className="h-6 w-6" />
          </span>
          <p className="mb-5 text-sm text-stone-700">
            {message || "Event not found."}
          </p>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3E000C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
          >
            <Compass className="h-4 w-4" />
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  // Message style: success, in-progress or error
  const messageTone = message.includes("verified")
    ? "success"
    : message.includes("Verifying")
      ? "info"
      : "error";

  const messageStyles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-[#F5D8B3] bg-[#FFECD1]/50 text-[#3E000C]",
    error: "border-red-200 bg-red-50 text-red-700",
  }[messageTone];

  const MessageIcon =
    messageTone === "success"
      ? CheckCircle2
      : messageTone === "info"
        ? Info
        : AlertCircle;

  return (
    <div className="min-h-screen bg-[#FFECD1] px-4 py-6 text-stone-900 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between border-b border-[#F5D8B3] pb-5">
          <Link href="/user/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold tracking-tight text-[#3E000C]">
                Gather
              </p>
              <p className="text-xs text-stone-600">Event platform</p>
            </div>
          </Link>

          <Link
            href="/events"
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 bg-white px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">All events</span>
          </Link>
        </header>

        <div className="overflow-hidden rounded-xl border border-[#F5D8B3] bg-white shadow-sm">
          {/* Event summary */}
          <div className="bg-[#3E000C] px-6 py-6 text-[#FFECD1] sm:px-8">
            <p className="text-sm text-[#FFECD1]/75">Book tickets</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {event.eventName}
            </h1>
            <p className="mt-2 text-sm text-[#FFECD1]/75">
              Price per ticket:{" "}
              <span className="font-semibold text-white">
                ₹{event.ticketPrice}
              </span>
            </p>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            {/* Booking form (hidden once the booking is confirmed) */}
            {!bookingDetails && (
              <>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="ticketType" className={labelClass}>
                      Ticket type
                    </label>
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                      <select
                        id="ticketType"
                        value={ticketType}
                        onChange={(e) => setTicketType(e.target.value)}
                        disabled={submitting}
                        className={inputClass}
                      >
                        <option value="General">General</option>
                        <option value="VIP">VIP</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="quantity" className={labelClass}>
                      Number of tickets
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        disabled={submitting || quantity <= 1}
                        aria-label="Decrease tickets"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-stone-300 bg-white text-[#3E000C] transition hover:border-[#3E000C] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <input
                        id="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        disabled={submitting}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="h-11 w-full rounded-lg border border-stone-300 bg-white px-4 text-center text-sm font-semibold text-stone-900 outline-none transition focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15"
                      />

                      <button
                        type="button"
                        onClick={() => setQuantity((current) => current + 1)}
                        disabled={submitting}
                        aria-label="Increase tickets"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-stone-300 bg-white text-[#3E000C] transition hover:border-[#3E000C] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-lg bg-[#FFECD1]/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#3E000C]">
                      Total price
                    </p>
                    <p className="text-xs text-stone-600">
                      {quantity} × ₹{event.ticketPrice}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-[#3E000C]">
                    ₹{event.ticketPrice * quantity}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {submitting ? "Processing payment..." : "Pay with Razorpay"}
                </button>

                <p className="text-center text-xs text-stone-500">
                  Payments are processed securely by Razorpay.
                </p>
              </>
            )}

            {/* Status message */}
            {message && (
              <p
                role="status"
                className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${messageStyles}`}
              >
                <MessageIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </p>
            )}

            {/* Booking confirmed */}
            {bookingDetails && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-emerald-900">
                  <CheckCircle2 className="h-6 w-6" />
                  Booking confirmed
                </h2>

                <ul className="mt-4 space-y-3 text-sm text-emerald-950">
                  <li className="flex items-start gap-3 break-all">
                    <Hash className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Booking ID:</span>{" "}
                      {bookingDetails.bookingId}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Event:</span>{" "}
                      {event.eventName}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Tickets:</span>{" "}
                      {bookingDetails.quantity}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Total price:</span> ₹
                      {bookingDetails.totalPrice}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Payment status:</span>{" "}
                      <span className="capitalize">
                        {bookingDetails.paymentStatus}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>
                      <span className="font-medium">Booking status:</span>{" "}
                      <span className="capitalize">{bookingDetails.status}</span>
                    </span>
                  </li>
                </ul>

                {bookingDetails.qrCode && (
                  <div className="mt-6 text-center">
                    <h3 className="mb-3 flex items-center justify-center gap-2 font-semibold text-emerald-900">
                      <QrCode className="h-4 w-4" />
                      Your ticket QR code
                    </h3>

                    <img
                      src={bookingDetails.qrCode}
                      alt="Ticket QR code"
                      className="mx-auto h-48 w-48 rounded-lg border border-emerald-200 bg-white p-2"
                    />

                    <p className="mt-3 text-sm text-emerald-800">
                      Keep this QR code ready for ticket verification.
                    </p>
                  </div>
                )}

                <Link
                  href="/user/bookings"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2B0008]"
                >
                  <Ticket className="h-4 w-4" />
                  View my bookings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}