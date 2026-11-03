import Link from "next/link";
import FeaturedEvents from "@/components/FeaturedEvents";
import {
  ArrowRight,
  CalendarDays,
  Music,
  Palette,
  Trophy,
  Users,
  MapPin,
  Ticket,
  PartyPopper,
} from "lucide-react";

const categories = [
  {
    name: "Music & Concerts",
    description: "Live music and unforgettable performances",
    icon: Music,
  },
  {
    name: "Arts & Culture",
    description: "Discover creativity and culture",
    icon: Palette,
  },
  {
    name: "Sports",
    description: "Experience the thrill of live sports",
    icon: Trophy,
  },
  {
    name: "Community",
    description: "Meet people and make connections",
    icon: Users,
  },
];

const featuredEvents = [
  {
    name: "Live Music Night",
    category: "Music & Concerts",
    date: "Discover upcoming dates",
    location: "Explore local venues",
    color: "from-rose-900 to-orange-700",
    symbol: "♪",
  },
  {
    name: "Creative Arts Festival",
    category: "Arts & Culture",
    date: "Discover upcoming dates",
    location: "Explore local venues",
    color: "from-purple-900 to-pink-700",
    symbol: "✦",
  },
  {
    name: "Sports Championship",
    category: "Sports",
    date: "Discover upcoming dates",
    location: "Explore local venues",
    color: "from-emerald-900 to-teal-600",
    symbol: "🏆",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFF9F2] text-[#3E000C]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-[#FFF9F2]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1]">
              <Ticket className="h-6 w-6" />
            </div>

            <span className="text-2xl font-extrabold tracking-tight">
              Gather<span className="text-orange-700">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">

          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#F5E7D5] sm:px-4"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A1020] sm:px-5"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F0CDA9] bg-white px-4 py-2 text-sm font-medium">
              <PartyPopper className="h-4 w-4 text-orange-700" />
              Find your next unforgettable experience
            </div>

            <h1 className="max-w-2xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Life is better
              <br />
              <span className="text-orange-800">when we</span>
              <br />
              gather.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
              From live concerts to creative festivals, discover events
              you love, book your tickets, and create memories that last.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3E000C] px-6 py-4 font-semibold text-white transition hover:bg-[#5A1020]"
              >
                Explore Events
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-[#D8B99B] bg-white px-6 py-4 font-semibold transition hover:bg-[#FFF0DE]"
              >
                Join Gather
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-stone-600">
              <span className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-orange-800" />
                Easy ticket booking
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-orange-800" />
                Events for everyone
              </span>
            </div>
          </div>

          {/* Decorative Hero Artwork */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-5 top-10 h-28 w-28 rounded-full bg-orange-200/60 blur-2xl" />
            <div className="absolute -right-5 bottom-5 h-36 w-36 rounded-full bg-rose-200/60 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] bg-[#3E000C] p-6 text-white shadow-2xl sm:p-10">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-white/10" />

              <div className="relative">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-[#FFECD1]">
                  Your next adventure starts here
                </span>

                <div className="my-10 flex items-center justify-center">
                  <div className="flex h-48 w-48 items-center justify-center rounded-full border border-[#FFECD1]/30 bg-gradient-to-br from-orange-300 via-rose-500 to-purple-900 shadow-xl sm:h-60 sm:w-60">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/30 bg-[#3E000C]/80 sm:h-44 sm:w-44">
                      <Ticket className="h-20 w-20 text-[#FFECD1] sm:h-24 sm:w-24" />
                    </div>
                  </div>
                </div>

                <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#FFD9B2]">
                  Discover · Experience · Remember
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  Make every moment count.
                </h2>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-2 rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-lg sm:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                  <CalendarDays className="h-6 w-6 text-orange-800" />
                </div>
                <div>
                  <p className="font-bold">Your next experience</p>
                  <p className="text-sm text-stone-500">
                    Just a few clicks away
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-[#F5D8B3] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-800">
                Find your vibe
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Explore by category
              </h2>
              <p className="mt-3 text-stone-600">
                Whatever you love, there is an experience waiting for you.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-semibold hover:text-orange-800"
            >
              All events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {categories.map((category) => {
    const Icon = category.icon;

    return (
      <Link
        key={category.name}
        href={`/events?category=${encodeURIComponent(category.name)}`}
        className="group rounded-2xl border border-[#F1DDC7] bg-[#FFF9F2] p-6 transition hover:-translate-y-1 hover:border-[#D9A77D] hover:shadow-lg"
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3E000C] text-[#FFECD1] transition group-hover:bg-orange-800">
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold">{category.name}</h3>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          {category.description}
        </p>

        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-800">
          Explore <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    );
  })}
</div>
        </div>
      </section>

{/* Featured Events - Actual events from MongoDB */}
<FeaturedEvents />

      {/* Call to Action */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#3E000C] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <PartyPopper className="h-7 w-7 text-[#FFECD1]" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl">
            Have an event to organize?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
            Bring people together. Create your event and help others
            discover an experience worth remembering.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFECD1] px-6 py-3.5 font-bold text-[#3E000C] transition hover:bg-white"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F5D8B3] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-extrabold">
            Gather<span className="text-orange-700">.</span>
          </Link>

          <p className="text-sm text-stone-500">
            Discover experiences. Create memories. Bring people together.
          </p>

          <div className="flex gap-5 text-sm font-medium">
            <Link href="/events" className="hover:text-orange-800">
              Events
            </Link>
            <Link href="/login" className="hover:text-orange-800">
              Login
            </Link>
            <Link href="/register" className="hover:text-orange-800">
              Register
            </Link>
          </div>
        </div>

        <div className="border-t border-[#F5D8B3] px-5 py-4 text-center text-xs text-stone-500">
            © 2026 Gather. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
