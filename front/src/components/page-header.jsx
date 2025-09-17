"use client";

import Logo from "@/components/ui/logo";
import { NavMenu } from "@/components/nav-bar";
import { NavUser } from "@/components/nav-user";

// Generic sticky page header shared by list/detail pages.
// Renders: Logo (left, desktop), main nav (center, desktop), Logo (center on mobile), and user menu (right).
export default function PageHeader({ user, rightSlot = null }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background text-center border-b px-6 md:px-0">
      <div className="relative flex items-center justify-center min-h-[80px]">
        {/* Logo (left, desktop only) */}
        <div className="absolute left-6 top-6 md:left-12 2xl:left-24 hidden md:block">
          <Logo />
        </div>

        {/* Center navigation (desktop) */}
        <div className="relative max-w-md flex-col justify-center items-center lg:flex hidden">
          <NavMenu />
        </div>

        {/* Center logo (mobile) */}
        <div className="relative max-w-md flex items-center md:hidden">
          <Logo className="md:hidden mx-auto" />
        </div>

        {/* Right slot: user menu or any extra controls */}
        <div className="absolute flex right-0 top-4 md:right-12 2xl:right-24 gap-1 items-center">
          {rightSlot ?? <NavUser user={user} />}
        </div>
      </div>
    </header>
  );
}

