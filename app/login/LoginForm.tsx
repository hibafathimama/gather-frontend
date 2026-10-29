"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { loginUser } from "@/redux/slices/authSlice";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

type LoginForm = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [loginError, setLoginError] = useState("");

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

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4">
      {/* Kept original max-w-md container size & p-8 padding */}
      <div className="w-full max-w-md rounded-2xl border border-[#F5D8B3] bg-white p-8 shadow-md">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block mb-2">
            <span className="text-2xl font-bold tracking-tight text-[#3E000C]">
              Gather<span className="text-[#3E000C]">.</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#3E000C]">
            Sign In
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Sign in to your Event Booking account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-semibold text-[#3E000C]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email")}
              className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 text-stone-900 outline-none transition-all focus:bg-white focus:border-[#3E000C] focus:ring-4 focus:ring-[#3E000C]/15 ${
                errors.email ? "border-red-500" : "border-stone-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-semibold text-[#3E000C]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              className={`w-full rounded-xl border bg-stone-50/50 px-4 py-3 text-stone-900 outline-none transition-all focus:bg-white focus:border-[#3E000C] focus:ring-4 focus:ring-[#3E000C]/15 ${
                errors.password ? "border-red-500" : "border-stone-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {loginError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
            >
              {loginError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3E000C] px-4 py-3 font-semibold text-white transition-all hover:bg-[#2B0008] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-stone-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#3E000C] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}