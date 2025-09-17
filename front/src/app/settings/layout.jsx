"use client";
/**
 * Settings Layout
 * Shared header and two-column layout (sidebar nav + content) for settings pages.
 */

import React, { useContext, useEffect, useRef } from "react";
import {
  AppWindow,
  Bell,
  CreditCard,
  LayoutDashboard,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import PageHeader from "@/components/page-header";
import AuthContext from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const sidebarNavItems = [
  { title: "Profile", href: "/settings", icon: <User className="w-4 h-4" /> },
  { title: "Notifications", href: "/settings/notifications", icon: <Bell className="w-4 h-4" /> },
  { title: "Appearance", href: "/settings/appearance", icon: <AppWindow className="w-4 h-4" /> },
  { title: "Billing", href: "/settings/billing", icon: <CreditCard className="w-4 h-4" /> },
  { title: "Display", href: "/settings/display", icon: <LayoutDashboard className="w-4 h-4" /> },
];

const SettingsLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef(null);
  const scrollBy = (dx) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) {
      toast.error("Vous devez être connecté pour accéder à cette page.");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, router, pathname]);
  return (
    <SidebarProvider>
      <SidebarInset>
        {/* Unified header */}
        <PageHeader user={user} />

        <div className="px-6 md:px-12 2xl:px-24 py-4">
          <div className="container flex items-center mx-auto w-full py-10 pb-16">
            <div className="space-y-6 w-full">
              <div className="space-y-0.5 w-full">
                <h2 className="text-2xl font-bold tracking-tight">Préférences</h2>
                <p className="text-muted-foreground">
                  Manage your account settings and set e-mail preferences.
                </p>
              </div>
              <Separator className="my-6" />
              <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 w-full">
                <aside className="-mx-4 lg:w-1/5 relative">
                  {/* Mobile horizontal scroller with snap */}
                  <div
                    ref={scrollRef}
                    className="flex lg:block space-x-2 lg:space-x-0 overflow-x-auto lg:overflow-visible whitespace-nowrap scrollbar-hide snap-x snap-mandatory px-4 -mx-4"
                  >
                    <SidebarNav
                      items={sidebarNavItems}
                      className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 [&>a]:snap-start [&>a]:shrink-0"
                    />
                  </div>
                  {/* Fade edges + arrows (mobile only) */}
                  <div className="pointer-events-none lg:hidden absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
                  <div className="pointer-events-none lg:hidden absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
                  <div className="lg:hidden absolute -left-1 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => scrollBy(-160)}
                      className="pointer-events-auto h-7 w-7 rounded-full bg-muted text-foreground grid place-items-center shadow"
                      aria-label="Précédent"
                    >
                      ‹
                    </button>
                  </div>
                  <div className="lg:hidden absolute -right-1 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => scrollBy(160)}
                      className="pointer-events-auto h-7 w-7 rounded-full bg-muted text-foreground grid place-items-center shadow"
                      aria-label="Suivant"
                    >
                      ›
                    </button>
                  </div>
                </aside>
                <div className="flex-1 w-full">{user ? children : null}</div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsLayout;
