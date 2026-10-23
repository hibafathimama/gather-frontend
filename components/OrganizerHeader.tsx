"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserRound, LogOut } from "lucide-react";

export default function OrganizerHeader() {
const router = useRouter();

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

return ( <header className="bg-white shadow-md"> <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
{/* Logo */} <Link
       href="/organizer/dashboard"
       className="text-2xl font-bold text-gray-800"
     >
Gather </Link>


    {/* Navigation */}
    <nav className="flex flex-wrap items-center gap-5">


      {/* My Profile Icon */}
      <Link
        href="/organizer/profile"
        aria-label="My Profile"
        title="My Profile"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600"
      >
        <UserRound size={22} />
      </Link>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
      >
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  </div>
</header>

);
}
