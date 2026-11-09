"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  const hideFooterPages = ["/login", "/register"];

  if (hideFooterPages.includes(pathname)) {
    return null;
  }

  return <Footer />;
}