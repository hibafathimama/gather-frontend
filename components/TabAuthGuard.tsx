"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function TabAuthGuard({
children,
}: {
children: React.ReactNode;
}) {
const pathname = usePathname();
const router = useRouter();

const [allowed, setAllowed] = useState(false);

useEffect(() => {
// Pages that can be opened without logging in
const isPublicRoute =
pathname === "/" ||
pathname === "/login" ||
pathname === "/register" ||
pathname === "/events" ||
pathname.startsWith("/events/");

if (isPublicRoute) {
  setAllowed(true);
  return;
}

// Check whether the current browser tab is authenticated
const tabAuthenticated =
  sessionStorage.getItem("tabAuthenticated");

if (tabAuthenticated !== "true") {
  router.replace("/login");
  return;
}

setAllowed(true);

}, [pathname, router]);

if (!allowed) {
return ( <div className="flex min-h-screen items-center justify-center">
Redirecting to login... </div>
);
}

return <>{children}</>;
}
