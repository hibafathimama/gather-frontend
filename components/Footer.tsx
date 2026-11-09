import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#3E000C] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold tracking-wide">
              Gather<span className="text-[#E6B566]">.</span>
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-7 text-white/70">
              Discover amazing events, book your tickets, and create
              unforgettable memories with Gather.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-base font-semibold">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="/" className="transition hover:text-[#E6B566]">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/events" className="transition hover:text-[#E6B566]">
                  Explore Events
                </Link>
              </li>

              <li>
                <Link href="/login" className="transition hover:text-[#E6B566]">
                  Login
                </Link>
              </li>

              <li>
                <Link href="/register" className="transition hover:text-[#E6B566]">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-base font-semibold">
              Contact Us
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              <li>
                Email: support@gather.com
              </li>

              <li>
                Location: Kerala, India
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
<div className="mt-10 border-t border-white/20 pt-6">
  <div className="flex justify-center text-sm text-white/60">
    <p className="text-center">
      © 2026 Gather. All rights reserved.
    </p>
  </div>
</div>

      </div>
    </footer>
  );
}