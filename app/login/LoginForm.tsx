"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector((state: RootState) => state.auth);

  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError("");

      // Step 1: Login through Redux
      const result = await dispatch(loginUser(data)).unwrap();

      // Step 2: Read the token and user from the response
      const token = result.accessToken;
      const user = result.data;

      if (!token || !user || !user.role) {
        throw new Error(
          "Login response is missing the token or user details. Check the backend response."
        );
      }

      const role = user.role;

      // Step 3: Store token and user details
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Step 4: Set HTTP-only authentication cookies
      const cookieResponse = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Step 5: Mark this tab as authenticated
      sessionStorage.setItem("tabAuthenticated", "true");

      // Step 6: Redirect according to role
      if (role === "organizer") {
        router.replace("/organizer/dashboard");
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "user") {
        router.replace("/user/dashboard");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("tabAuthenticated");

        throw new Error("Invalid user role.");
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);

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
    `w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15 ${
      hasError ? "border-red-500" : "border-stone-300"
    }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4 py-10 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-3"
          aria-label="Gather home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-xl font-bold tracking-tight text-[#3E000C]">
              Gather
            </p>
            <p className="text-xs text-stone-600">Event platform</p>
          </div>
        </Link>

        <div className="rounded-xl border border-[#F5D8B3] bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#3E000C]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Sign in to book tickets or manage your events.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                  className={inputClass(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-stone-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                  className={`${inputClass(!!errors.password)} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-500 transition hover:text-[#3E000C]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error message */}
            {loginError && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {loginError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-4 py-3 font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-stone-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#3E000C] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}