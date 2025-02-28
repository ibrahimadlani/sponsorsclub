"use client";

// Données utilisateur
const data = {
  user: {
    name: "Ibrahim Adlani",
    email: "ibrahim@adlani.com",
    avatar: "/images/ski-1.jpg",
  },
};

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AppWindow,
  Bell,
  CreditCard,
  Globe,
  LayoutDashboard,
  User,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "@/components/sidebar-nav";
import { NavMenu } from "@/components/nav-bar";
import { NavUser } from "@/components/nav-user";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const sidebarNavItems = [
  { title: "Profile", href: "/settings", icon: <User className="w-4 h-4" /> },
  { title: "Notifications", href: "/settings/notifications", icon: <Bell className="w-4 h-4" /> },
  { title: "Appearance", href: "/settings/appearance", icon: <AppWindow className="w-4 h-4" /> },
  { title: "Billing", href: "/settings/billing", icon: <CreditCard className="w-4 h-4" /> },
  { title: "Display", href: "/settings/display", icon: <LayoutDashboard className="w-4 h-4" /> },
];

const SettingsLayout = ({ children }) => {
  return (
    <SidebarProvider>
      <SidebarInset>
        {/* HEADER */}
        <header className="relative border-b px-6 md:px-12 2xl:px-24 py-4">
          <div className="container flex items-center justify-between mx-auto">
            <Logo />
            <div className="flex gap-1 items-center">
              <Link
                href="/search"
                className="p-3 hover:bg-muted/50 rounded-full text-sm font-semibold"
              >
                <p className="text-nowrap">
                  Passez <span className="text-pink-500">Premium</span>
                </p>
              </Link>
              <Link
                href="/search"
                className="p-3 hover:bg-muted/50 rounded-full"
              >
                <Globe className="w-4 h-4" />
              </Link>
              <NavUser user={data.user} />
            </div>
          </div>
        </header>

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
                <aside className="-mx-4 lg:w-1/5">
                  <div className="flex lg:block space-x-4 lg:space-x-0 overflow-x-auto lg:overflow-visible whitespace-nowrap scrollbar-hide">
                    <SidebarNav items={sidebarNavItems} className="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4" />
                  </div>
                </aside>
                <div className="flex-1 w-full">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsLayout;