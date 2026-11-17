import Link from "next/link";
import FeaturedEvents from "@/components/FeaturedEvents";
import Reveal from "@/components/Reveal";
import {
  ArrowRight,
  CalendarDays,
  Music,
  Palette,
  Trophy,
  Users,
  Ticket,
  PartyPopper,
  Search,
  Heart,
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

const steps = [
  {
    title: "Discover",
    description: "Browse events by category, date and price to find what you love.",
    icon: Search,
  },
  {
    title: "Book",
    description: "Pick your event and book your tickets in just a few clicks.",
    icon: Ticket,
  },
  {
    title: "Enjoy",
    description: "Show up, enjoy the moment, and create memories that last.",
    icon: PartyPopper,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FFF9F2] text-[#3E000C] selection:bg-[#3E000C] selection:text-[#FFECD1]">
      <style>{`
        @keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: rise 0.8s ease-out both; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .float { animation: float 5s ease-in-out infinite; }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spinSlow 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .rise, .float, .spin-slow { animation: none; }
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#F5D8B3] bg-[#FFF9F2]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3E000C] text-[#FFECD1] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <Ticket className="h-6 w-6" />
            </div>

            <span className="text-2xl font-extrabold tracking-tight">
              Gather<span className="text-orange-700">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#categories" className="transition hover:text-orange-800">
              Categories
            </a>
            <a href="#featured" className="transition hover:text-orange-800">
              Featured
            </a>
            <a href="#how-it-works" className="transition hover:text-orange-800">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-[#F5E7D5] sm:px-4"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#3E000C] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#5A1020] hover:shadow-lg sm:px-5"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div>
            <div
              className="rise mb-6 inline-flex items-center gap-2 rounded-full border border-[#F0CDA9] bg-white px-4 py-2 text-sm font-medium shadow-sm"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-600" />
              </span>
              Find your next unforgettable experience
            </div>

            <h1
              className="rise max-w-2xl text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "120ms" }}
            >
              Life is better
              <br />
              <span className="bg-gradient-to-r from-orange-800 to-rose-700 bg-clip-text text-transparent">
                when we
              </span>
              <br />
              gather.
            </h1>

            <p
              className="rise mt-6 max-w-xl text-base leading-8 text-stone-600 sm:text-lg"
              style={{ animationDelay: "240ms" }}
            >
              From live concerts to creative festivals, discover events you
              love, book your tickets, and create memories that last.
            </p>

            <div
              className="rise mt-9 flex flex-wrap gap-4"
              style={{ animationDelay: "360ms" }}
            >
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#3E000C] px-6 py-4 font-semibold text-white shadow-lg shadow-[#3E000C]/20 transition hover:-translate-y-0.5 hover:bg-[#5A1020] hover:shadow-xl"
              >
                Explore Events
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-[#D8B99B] bg-white px-6 py-4 font-semibold transition hover:-translate-y-0.5 hover:bg-[#FFF0DE] hover:shadow-md"
              >
                Join Gather
              </Link>
            </div>

            <div
              className="rise mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-stone-600"
              style={{ animationDelay: "480ms" }}
            >
              <span className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-orange-800" />
                Easy ticket booking
              </span>

              <span className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-orange-800" />
                Events for everyone
              </span>

              <span className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-orange-800" />
                Save your favourites
              </span>
            </div>
          </div>

          {/* Hero artwork */}
          <div
            className="rise relative mx-auto w-full max-w-lg"
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] p-6 text-white shadow-2xl sm:p-10">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

              <div className="relative">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm text-[#FFECD1]">
                  Your next adventure starts here
                </span>

                <div className="my-10 flex items-center justify-center">
                  <div className="relative">
                    <div className="spin-slow absolute -inset-4 rounded-full border border-dashed border-[#FFECD1]/30" />

                    <div className="flex h-48 w-48 items-center justify-center rounded-full border border-[#FFECD1]/30 bg-gradient-to-br from-orange-300 via-rose-500 to-purple-900 shadow-xl sm:h-60 sm:w-60">
                      <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/30 bg-[#3E000C]/80 sm:h-44 sm:w-44">
                        <Ticket className="h-20 w-20 text-[#FFECD1] sm:h-24 sm:w-24" />
                      </div>
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

            {/* Floating cards */}
            <div className="float absolute -bottom-5 -left-2 rounded-2xl border border-[#F5D8B3] bg-white p-4 shadow-lg sm:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                  <CalendarDays className="h-6 w-6 text-orange-800" />
                </div>
                <div>
                  <p className="font-bold">Your next experience</p>
                  <p className="text-sm text-stone-500">Just a few clicks away</p>
                </div>
              </div>
            </div>

            <div
              className="float absolute -right-2 top-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F5D8B3] bg-white shadow-lg sm:-right-6"
              style={{ animationDelay: "1.2s" }}
            >
              <Music className="h-7 w-7 text-orange-800" />
            </div>

            <div
              className="float absolute -left-3 top-1/3 hidden h-12 w-12 items-center justify-center rounded-2xl border border-[#F5D8B3] bg-white shadow-lg sm:flex"
              style={{ animationDelay: "2.4s" }}
            >
              <Trophy className="h-6 w-6 text-orange-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="scroll-mt-20 border-y border-[#F5D8B3] bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
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
              className="group inline-flex items-center gap-2 font-semibold transition hover:text-orange-800"
            >
              All events
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = category.icon;

              return (
                <Reveal key={category.name} delay={index * 80}>
                  <Link
                    href={`/events?category=${encodeURIComponent(category.name)}`}
                    className="group relative block h-full overflow-hidden rounded-2xl border border-[#F1DDC7] bg-[#FFF9F2] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3E000C] hover:bg-[#3E000C] hover:text-[#FFECD1] hover:shadow-xl"
                  >
                    <span className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-200/40 transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10" />

                    <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3E000C] text-[#FFECD1] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#FFECD1] group-hover:text-[#3E000C]">
                      <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="relative text-lg font-bold">{category.name}</h3>

                    <p className="relative mt-2 text-sm leading-6 text-stone-600 transition-colors group-hover:text-[#FFECD1]/80">
                      {category.description}
                    </p>

                    <div className="relative mt-5 flex items-center gap-2 text-sm font-semibold text-orange-800 transition-colors group-hover:text-[#FFECD1]">
                      Explore
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events - Actual events from MongoDB */}
      <div id="featured" className="scroll-mt-20">
        <FeaturedEvents />
      </div>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="mb-12 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-800">
              Simple &amp; quick
            </p>
            <h2 className="text-3xl font-extrabold sm:text-4xl">How it works</h2>
            <p className="mx-auto mt-3 max-w-md text-stone-600">
              From finding an event to walking through the door, in three easy steps.
            </p>
          </Reveal>

          <div className="relative grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-[#D8B99B] md:block" />

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Reveal key={step.title} delay={index * 120}>
                  <div className="relative rounded-2xl border border-[#F1DDC7] bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#3E000C] text-[#FFECD1] shadow-lg">
                      <Icon className="h-9 w-9" />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-700 text-sm font-bold text-white">
                        {index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <Reveal>
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#3E000C] via-[#4A0612] to-[#2B0008] px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#FFECD1]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#FFECD1_1px,transparent_1px)] [background-size:22px_22px]" />

            <div className="relative">
              <div className="float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <PartyPopper className="h-7 w-7 text-[#FFECD1]" />
              </div>

              <h2 className="mt-6 text-3xl font-extrabold sm:text-4xl">
                Have an event to organize?
              </h2>

              <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
                Bring people together. Create your event and help others
                discover an experience worth remembering.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#FFECD1] px-6 py-3.5 font-bold text-[#3E000C] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/events"
                  className="rounded-xl border border-[#FFECD1]/40 px-6 py-3.5 font-semibold text-[#FFECD1] transition hover:bg-white/10"
                >
                  Browse events
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer (still commented out, as in your original)
      <footer className="border-t border-[#F5D8B3] bg-white">
        ...
      </footer>
      */}
    </main>
  );
}