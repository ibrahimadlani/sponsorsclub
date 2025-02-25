"use client";

import React from "react";
import {
  BadgeCheck,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  MailIcon,
  Search,
  Handshake,
  LifeBuoy,
  Settings,
} from "lucide-react";

import { useRouter } from "next/navigation"; // Next.js router for redirection
import { logout } from "@/lib/api"; // API function to log out the user
import { useTheme } from "next-themes"; // Hook to manage theme (light/dark)

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";


/**
 * NavUser Component
 *
 * Displays the user's avatar and information within a sidebar menu.
 * Provides a dropdown menu with various navigation options including premium upgrade,
 * exploration, messaging, collaborations, preferences, theme toggle, help center, and logout.
 *
 * @param {object} props - Component properties.
 * @param {object} props.user - User information object.
 * @param {string} props.user.avatar - URL of the user's avatar image.
 * @param {string} props.user.name - Full name of the user.
 * @param {string} props.user.email - User's email address.
 * @param {string} [props.user.firstName] - Optional first name for generating fallback initials.
 * @returns {JSX.Element} The rendered NavUser component.
 */
export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const router = useRouter(); // For navigation
  const { theme, setTheme } = useTheme();

  /**
   * Handles user logout by clearing tokens and redirecting to the login page.
   */
  const handleLogout = () => {
    logout(); // Clear tokens and session data
    router.push("/login"); // Redirect to login page
  };

  /**
   * Toggles the theme between light and dark modes.
   */
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <SidebarMenu className="flex justify-end">
      <SidebarMenuItem className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.firstName ? user.firstName.slice(0, 2).toUpperCase() : ""}
                </AvatarFallback>
              </Avatar>

            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="absolute right-0 top-2 w-56 min-w-56 rounded-lg shadow-lg z-50"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* User Information */}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Premium Option */}
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>
                  Passez <span className="font-bold text-pink-500">Premium</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Navigation Options */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="font-semibold">
                <Search className="mr-2 h-4 w-4" />
                Explorer
              </DropdownMenuItem>
              <DropdownMenuItem className="font-semibold">
                <MailIcon className="mr-2 h-4 w-4" />
                Messsages
              </DropdownMenuItem>
              <DropdownMenuItem className="font-semibold">
                <Handshake className="mr-2 h-4 w-4" />
                Collaborations
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* Preferences and Account Options */}
            <Link href="/settings" passHref>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Préférences
              </DropdownMenuItem>
            </Link>

            {/* Theme Toggle */}
            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Mode {theme === "dark" ? "claire" : "sombre"}
            </DropdownMenuItem>

            {/* Help Center */}
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              Centre d'aide
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Logout Option */}
            <DropdownMenuItem onClick={handleLogout } className="  hover:!text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}