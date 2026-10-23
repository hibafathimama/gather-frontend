"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function UserNavbar() {
const pathname = usePathname();
const router = useRouter();

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

return ( <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur"> <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
{/* Logo */} <Link href="/user/dashboard" className="flex items-center gap-2"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl text-white">
✦ </div>

      <div>
        <h1 className="text-lg font-bold tracking-tight text-gray-900">
          Event<span className="text-orange-600">Ease</span>
        </h1>

        <p className="text-xs text-gray-500">
          Discover your next experience
        </p>
      </div>
    </Link>

    {/* Navigation Links */}
    <div className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-orange-50 text-orange-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
            }`}
          >
            <span>{link.icon}</span>
            {link.name}
          </Link>
        );
      })}
    </div>

    {/* Logout */}
    <button
      onClick={handleLogout}
      className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-600 hover:text-white"
    >
      Logout
    </button>
  </nav>

  {/* Mobile Navigation */}
  <div className="flex gap-2 overflow-x-auto border-t border-gray-100 px-4 py-3 md:hidden">
    {navLinks.map((link) => {
      const isActive = pathname === link.href;

      return (
        <Link
          key={link.href}
          href={link.href}
          className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
            isActive
              ? "bg-orange-50 text-orange-700"
              : "text-gray-600 hover:bg-gray-50"
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
