"use client";

import React from "react";
import {
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Search,
  Handshake,
  LifeBuoy,
  Settings,
  User,
  MessageSquare,
  Heart,
  LogIn,
  AlignJustify,
  ClipboardPen,
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
 * Displays a dropdown menu with different content based on user authentication.
 * If authenticated: Shows user profile and navigation options.
 * If not authenticated: Shows login and registration links.
 *
 * @param {object} props - Component properties.
 * @param {object|null} props.user - User information object (or null if not logged in).
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
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarMenu className="flex justify-end">
      
      <SidebarMenuItem className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground !ring-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user ? (
                  <>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.first_name?.charAt(0) || "U"}
                      {user.last_name?.charAt(0) || ""}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="rounded-lg">
                    <AlignJustify className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="absolute right-0 top-2 w-56 min-w-56 rounded-lg shadow-lg z-50"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* ✅ If user is logged in, show user-specific dropdown */}
            {user ? (
              <>
                {/* User Information */}
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">
                        {user.first_name?.charAt(0) || ""}
                        {user.last_name?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.first_name} {user.last_name}
                      </span>
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
                    <Heart className="mr-2 h-4 w-4" />
                    Suivis
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messsages
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold">
                    <Handshake className="mr-2 h-4 w-4" />
                    Collaborations
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-semibold">
                    <User className="mr-2 h-4 w-4" />
                    Profile
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
                  Centre d&apos;aide
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Logout Option */}
                <DropdownMenuItem onClick={handleLogout} className="hover:!text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </>
            ) : (
              <>
                {/* ✅ If user is NOT logged in, show login/signup options */}
                <DropdownMenuGroup>
                  <Link href="/login" passHref className="font-semibold">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Connexion
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/register" passHref className="font-semibold">
                    <DropdownMenuItem>
                      <ClipboardPen className="mr-2 h-4 w-4" />
                      Inscription
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

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
                  Centre d&apos;aide
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}