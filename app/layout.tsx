import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";
import TabAuthGuard from "@/components/TabAuthGuard";
import { Suspense } from "react";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Toaster } from "react-hot-toast";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <ReduxProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <TabAuthGuard>
              <main className="flex-1">
                {children}
              </main>
            </TabAuthGuard>
          </Suspense>
        </ReduxProvider>

        <Suspense fallback={null}>
          <ConditionalFooter />
        </Suspense>

        {/* React Hot Toast */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#3E000C",
              color: "#FFF9F2",
              borderRadius: "10px",
              padding: "12px 16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#22C55E",
                secondary: "#FFF9F2",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#FFF9F2",
              },
            },
          }}
        />
      </body>
    </html>
  );
}