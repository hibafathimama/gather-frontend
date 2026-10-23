"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
{ name: "Users", href: "/admin/users", icon: "👥" },
{ name: "Events", href: "/admin/events", icon: "🎉" },
{ name: "Bookings", href: "/admin/bookings", icon: "🎟️" },
{ name: "Profile", href: "/admin/profile", icon: "👤" },
];


export default function AdminNavbar() {
const pathname = usePathname();
const router = useRouter();

const handleLogout = async () => {
const confirmed = window.confirm("Are you sure you want to log out?");


if (!confirmed) return;

try {
  // Clear the authentication cookie through your Next.js API.
  await fetch("/api/auth/clear-cookie", {
    method: "POST",
    credentials: "include",
  });
} catch (error) {
  console.error("Logout request failed:", error);
} finally {
  // Clear client-side authentication data if present.
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");

  router.replace("/login");
  router.refresh();
}

};

return ( <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
     <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"> 
        <Link
       href="/admin/dashboard"
       className="text-xl font-bold text-gray-900"
     >
Event
<span className="text-blue-600">Hub</span>
 <span className="ml-2 text-xs font-medium text-gray-500">
ADMIN </span>
 </Link>

    <nav
      aria-label="Admin navigation"
      className="flex flex-wrap items-center gap-2"
    >
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="mr-1" aria-hidden="true">
              {link.icon}
            </span>
            {link.name}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
      >
        Logout
      </button>
    </nav>
  </div>
</header>

);
}
