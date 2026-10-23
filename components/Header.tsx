import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[#EAE9E4] bg-[#FAFAF8]">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="text-[25px] font-semibold tracking-tight">
          gather<span className="text-[#8B8B78]">.</span>
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-9 text-sm text-[#666660] md:flex">
          <Link href="/" className="text-[#20201E]">
            Home
          </Link>

          <Link href="/events" className="transition hover:text-black">
            Explore
          </Link>

          <Link href="/#categories" className="transition hover:text-black">
            Categories
          </Link>
        </div>

        {/* Authentication buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden px-3 py-2 text-sm transition hover:text-[#85856E] sm:block"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#252521] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#44443D]"
          >
            Get started
          </Link>
        </div>

      </nav>
    </header>
  );
}