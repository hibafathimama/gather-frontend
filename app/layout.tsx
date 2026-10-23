
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";
import "./globals.css";
import TabAuthGuard from "@/components/TabAuthGuard";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gather",
  description: "Discover and book events",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <Suspense fallback={<div>Loading...</div>}>
          <TabAuthGuard>{children}</TabAuthGuard>
          </Suspense>
        </ReduxProvider>
      </body>
      </body>
    </html>
  );
}

