"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Ticket,
  User,
  Bell,
  LogOut,
} from "lucide-react";

interface NotificationType {
  _id: string;
  isRead: boolean;
}

export default function UserNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks = [
    {
      name: "Dashboard",
      href: "/user/dashboard",
      Icon: LayoutDashboard,
    },
    {
      name: "Explore events",
      href: "/events",
      Icon: Compass,
    },
    {
      name: "My bookings",
      href: "/user/bookings",
      Icon: Ticket,
    },
    {
      name: "My profile",
      href: "/user/profile",
      Icon: User,
    },
  ];

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUnreadCount(0);
          return;
        }

        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

        const response = await fetch(`${backendUrl}/notifications`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const result = await response.json();
        const notifications: NotificationType[] = result.data || [];

        setUnreadCount(
          notifications.filter((notification) => !notification.isRead).length
        );
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadNotifications();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/clear-cookie", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to clear authentication cookie:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/user/dashboard" className="flex items-center gap-3">
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

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ name, href, Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#3E000C] text-[#FFECD1]"
                    : "text-stone-600 hover:bg-[#FFECD1]/60 hover:text-[#3E000C]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            );
          })}
        </div>

        {/* Notifications and logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/notifications"
            aria-label={`Notifications${
              unreadCount > 0 ? `, ${unreadCount} unread` : ""
            }`}
            title="Notifications"
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
              pathname === "/notifications"
                ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
                : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C] hover:bg-[#FFECD1]/40"
            }`}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />

            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="flex h-10 items-center gap-2 rounded-lg border border-[#3E000C]/25 px-3.5 text-sm font-medium text-[#3E000C] transition-colors hover:bg-[#3E000C] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="flex gap-2 overflow-x-auto border-t border-stone-100 bg-[#FFECD1]/30 px-4 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navLinks.map(({ name, href, Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#3E000C] text-[#FFECD1]"
                  : "border border-stone-200 bg-white text-stone-700 hover:border-[#3E000C]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}