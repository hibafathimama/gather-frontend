"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import api from "@/lib/api";

const registerSchema = yup.object({
  firstName: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only letters are allowed")
    .required("First name is required"),

  lastName: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only letters are allowed")
    .required("Last name is required"),

  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),

  role: yup
    .string()
    .oneOf(["user", "organizer"], "Select a valid role")
    .required("Please select a role"),
});

type RegisterForm = yup.InferType<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "user",
    },
  });

  const selectedRole = watch("role");

  // Handle profile image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setImageError("");
    setSelectedImage(null);
    setPreviewImage("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    // Check image type
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    // Check image size
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must not exceed 2 MB.");
      event.target.value = "";
      return;
    }

    // Image is valid
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!selectedImage) {
      setImageError("Profile image is required.");
      return;
    }

    try {
      setLoading(true);
      setServerError("");
      setImageError("");
      setSuccessMessage("");

      const formData = new FormData();

      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", data.role);
      formData.append("image", selectedImage);

      const response = await api.post("/users/register", formData);

      setSuccessMessage(response.data.message || "Registration successful!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setServerError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean, extra = "") =>
    `w-full rounded-lg border bg-white py-3 pl-11 pr-4 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#3E000C] focus:ring-2 focus:ring-[#3E000C]/15 ${
      hasError ? "border-red-500" : "border-stone-300"
    } ${extra}`;
  const labelClass = "mb-1.5 block text-sm font-medium text-stone-700";
  const errorClass = "mt-1.5 text-sm text-red-600";
  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFECD1] px-4 py-10 selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="w-full max-w-lg">
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
              Create your account
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Join Gather to book tickets or host your own events.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Profile image */}
            <div>
              <span className={labelClass}>Profile image</span>

              <div className="flex items-center gap-4">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full border border-[#F5D8B3] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-[#3E000C]/40 bg-[#FFECD1]/50 text-[#3E000C]/60">
                    <User className="h-8 w-8" />
                  </div>
                )}

                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#3E000C]/25 px-3.5 py-2 text-sm font-medium text-[#3E000C] transition focus-within:ring-2 focus-within:ring-[#3E000C]/30 hover:bg-[#3E000C] hover:text-white">
                    <Camera className="h-4 w-4" />
                    {previewImage ? "Change image" : "Choose image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-1.5 text-xs text-stone-500">
                    JPG, PNG or WEBP. Maximum size: 2 MB.
                  </p>
                </div>
              </div>

              {imageError && <p className={errorClass}>{imageError}</p>}
            </div>

            {/* Name */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={labelClass}>
                  First name
                </label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First name"
                    autoComplete="given-name"
                    aria-invalid={!!errors.firstName}
                    {...register("firstName")}
                    className={inputClass(!!errors.firstName)}
                  />
                </div>
                {errors.firstName && (
                  <p className={errorClass}>{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className={labelClass}>
                  Last name
                </label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Last name"
                    autoComplete="family-name"
                    aria-invalid={!!errors.lastName}
                    {...register("lastName")}
                    className={inputClass(!!errors.lastName)}
                  />
                </div>
                {errors.lastName && (
                  <p className={errorClass}>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email address
              </label>
              <div className="relative">
                <Mail className={iconClass} />
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
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                  className={inputClass(!!errors.password, "pr-11")}
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
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm password
              </label>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                  className={inputClass(!!errors.confirmPassword, "pr-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-500 transition hover:text-[#3E000C]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={errorClass}>{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role */}
            <fieldset>
              <legend className={labelClass}>Register as</legend>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    value: "user",
                    title: "Event attendee",
                    description: "Find events and book tickets.",
                    Icon: Ticket,
                  },
                  {
                    value: "organizer",
                    title: "Event organizer",
                    description: "Create events and sell tickets.",
                    Icon: CalendarPlus,
                  },
                ].map(({ value, title, description, Icon }) => {
                  const isSelected = selectedRole === value;

                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition focus-within:ring-2 focus-within:ring-[#3E000C]/30 ${
                        isSelected
                          ? "border-[#3E000C] bg-[#FFECD1]/50"
                          : "border-stone-300 bg-white hover:border-[#3E000C]/60"
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register("role")}
                        className="sr-only"
                      />
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                          isSelected
                            ? "bg-[#3E000C] text-[#FFECD1]"
                            : "bg-[#FFECD1] text-[#3E000C]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#3E000C]">
                          {title}
                        </span>
                        <span className="block text-xs text-stone-600">
                          {description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {errors.role && <p className={errorClass}>{errors.role.message}</p>}
            </fieldset>

            {/* Server error */}
            {serverError && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {serverError}
              </p>
            )}

            {/* Success message */}
            {successMessage && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                {successMessage}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3E000C] px-4 py-3 font-semibold text-white transition hover:bg-[#2B0008] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#3E000C] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}