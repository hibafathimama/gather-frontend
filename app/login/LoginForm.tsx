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
.email("Enter a valid email")
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

  // Step 2: Get token and user details from the response
  const token = result.accessToken;
  const user = result.data;

  // Step 3: Check whether the response contains required details
  if (!token || !user || !user.role) {
    throw new Error(
      "Login response is missing the token or user details."
    );
  }

  const role = user.role;

  // Step 4: Store token and user details
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  // Step 5: Set HTTP-only authentication cookies
  const cookieResponse = await fetch("/api/auth/set-cookie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      role,
    }),
  });

  const cookieResult = await cookieResponse.json();

  if (!cookieResponse.ok) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw new Error(
      cookieResult.message || "Failed to set authentication cookies."
    );
  }

      // Mark this tab as authenticated
    sessionStorage.setItem("tabAuthenticated", "true");

  // Step 6: Redirect according to the user's role
  if (role === "organizer") {
    router.replace("/organizer/dashboard");
  } else if (role === "admin") {
    router.replace("/admin/dashboard");
  } else if (role === "user") {
    router.replace("/user/dashboard");
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    throw new Error("Invalid user role.");
  }
}

catch (err: unknown) {
  console.error("Login failed:", err);

  if (typeof err === "string") {
    setLoginError(err);
  } else if (err instanceof Error) {
    setLoginError(err.message);
  } else {
    setLoginError("Login failed. Please try again.");
  }
}


}

return ( <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4"> <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg"> <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
Login </h1>

    <p className="mb-6 text-center text-gray-600">
      Sign in to your Event Booking account
    </p>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block font-medium text-gray-700"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          {...register("email")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-blue-500"
        />

        {errors.email && (
          <p className="mt-1 text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block font-medium text-gray-700"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register("password")}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-blue-500"
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Login Error */}
      {loginError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {loginError}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    {/* Registration Link */}
    <p className="mt-6 text-center text-gray-600">
      Don't have an account?{" "}
      <Link
        href="/register"
        className="font-semibold text-blue-600 hover:underline"
      >
        Register here
      </Link>
    </p>
  </div>
</main>

);
}
