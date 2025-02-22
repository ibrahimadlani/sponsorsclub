"use client";

import React from "react";
import {
    BadgeCheck,
    Bell,
    ChevronDown,
    CreditCard,
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

import { useRouter } from "next/navigation"; // Import Next.js router for redirection
import { logout } from "@/lib/api"; // Import the logout function
import { useTheme } from "next-themes"; // Import the theme hook

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export function NavUser({ user }) {
    const { isMobile } = useSidebar();
    const router = useRouter(); // Hook for navigation
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout(); // Clear tokens from storage
        router.push("/login"); // Redirect to login page
    };

    // Toggle the theme between 'light' and 'dark'
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
                            <ChevronDown className="mx-2 size-4" />
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                            </Avatar>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="absolute right-0 top-2 w-56 min-w-56 rounded-lg shadow-lg z-50"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
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
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span>Upgrade to <span className="font-bold text-pink-500 -2">Pro</span></span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
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

                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Préferences
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <BadgeCheck className="mr-2 h-4 w-4" />
                            Account
                        </DropdownMenuItem>
                        {/* Dark/Light mode toggle */}
                        <DropdownMenuItem onClick={toggleTheme}>
                            {theme === "dark" ? (
                                <Sun className="mr-2 h-4 w-4" />
                            ) : (
                                <Moon className="mr-2 h-4 w-4" />
                            )}
                            Mode {theme === "dark" ? "claire" : "sombre"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            Centre d'aide
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}