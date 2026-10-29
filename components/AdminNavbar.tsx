"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

const navLinks = [
{ href: "/admin/profile", label: "Profile", icon: "profile" },
{ href: "/admin/notifications", label: "Notifications", icon: "bell" },
];

export default function AdminNavbar() {
const pathname = usePathname();
const router = useRouter();
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
const fetchUnreadCount = async () => {
try {
const response = await api.get(
"/notifications/admin/unread-count",
{ withCredentials: true }
);
setUnreadCount(response.data.count || 0);
} catch (error) {
console.error("Failed to fetch unread notifications:", error);
}
};


void fetchUnreadCount();
const interval = setInterval(() => void fetchUnreadCount(), 30000);

return () => clearInterval(interval);

}, []);

const handleLogout = async () => {
if (!window.confirm("Are you sure you want to log out?")) return;


try {
  await fetch("/api/auth/clear-cookie", {
    method: "POST",
    credentials: "include",
  });
} catch (error) {
  console.error("Logout request failed:", error);
} finally {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  router.replace("/login");
  router.refresh();
}


};

return ( <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm"> <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"> <Link
       href="/admin/dashboard"
       className="text-xl font-bold text-gray-900"
     >
Event<span className="text-blue-600">Hub</span> <span className="ml-2 text-xs font-medium text-gray-500">
ADMIN </span> </Link>

    <nav
      aria-label="Admin navigation"
      className="flex items-center gap-3"
    >
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        const isProfile = link.icon === "profile";

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-label={link.label}
            aria-current={isActive ? "page" : undefined}
            title={link.label}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition ${
              isActive
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isProfile ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5"
                />
              </svg>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                  />
                  <path
                    strokeLinecap="round"
                    d="M10 21h4"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        aria-label="Logout"
        title="Logout"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 17l5-5-5-5M15 12H3"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
          />
        </svg>
      </button>
    </nav>
  </div>
</header>

);
}
