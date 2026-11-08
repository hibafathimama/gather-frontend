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
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ImagePlus,
  Building2,
  Phone,
  MapPin,
  FileText,
  Globe,
  Briefcase,
} from "lucide-react";
import api from "@/lib/api";

// Validation schema
const registerSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .matches(/^[A-Za-z ]+$/, "Only letters are allowed")
    .required("First name is required"),

  lastName: yup
    .string()
    .trim()
    .matches(/^[A-Za-z ]+$/, "Only letters are allowed")
    .required("Last name is required"),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),

  // Strong password validation
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    )
    .matches(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /[0-9]/,
      "Password must contain at least one number"
    )
    .matches(
      /[!@#$%^&*(),.?":{}|<>_\-+=]/,
      "Password must contain at least one special character"
    ),

  // Confirm password validation
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),

  role: yup
    .string()
    .oneOf(["user", "organizer"], "Select a valid role")
    .required("Please select a role"),

  // Organizer fields
  organizationName: yup.string().when("role", {
    is: "organizer",
    then: (schema) =>
      schema.trim().required("Organization name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  contactNumber: yup.string().when("role", {
    is: "organizer",
    then: (schema) =>
      schema
        .trim()
        .matches(
          /^[+]?[0-9\s-]{7,15}$/,
          "Enter a valid contact number"
        )
        .required("Contact number is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  organizationType: yup.string().when("role", {
    is: "organizer",
    then: (schema) =>
      schema.trim().required("Organization type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  organizationAddress: yup.string().when("role", {
    is: "organizer",
    then: (schema) =>
      schema.trim().required("Organization address is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  organizationDescription: yup.string().when("role", {
    is: "organizer",
    then: (schema) =>
      schema.trim().required("Organization description is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  website: yup
    .string()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .url("Enter a valid website URL")
    .notRequired(),
});

type RegisterForm = yup.InferType<typeof registerSchema>;

const ROLES = [
  {
    value: "user",
    title: "Attendee",
    description: "Discover events and book tickets",
    Icon: Ticket,
  },
  {
    value: "organizer",
    title: "Organizer",
    description: "Create events, manage bookings",
    Icon: CalendarPlus,
  },
];

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
    shouldUnregister: true,
  });

  const selectedRole = watch("role");

  // Profile image validation
  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setImageError("");
    setSelectedImage(null);

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must not exceed 2 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Form submission
  const onSubmit = async (data: RegisterForm) => {
    if (!selectedImage) {
      setImageError("Please upload a profile image.");
      return;
    }

    try {
      setLoading(true);
      setServerError("");
      setImageError("");
      setSuccessMessage("");

      const formData = new FormData();

      formData.append("firstName", data.firstName.trim());
      formData.append("lastName", data.lastName.trim());
      formData.append("email", data.email.trim());
      formData.append("password", data.password);
      formData.append("role", data.role);
      formData.append("image", selectedImage);

      // Send organizer details only when Organizer is selected
      if (data.role === "organizer") {
        formData.append(
          "organizationName",
          data.organizationName!.trim()
        );

        formData.append(
          "contactNumber",
          data.contactNumber!.trim()
        );

        formData.append(
          "organizationType",
          data.organizationType!.trim()
        );

        formData.append(
          "organizationAddress",
          data.organizationAddress!.trim()
        );

        formData.append(
          "organizationDescription",
          data.organizationDescription!.trim()
        );

        formData.append(
          "website",
          data.website?.trim() || ""
        );
      }

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
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? String(
              (
                error as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message ||
                "Registration failed. Please try again."
            )
          : "Unable to connect to the server. Please try again.";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // Common styles
  const inputClass = (hasError: boolean, extra = "") =>
    `w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-[#8C3544] focus:shadow-[0_0_0_3px_rgba(140,53,68,0.1)] ${
      hasError ? "border-red-500" : "border-stone-200"
    } ${extra}`;

  const labelClass =
    "mb-1.5 block text-[13px] font-semibold text-stone-800";

  const errorClass = "mt-1 text-xs text-red-600";

  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400";

  const eyeClass =
    "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-[#3E000C] focus:outline-none focus:ring-2 focus:ring-[#3E000C]/20";

  return (
    <main className="min-h-screen bg-[#FFF9F2] selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <div className="grid min-h-screen lg:grid-cols-[2fr_3fr]">

        {/* LEFT: Branding panel */}
        <section className="relative hidden overflow-hidden bg-[#3E000C] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#8C3544]/30 blur-3xl"
          />

          <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]">
              <Ticket className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-[#FFF9F2]">
                Gather
              </p>
              <p className="text-xs text-[#FFECD1]/60">
                Your next experience
              </p>
            </div>
          </Link>

          <div className="relative z-10 max-w-sm">
            <h1 className="font-serif text-4xl font-medium leading-tight text-[#FFF9F2] xl:text-5xl">
              Great moments begin with gathering.
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#FFF9F2]/70">
              Discover events, meet new people, or host your own.
            </p>
          </div>

          <p className="relative z-10 text-xs text-[#FFF9F2]/40">
            Discover. Connect. Experience.
          </p>
        </section>

        {/* RIGHT: Registration form */}
        <section className="flex items-center justify-center px-5 py-6 sm:px-8">
          <div className="w-full max-w-lg">

            {/* Mobile logo */}
            <Link
              href="/"
              className="mb-4 flex w-fit items-center gap-2.5 lg:hidden"
              aria-label="Gather home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
                <Ticket className="h-4 w-4" />
              </div>

              <p className="text-lg font-bold text-[#3E000C]">
                Gather
              </p>
            </Link>

            <div className="mb-4">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-[#3E000C]">
                Create your account
              </h2>

              <p className="mt-1.5 text-sm text-stone-600">
                Book tickets or host your own events.
              </p>
            </div>

            <div className="rounded-2xl border border-[#3E000C]/10 bg-white p-5 shadow-[0_20px_60px_-35px_rgba(62,0,12,0.25)]">

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3.5"
                noValidate
              >

                {/* Profile image */}
                <div>
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#3E000C]/20 bg-[#FFF9F2] p-2.5">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="h-12 w-12 shrink-0 rounded-xl border border-[#3E000C]/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFECD1] text-[#3E000C]/70">
                        <User className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#3E000C]">
                        {previewImage ? "Looking good!" : "Profile photo"}
                      </p>

                      <p className="text-xs text-stone-500">
                        JPG, PNG or WEBP, max 2 MB
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3E000C]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#3E000C] transition hover:border-[#3E000C] hover:bg-[#3E000C] hover:text-white focus-within:ring-2 focus-within:ring-[#3E000C]/30">
                      <ImagePlus className="h-3.5 w-3.5" />

                      {previewImage ? "Change" : "Upload"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {imageError && (
                    <p role="alert" className={errorClass}>
                      {imageError}
                    </p>
                  )}
                </div>

                {/* First and last name */}
                <div className="grid gap-3 sm:grid-cols-2">
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
                      <p className={errorClass}>
                        {errors.firstName.message}
                      </p>
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
                      <p className={errorClass}>
                        {errors.lastName.message}
                      </p>
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
                    <p className={errorClass}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password and confirm password */}
                <div className="grid gap-3 sm:grid-cols-2">

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
                        placeholder="Enter a strong password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                        className={inputClass(
                          !!errors.password,
                          "pr-10"
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((c) => !c)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className={eyeClass}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password requirements */}
                    <p className="mt-1 text-[11px] leading-5 text-stone-500">
                      8+ characters, uppercase, lowercase, number
                      and special character.
                    </p>

                    {errors.password && (
                      <p className={errorClass}>
                        {errors.password.message}
                      </p>
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
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        {...register("confirmPassword")}
                        className={inputClass(
                          !!errors.confirmPassword,
                          "pr-10"
                        )}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((c) => !c)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className={eyeClass}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className={errorClass}>
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Role selection */}
                <fieldset>
                  <legend className={labelClass}>
                    How will you use Gather?
                  </legend>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {ROLES.map(({ value, title, description, Icon }) => {
                      const isSelected = selectedRole === value;

                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition duration-200 focus-within:ring-2 focus-within:ring-[#3E000C]/20 ${
                            isSelected
                              ? "border-[#3E000C] bg-[#FFF3E5]"
                              : "border-stone-200 bg-white hover:border-[#A35D42]/60 hover:bg-[#FFF9F2]"
                          }`}
                        >
                          <input
                            type="radio"
                            value={value}
                            {...register("role")}
                            className="sr-only"
                          />

                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isSelected
                                ? "bg-[#3E000C] text-[#FFECD1]"
                                : "bg-[#FFECD1] text-[#3E000C]"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-[#3E000C]">
                              {title}
                            </span>

                            <span className="block truncate text-xs text-stone-600">
                              {description}
                            </span>
                          </span>

                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                              isSelected
                                ? "border-[#3E000C] bg-[#3E000C]"
                                : "border-stone-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {errors.role && (
                    <p className={errorClass}>
                      {errors.role.message}
                    </p>
                  )}
                </fieldset>

                {/* Organizer details */}
                {selectedRole === "organizer" && (
                  <div className="space-y-3.5 rounded-xl border border-[#3E000C]/15 bg-[#FFF9F2] p-3.5">

                    <div>
                      <h3 className="text-sm font-bold text-[#3E000C]">
                        Organization Details
                      </h3>

                      <p className="mt-1 text-xs text-stone-600">
                        Please provide your organization information.
                      </p>
                    </div>

                    {/* Organization name */}
                    <div>
                      <label
                        htmlFor="organizationName"
                        className={labelClass}
                      >
                        Organization name
                      </label>

                      <div className="relative">
                        <Building2 className={iconClass} />

                        <input
                          id="organizationName"
                          type="text"
                          placeholder="Enter organization name"
                          {...register("organizationName")}
                          aria-invalid={!!errors.organizationName}
                          className={inputClass(
                            !!errors.organizationName
                          )}
                        />
                      </div>

                      {errors.organizationName && (
                        <p className={errorClass}>
                          {errors.organizationName.message}
                        </p>
                      )}
                    </div>

                    {/* Contact number */}
                    <div>
                      <label
                        htmlFor="contactNumber"
                        className={labelClass}
                      >
                        Contact number
                      </label>

                      <div className="relative">
                        <Phone className={iconClass} />

                        <input
                          id="contactNumber"
                          type="tel"
                          placeholder="Enter contact number"
                          {...register("contactNumber")}
                          aria-invalid={!!errors.contactNumber}
                          className={inputClass(
                            !!errors.contactNumber
                          )}
                        />
                      </div>

                      {errors.contactNumber && (
                        <p className={errorClass}>
                          {errors.contactNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Organization type */}
                    <div>
                      <label
                        htmlFor="organizationType"
                        className={labelClass}
                      >
                        Organization type
                      </label>

                      <div className="relative">
                        <Briefcase className={iconClass} />

                        <select
                          id="organizationType"
                          {...register("organizationType")}
                          aria-invalid={!!errors.organizationType}
                          className={inputClass(
                            !!errors.organizationType,
                            "appearance-none"
                          )}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select organization type
                          </option>

                          <option value="Event Management">
                            Event Management
                          </option>

                          <option value="Educational Institution">
                            Educational Institution
                          </option>

                          <option value="Sports Organization">
                            Sports Organization
                          </option>

                          <option value="Entertainment">
                            Entertainment
                          </option>

                          <option value="Non-Profit Organization">
                            Non-Profit Organization
                          </option>

                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </div>

                      {errors.organizationType && (
                        <p className={errorClass}>
                          {errors.organizationType.message}
                        </p>
                      )}
                    </div>

                    {/* Organization address */}
                    <div>
                      <label
                        htmlFor="organizationAddress"
                        className={labelClass}
                      >
                        Organization address
                      </label>

                      <div className="relative">
                        <MapPin className={iconClass} />

                        <input
                          id="organizationAddress"
                          type="text"
                          placeholder="Enter organization address"
                          {...register("organizationAddress")}
                          aria-invalid={!!errors.organizationAddress}
                          className={inputClass(
                            !!errors.organizationAddress
                          )}
                        />
                      </div>

                      {errors.organizationAddress && (
                        <p className={errorClass}>
                          {errors.organizationAddress.message}
                        </p>
                      )}
                    </div>

                    {/* Organization description */}
                    <div>
                      <label
                        htmlFor="organizationDescription"
                        className={labelClass}
                      >
                        Organization description
                      </label>

                      <div className="relative">
                        <FileText className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-stone-400" />

                        <textarea
                          id="organizationDescription"
                          rows={3}
                          placeholder="Tell us about your organization"
                          {...register("organizationDescription")}
                          aria-invalid={!!errors.organizationDescription}
                          className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-stone-900 outline-none transition-all duration-200 placeholder:text-stone-400 hover:border-stone-300 focus:border-[#8C3544] focus:shadow-[0_0_0_3px_rgba(140,53,68,0.1)] ${
                            errors.organizationDescription
                              ? "border-red-500"
                              : "border-stone-200"
                          }`}
                        />
                      </div>

                      {errors.organizationDescription && (
                        <p className={errorClass}>
                          {errors.organizationDescription.message}
                        </p>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label htmlFor="website" className={labelClass}>
                        Website (Optional)
                      </label>

                      <div className="relative">
                        <Globe className={iconClass} />

                        <input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          {...register("website")}
                          aria-invalid={!!errors.website}
                          className={inputClass(!!errors.website)}
                        />
                      </div>

                      {errors.website && (
                        <p className={errorClass}>
                          {errors.website.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Server error */}
                {serverError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Success message */}
                {successMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-800"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[#3E000C] px-5 py-3 font-semibold text-white shadow-lg shadow-[#3E000C]/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5B1422] hover:shadow-xl active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/15 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100"
                    aria-hidden="true"
                  />

                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 border-t border-stone-100 pt-4 text-center text-sm text-stone-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#8C3544] transition hover:text-[#3E000C] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-3 text-center">
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