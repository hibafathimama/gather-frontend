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
    const publicRoutes = ["/login", "/registration"];

    if (publicRoutes.includes(pathname)) {
      setAllowed(true);
      return;
    }

    const tabAuthenticated =
      sessionStorage.getItem("tabAuthenticated");

    if (tabAuthenticated !== "true") {
      router.replace("/login");
      return;
    }

    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}