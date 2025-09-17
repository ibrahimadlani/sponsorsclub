"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Building, Map, Shield, ShieldHalf, User, Search } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";


/**
 * Sample data for navigation components.
 * Each object represents a link with a title, URL, and description.
 */
const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

/**
 * NavMenu Component
 *
 * Renders a navigation menu using a combination of navigation items and a dropdown trigger.
 * It leverages custom UI components and icons for a rich navigation experience.
 *
 * @returns {JSX.Element} The rendered navigation menu.
 */
export function NavMenu() {
  const pathname = usePathname();
  return (
    <div>
    <NavigationMenu className="flex-col">
      <NavigationMenuList>
        {/* Athletes Link */}
        <NavigationMenuItem>
          <Link href="/athletes" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              data-active={pathname.startsWith("/athletes") ? "true" : undefined}
            >
              <User className="h-4 w-4 me-2" />
              Athlètes
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Teams Link */}
        <NavigationMenuItem>
          <Link href="/teams" legacyBehavior passHref>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              data-active={pathname.startsWith("/teams") ? "true" : undefined}
            >
              <ShieldHalf className="h-4 w-4 me-2" />
              Équipes
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

         {/* Organisations Link */}
         <NavigationMenuItem>
          <Link href="/organisations" legacyBehavior passHref>
            <NavigationMenuLink 
              className={navigationMenuTriggerStyle()}
              data-active={pathname.startsWith("/organisations") ? "true" : undefined}
            >
              <Building className="h-4 w-4 me-2" />
              Organisations
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

    

        {/* Maps Dropdown Menu */}
        {/* <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Map className="h-4 w-4 me-2" />
            Cartes
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Cartes
                      <br />
                      SponsorsClub
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Radix UI and
                      Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>

              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}
      </NavigationMenuList>
      {/*  <div className="flex items-center border rounded-xl pr-4  shadow-lg w-full mx-auto mt-10 mb-9">
        <div className="flex flex-col pl-8 pr-12 py-3 text-left rounded-xl border-2 border-transparent focus-within:border-pink-600 border- transition-all duration-200">
          <label className="font-semibold text-xs mb-1">Disciplines</label>

          <input
            type="text"
            placeholder="Rechercher par disciplines"
            className="flex-3 focus:outline-none text-sm w-48 placeholder-gray-500 bg-transparent"
          />
        </div>
        
        <span className=" h-6 border-l border"></span>

        <div className="flex flex-col pl-8 pr-12 py-3 text-left rounded-xl border-2 border-transparent focus-within:border-pink-600 border- transition-all duration-200">
          <label className="font-semibold text-xs">Influence</label>

          <input
            type="text"
            placeholder="Rechercher par influence"
            className="flex-3 focus:outline-none text-sm w-48 placeholder-gray-500 bg-transparent"
          />
        </div>
        

        <span className=" h-6 border-l border"></span>

        <div className="flex flex-col pl-8 pr-12 py-3 text-left rounded-xl border-2 border-transparent focus-within:border-pink-600 transition-all duration-200 me-2">
          <label className="font-semibold text-xs">Influence</label>

          <input
            type="text"
            placeholder="Rechercher une destination"
            className="flex-3 focus:outline-none text-sm w-48 placeholder-gray-500 bg-transparent"
          />

          
        </div>

        <button className=" flex justify-center items-center bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition h-12 w-12 -mr-1">
          <Search className="h-4 w-12" />
        </button>
      </div>*/}
    </NavigationMenu>
    </div>
  );
}

/**
 * ListItem Component
 *
 * A reusable navigation menu item used within dropdown menus.
 * This component forwards its ref for compatibility with higher-order components.
 *
 * @param {object} props - Component props.
 * @param {string} props.className - Additional CSS classes.
 * @param {string} props.title - The title of the list item.
 * @param {React.ReactNode} props.children - Description or additional content.
 * @param {object} props.href - The URL to navigate to.
 * @param {React.Ref} ref - A forwarded ref.
 * @returns {JSX.Element} A styled list item.
 */
const ListItem = React.forwardRef(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);

ListItem.displayName = "ListItem";