"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Ticket, Bell, UserRound, LogOut } from "lucide-react";
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

  const iconButtonClass = (href: string) =>
    `relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
      pathname === href
        ? "border-[#3E000C] bg-[#3E000C] text-[#FFECD1]"
        : "border-stone-200 bg-white text-stone-700 hover:border-[#3E000C] hover:bg-[#FFECD1]/40"
    }`;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

        .editorial-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Gather Brand Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <h1 className="editorial-heading text-xl font-bold tracking-tight text-[#3E000C]">
                Gather
              </h1>
              <p className="text-xs text-stone-500 font-semibold tracking-wider uppercase">Admin</p>
            </div>
          </Link>

          {/* Actions & Navigation */}
          <nav className="flex items-center gap-2">
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
                  className={iconButtonClass(link.href)}
                >
                  {isProfile ? (
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <>
                      <Bell className="h-5 w-5" aria-hidden="true" />

                      {unreadCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white shadow-sm">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {/* Logout Button */}
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
    </>
  );
}