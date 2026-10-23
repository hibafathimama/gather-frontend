"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      role: "user",
    },
  });

  // Handle profile image selection
const handleImageChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  setImageError("");
  setSelectedImage(null);
  setPreviewImage("");

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

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
  // Check whether a profile image is selected
  if (!selectedImage) {
    setImageError("Profile image is required.");
    return;
  }

  try {
    setLoading(true);
    setServerError("");
    setImageError("");
    setSuccessMessage("");

    // Create FormData
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("role", data.role);
    formData.append("image", selectedImage);

    // Send registration request
    const response = await api.post(
      "/users/register",
      formData
    );

    setSuccessMessage(
      response.data.message || "Registration successful!"
    );

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



  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7FAF8] px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-3xl font-semibold text-[#1F2A24]">
          Create Account
        </h1>

        <p className="mb-8 text-center text-sm text-gray-500">
          Join Gather and discover amazing events
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Profile Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Profile Image
            </label>

            <div className="mb-3 flex justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500">
                  No image
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700"
            />
            {imageError && (
            <p className="mt-1 text-sm text-red-500">
              {imageError}
            </p>
          )}

            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, or WEBP. Maximum size: 2 MB.
            </p>
          </div>

          {/* First Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              First Name
            </label>

            <input
              type="text"
              placeholder="Enter your first name"
              {...register("firstName")}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Last Name
            </label>

            <input
              type="text"
              placeholder="Enter your last name"
              {...register("lastName")}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              {...register("password")}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword")}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Register As
            </label>

            <select
              {...register("role")}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#2F6B4F]"
            >
              <option value="user">Event Attendee</option>
              <option value="organizer">Event Organizer</option>
            </select>

            {errors.role && (
              <p className="mt-1 text-sm text-red-500">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {serverError}
            </p>
          )}

          {/* Success Message */}
          {successMessage && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {successMessage}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2F6B4F] p-3 font-medium text-white transition hover:bg-[#24553E] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#2F6B4F] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
