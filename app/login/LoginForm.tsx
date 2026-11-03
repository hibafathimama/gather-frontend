"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Ticket,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Music2,
  Mic2,
  Palette,
  UtensilsCrossed,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/redux/store";
import { loginUser } from "@/redux/slices/authSlice";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

type LoginForm = yup.InferType<typeof loginSchema>;

/* Events that cycle on the hero ticket. Replace with real data/API later. */
const SHOWCASE = [
  {
    kind: "Live music",
    title: "Monsoon Sessions",
    date: "Sat 14 Nov",
    time: "7:30 PM",
    place: "Open Air Stage",
    icon: Music2,
  },
  {
    kind: "Comedy",
    title: "Open Mic Riot",
    date: "Fri 20 Nov",
    time: "8:00 PM",
    place: "The Loft",
    icon: Mic2,
  },
  {
    kind: "Workshop",
    title: "Clay & Coffee",
    date: "Sun 22 Nov",
    time: "10:00 AM",
    place: "Studio 9",
    icon: Palette,
  },
  {
    kind: "Food fest",
    title: "Night Market",
    date: "Sat 28 Nov",
    time: "6:00 PM",
    place: "Harbour Square",
    icon: UtensilsCrossed,
  },
];

/* Fixed widths so the barcode is stable between renders (no hydration mismatch). */
const BARS = [3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 3, 2];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const panelRef = useRef<HTMLElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
  });

  const emailValue = watch("email");
  const emailValid = !!emailValue && yup.string().email().isValidSync(emailValue);

  /* Auto-rotate the ticket; pause while the pointer is over it. */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % SHOWCASE.length),
      4000
    );
    return () => clearInterval(id);
  }, [paused]);

  /* Spotlight follows the cursor across the left panel; ticket tilts toward it. */
  const handlePanelMove = (e: React.MouseEvent<HTMLElement>) => {
    const panel = panelRef.current;
    const ticket = ticketRef.current;
    if (!panel) return;

    const p = panel.getBoundingClientRect();
    panel.style.setProperty("--sx", `${e.clientX - p.left}px`);
    panel.style.setProperty("--sy", `${e.clientY - p.top}px`);

    if (ticket) {
      const t = ticket.getBoundingClientRect();
      const nx = (e.clientX - (t.left + t.width / 2)) / (p.width / 2);
      const ny = (e.clientY - (t.top + t.height / 2)) / (p.height / 2);
      const clamp = (n: number) => Math.max(-1, Math.min(1, n));
      ticket.style.setProperty("--ry", `${clamp(nx) * 9}deg`);
      ticket.style.setProperty("--rx", `${clamp(ny) * -9}deg`);
      ticket.style.setProperty(
        "--gx",
        `${((e.clientX - t.left) / t.width) * 100}%`
      );
      ticket.style.setProperty(
        "--gy",
        `${((e.clientY - t.top) / t.height) * 100}%`
      );
    }
  };

  const handlePanelLeave = () => {
    const ticket = ticketRef.current;
    if (!ticket) return;
    ticket.style.setProperty("--rx", "0deg");
    ticket.style.setProperty("--ry", "0deg");
  };

  const onInvalid = () => setShakeKey((k) => k + 1);

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError("");

      const result = await dispatch(loginUser(data)).unwrap();

      const token = result.accessToken;
      const user = result.data;

      if (!token || !user || !user.role) {
        throw new Error(
          "Login response is missing the token or user details. Check the backend response."
        );
      }

      const role = user.role;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const cookieResponse = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token, role }),
      });

      const cookieResult = await cookieResponse.json();

      if (!cookieResponse.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error(
          cookieResult.message || "Failed to set authentication cookies."
        );
      }

      sessionStorage.setItem("tabAuthenticated", "true");

      const destinations: Record<string, string> = {
        organizer: "/organizer/dashboard",
        admin: "/admin/dashboard",
        user: "/user/dashboard",
      };
      const destination = destinations[role];

      if (!destination) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("tabAuthenticated");
        throw new Error("Invalid user role.");
      }

      /* Let the "ticket scanned" confirmation play before navigating. */
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.replace(destination);
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setSuccess(false);
      setShakeKey((k) => k + 1);

      if (typeof err === "string") {
        setLoginError(err);
      } else if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  const inputClass = (hasError: boolean) =>
    `peer w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-[#8C3544] focus:shadow-[0_0_0_3px_rgba(140,53,68,0.1)] ${
      hasError ? "border-red-500" : "border-stone-200"
    }`;

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 transition-colors duration-200 peer-focus:text-[#8C3544]";

  const current = SHOWCASE[active];
  const CurrentIcon = current.icon;
  const busy = loading || success;

  return (
    <main className="min-h-screen bg-[#FFF9F2] selection:bg-[#3E000C] selection:text-[#FFECD1] lg:h-screen lg:overflow-hidden">
      <style>{`
        @keyframes g-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
        @keyframes g-swap {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes g-float {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -8px; }
        }
        @keyframes g-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes g-scan {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes g-pop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .g-shake { animation: g-shake 0.45s ease-in-out; }
        .g-swap { animation: g-swap 0.45s ease-out both; }
        .g-float { animation: g-float 6s ease-in-out infinite; }
        .g-progress { transform-origin: left; animation: g-progress 4s linear both; }
        .g-scan { animation: g-scan 0.9s ease-in-out both; }
        .g-pop { animation: g-pop 0.35s ease-out both; }
        .g-tilt {
          transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
          transition: transform 0.25s ease-out;
          transform-style: preserve-3d;
        }
        @media (prefers-reduced-motion: reduce) {
          .g-shake, .g-swap, .g-float, .g-progress, .g-scan, .g-pop { animation: none; }
          .g-tilt { transform: none; transition: none; }
        }
      `}</style>

      <div className="grid min-h-screen lg:h-full lg:grid-cols-2">
        {/* Left: interactive ticket */}
        <section
          ref={panelRef}
          onMouseMove={handlePanelMove}
          onMouseLeave={handlePanelLeave}
          className="relative hidden overflow-hidden bg-[#3E000C] lg:flex lg:h-full lg:flex-col lg:justify-between lg:p-10"
          style={
            {
              "--sx": "50%",
              "--sy": "40%",
            } as React.CSSProperties
          }
        >
          {/* Cursor spotlight */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(420px circle at var(--sx) var(--sy), rgba(233,181,141,0.16), transparent 65%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-[#8C3544]/30 blur-3xl"
            aria-hidden="true"
          />

          <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-[#FFF9F2]">
                Gather
              </p>
              <p className="text-xs text-[#FFECD1]/60">Your next experience</p>
            </div>
          </Link>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="mb-7 max-w-sm text-center font-serif text-3xl font-medium leading-tight text-[#FFF9F2] xl:text-4xl">
              Your next unforgettable experience starts here.
            </h1>

            {/* The ticket */}
            <div
              className="g-float"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                ref={ticketRef}
                className="g-tilt relative flex w-[22rem] max-w-full overflow-hidden rounded-2xl bg-[#FFF9F2] text-[#3E000C] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)]"
              >
                {/* Glare that tracks the pointer */}
                <div
                  className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
                  style={{
                    background:
                      "radial-gradient(240px circle at var(--gx, 30%) var(--gy, 20%), rgba(255,255,255,0.9), transparent 60%)",
                  }}
                  aria-hidden="true"
                />

                {/* Scan line when login succeeds */}
                {success && (
                  <div
                    className="g-scan absolute inset-x-0 z-30 h-0.5 bg-[#8C3544] shadow-[0_0_18px_4px_rgba(140,53,68,0.6)]"
                    aria-hidden="true"
                  />
                )}

                {/* Main body */}
                <div className="relative flex-1 p-5">
                  <div key={active} className="g-swap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#E9B58D]">
                        <CurrentIcon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-[#A35D42]">
                        {current.kind}
                      </p>
                    </div>

                    <h2 className="mt-4 font-serif text-2xl font-semibold leading-tight">
                      {current.title}
                    </h2>

                    <dl className="mt-3 space-y-1.5 text-sm text-[#3E000C]/70">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#A35D42]" />
                        <dt className="sr-only">When</dt>
                        <dd>
                          {current.date}, {current.time}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#A35D42]" />
                        <dt className="sr-only">Where</dt>
                        <dd>{current.place}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Selector dots with progress on the active one */}
                  <div className="mt-4 flex items-center gap-2">
                    {SHOWCASE.map((item, i) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setActive(i)}
                        aria-label={`Show ${item.title}`}
                        aria-current={i === active}
                        className={`relative h-1.5 overflow-hidden rounded-full bg-[#3E000C]/15 transition-all duration-300 ${
                          i === active ? "w-10" : "w-4 hover:bg-[#3E000C]/30"
                        }`}
                      >
                        {i === active && (
                          <span
                            key={`${active}-${paused}`}
                            className={`absolute inset-0 bg-[#8C3544] ${
                              paused ? "" : "g-progress"
                            }`}
                            style={paused ? { transform: "scaleX(1)" } : undefined}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perforation */}
                <div className="relative w-0 border-l-2 border-dashed border-[#3E000C]/20">
                  <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#3E000C]" />
                  <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-[#3E000C]" />
                </div>

                {/* Stub */}
                <div className="flex w-20 flex-col items-center justify-between bg-[#FFECD1] px-3 py-5">
                  {success ? (
                    <div className="g-pop flex h-10 w-10 items-center justify-center rounded-full bg-[#3E000C] text-[#FFECD1]">
                      <Check className="h-5 w-5" />
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-[#A35D42] [writing-mode:vertical-rl]">
                      Admit one
                    </p>
                  )}
                  <div className="flex h-12 items-end gap-[2px]" aria-hidden="true">
                    {BARS.map((w, i) => (
                      <span
                        key={i}
                        className="h-full bg-[#3E000C]"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-[#FFF9F2]/40">
            Discover. Connect. Experience.
          </p>
        </section>

        {/* Right: login form */}
        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:h-full lg:px-12 lg:py-6">
          <div className="w-full max-w-sm">
            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-6 flex w-fit items-center gap-2.5 lg:hidden"
              aria-label="Gather home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
                <Ticket className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-[#3E000C]">Gather</p>
            </Link>

            <div className="mb-5">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#3E000C]">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-stone-600">
                Sign in to find events and manage your bookings.
              </p>
            </div>

            <div
              key={shakeKey}
              className={`rounded-2xl border border-[#3E000C]/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(62,0,12,0.25)] ${
                shakeKey > 0 ? "g-shake" : ""
              }`}
            >
              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[13px] font-semibold text-stone-800"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                      className={inputClass(!!errors.email)}
                    />
                    <Mail className={iconClass} />

                    {emailValid && !errors.email && (
                      <span
                        className="g-pop absolute right-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white"
                        aria-hidden="true"
                      >
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  {errors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[13px] font-semibold text-stone-800"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      {...register("password")}
                      onKeyUp={(e) =>
                        setCapsLock(e.getModifierState("CapsLock"))
                      }
                      onKeyDown={(e) =>
                        setCapsLock(e.getModifierState("CapsLock"))
                      }
                      className={inputClass(!!errors.password)}
                    />
                    <Lock className={iconClass} />

                    <button
                      type="button"
                      onClick={() => setShowPassword((c) => !c)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-[#3E000C] focus:outline-none focus:ring-2 focus:ring-[#3E000C]/20"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {capsLock && (
                    <p
                      role="status"
                      className="g-swap mt-1.5 flex items-center gap-1.5 text-xs text-amber-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      Caps Lock is on
                    </p>
                  )}

                  {errors.password && (
                    <p id="password-error" className="mt-1 text-xs text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Login error */}
                {loginError && (
                  <div
                    role="alert"
                    className="g-swap flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={busy}
                  className={`group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-5 py-3 font-semibold text-white shadow-lg shadow-[#3E000C]/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                    success
                      ? "bg-emerald-600"
                      : "bg-[#3E000C] hover:bg-[#5B1422] disabled:opacity-70"
                  }`}
                >
                  {/* Sheen sweep on hover */}
                  <span
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/15 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  {success ? (
                    <>
                      <Check className="g-pop h-4 w-4" />
                      Ticket scanned
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 border-t border-stone-100 pt-4 text-center text-sm text-stone-600">
                New to Gather?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#8C3544] transition hover:text-[#3E000C] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-stone-500 transition hover:text-[#3E000C]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}