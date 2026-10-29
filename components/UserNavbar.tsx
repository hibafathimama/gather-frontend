"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
      icon: "⌂",
    },
    {
      name: "Explore Events",
      href: "/events",
      icon: "✦",
    },
    {
      name: "My Bookings",
      href: "/user/bookings",
      icon: "▤",
    },
    {
      name: "My Profile",
      href: "/user/profile",
      icon: "♙",
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
    <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Gather */}
        <Link href="/user/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-lg font-bold text-[#FFECD1] shadow-sm transition-transform group-hover:scale-105">
            ✦
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#3E000C]">
              Gather<span className="text-[#3E000C]/70">.</span>
            </h1>
            <p className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
              Event Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#3E000C] text-[#FFECD1] shadow-sm"
                    : "text-stone-600 hover:bg-[#FFECD1]/50 hover:text-[#3E000C]"
                }`}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Notification Bell and Logout */}
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            title="Notifications"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              pathname === "/notifications"
                ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
                : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C] hover:bg-[#FFECD1]/30"
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              🔔
            </span>

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-[#3E000C]/20 px-4 py-2 text-sm font-bold text-[#3E000C] transition-all hover:bg-[#3E000C] hover:text-white shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Scrollbar */}
      <div className="flex gap-2 overflow-x-auto border-t border-stone-100 bg-[#FFECD1]/30 px-4 py-2.5 md:hidden scrollbar-none">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#3E000C] text-[#FFECD1] shadow-sm"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-[#3E000C]"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}