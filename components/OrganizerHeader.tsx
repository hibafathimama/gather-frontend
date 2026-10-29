"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserRound, LogOut, Bell, Ticket } from "lucide-react";

export default function OrganizerHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/organizer`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const result = await response.json();

        if (result.status) {
          setUnreadCount(
            typeof result.unreadCount === "number" ? result.unreadCount : 0
          );
        }
      } catch (error) {
        console.error("Could not fetch notification count:", error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      await fetch("/api/auth/clear-cookie", {
        method: "POST",
      });
    } catch (error) {
      console.error("Could not clear authentication cookie:", error);
    }

    router.push("/login");
    router.refresh();
  };

  const iconButtonClass = (href: string) =>
    `relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
      pathname === href
        ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
        : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C] hover:bg-[#FFECD1]/40"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/organizer/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-[#3E000C]">
              Gather
            </h1>
            <p className="text-xs text-stone-500">Event platform</p>
          </div>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            href="/organizer/notifications"
            aria-label={`Notifications${
              unreadCount > 0 ? `, ${unreadCount} unread` : ""
            }`}
            title="Notifications"
            className={iconButtonClass("/organizer/notifications")}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />

            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link
            href="/organizer/profile"
            aria-label="My profile"
            title="My profile"
            className={iconButtonClass("/organizer/profile")}
          >
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}