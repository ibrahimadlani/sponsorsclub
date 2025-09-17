// SidebarNav.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function SidebarNav({ className, items, ...props }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        // The nav itself never grows wider than the viewport; inner row overflows
        "max-w-full overflow-x-auto lg:overflow-visible touch-pan-x",
        className
      )}
      {...props}
    >
      <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 whitespace-nowrap">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              // Prevent items from shrinking; allow horizontal overflow within nav
              "flex items-center justify-start shrink-0"
            )}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
