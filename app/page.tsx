"use client";

import { useState } from "react";
import Header from "@/components/Header";

const events = [
  {
    id: 1,
    title: "The Sound of Live",
    category: "MUSIC",
    date: "NOV 15, 2026",
    location: "Kozhikode, Kerala",
    price: 499,
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900",
  },
  {
    id: 2,
    title: "Creative Minds Workshop",
    category: "WORKSHOP",
    date: "NOV 20, 2026",
    location: "Kochi, Kerala",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900",
  },
  {
    id: 3,
    title: "The Beautiful Game",
    category: "SPORTS",
    date: "NOV 25, 2026",
    location: "Bengaluru, Karnataka",
    price: 799,
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900",
  },
];

const categories = [
  "All events",
  "Music",
  "Workshop",
  "Sports",
  "Conference",
  "Exhibition",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All events");

  const filteredEvents = events.filter((event) => {
    const matchesSearch = `${event.title} ${event.location}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All events" ||
      event.category.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-[#20201E]">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#85856E]">
              Experiences worth sharing
            </p>

            <h1 className="max-w-2xl text-5xl font-medium leading-[1.12] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">
              Find your
              <br />
              people. Feel
              <br />
              <span className="text-[#898978]">something new.</span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-7 text-[#777770]">
              Discover local experiences, inspiring gatherings, and
              unforgettable events. Your next great memory starts here.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="#events"
                className="rounded-lg bg-[#252521] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#44443D]"
              >
                Explore events <span className="ml-3">↗</span>
              </a>

              <a
                href="#categories"
                className="text-sm font-medium text-[#55554F] transition hover:text-black"
              >
                Browse categories
              </a>
            </div>

            <div className="mt-12 flex items-center gap-4 border-t border-[#E6E5DF] pt-6">
              <div className="flex -space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FAFAF8] bg-[#D8C7B5] text-xs">
                  A
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FAFAF8] bg-[#C7D0BE] text-xs">
                  M
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FAFAF8] bg-[#DDD1D6] text-xs">
                  S
                </div>
              </div>

              <p className="text-sm text-[#777770]">
                Made for people who love experiences.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200"
              alt="People enjoying a live event"
              className="h-[360px] w-full rounded-2xl object-cover sm:h-[450px] lg:h-[540px]"
            />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-xl border border-white/40 bg-white/95 p-5 backdrop-blur-sm sm:bottom-7 sm:left-7 sm:right-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#85856E]">
                  THE WEEKEND EDIT
                </p>
                <h2 className="mt-2 text-lg font-medium sm:text-xl">
                  Moments that bring us together
                </h2>
              </div>

              <a
                href="#events"
                aria-label="Explore events"
                className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E5DF] transition hover:bg-[#F0F0EB]"
              >
                ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="border-y border-[#EAE9E4] bg-[#F3F2ED] py-12"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#85856E]">
                Find your interest
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight">
                Explore by category
              </h2>
            </div>

            <p className="text-sm text-[#777770]">
              Something for every kind of curious.
            </p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-5 py-3 text-sm transition ${
                  category === item
                    ? "border-[#252521] bg-[#252521] text-white"
                    : "border-[#DEDDD5] bg-transparent text-[#55554F] hover:border-[#898978]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section
        id="events"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#85856E]">
              Curated for you
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Upcoming experiences
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#777770]">
              Discover something new happening around you.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <label htmlFor="event-search" className="sr-only">
              Search events
            </label>
            <input
              id="event-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events or locations..."
              className="w-full rounded-lg border border-[#E2E1DA] bg-transparent px-4 py-3 text-sm outline-none transition placeholder:text-[#96968E] focus:border-[#898978]"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <article key={event.id} className="group">
              <div className="relative overflow-hidden rounded-xl bg-[#ECEBE5]">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />

                <span className="absolute left-4 top-4 rounded-md bg-[#FAFAF8]/95 px-3 py-2 text-[10px] font-semibold tracking-[0.12em]">
                  {event.category}
                </span>
              </div>

              <div className="pt-5">
                <p className="text-xs font-medium tracking-[0.08em] text-[#85856E]">
                  {event.date}
                </p>

                <h3 className="mt-2 text-xl font-medium tracking-tight">
                  {event.title}
                </h3>

                <p className="mt-2 text-sm text-[#777770]">
                  {event.location}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#EAE9E4] pt-4">
                  <p className="text-sm text-[#777770]">
                    From{" "}
                    <span className="font-semibold text-[#20201E]">
                      ₹{event.price}
                    </span>
                  </p>

                  <button
                    onClick={() =>
                      alert(
                        "Ticket booking will be connected to your backend next."
                      )
                    }
                    className="text-sm font-medium transition hover:text-[#85856E]"
                  >
                    View event <span className="ml-1">↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-lg font-medium">No events found</p>
              <p className="mt-2 text-sm text-[#777770]">
                Try another search or category.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All events");
                }}
                className="mt-5 text-sm underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Organizer section */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10 lg:pb-24">
        <div className="flex flex-col justify-between gap-8 rounded-2xl bg-[#E9E9E0] p-8 sm:p-12 lg:flex-row lg:items-center lg:p-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777765]">
              For event organizers
            </p>
            <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Have something worth sharing?
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#68685F]">
              Bring your community together. Create an event and help people
              discover experiences they will remember.
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#252521] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#44443D]"
          >
            Become an organizer <span className="ml-4">↗</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EAE9E4]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <a href="/" className="text-xl font-semibold tracking-tight">
            gather<span className="text-[#898978]">.</span>
          </a>

          <p className="text-sm text-[#777770]">
            Discover experiences. Make them memories.
          </p>

          <p className="text-xs text-[#92928A]">
            © 2026 Gather. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}