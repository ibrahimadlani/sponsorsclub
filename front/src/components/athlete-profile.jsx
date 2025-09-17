"use client";
import { Fragment } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Check,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Heart,
  HeartCrack,
  Send,
  MapPin,
  Flag,
  Globe,
  User as UserIcon,
  Users,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AthleteProfileHeader({
  title = "Back End Developer",
  breadcrumbs = [
    { label: "Athletes", href: "/athletes" },
    { label: "Profile" },
  ],
  levelLabel = "Full-time",
  ageLabel,
  nationalityLabel,
  location = "Remote",
  priceLabel = "$120k – $140k",
  calendarLabel = "Disponible maintenant",
  images = [],
  isFollowed = false,
  onToggleFollow,
  followAnimating = false,
  followersCount = 0,
}) {
  return (
    <>


      <div className="lg:flex lg:items-center lg:justify-between  py-6">
      <div className="min-w-0 flex-1 ">
        {/* Breadcrumbs */}
        <Breadcrumb aria-label="Breadcrumb" className="flex">
          <BreadcrumbList>
            {breadcrumbs.map((bc, idx) => (
              <Fragment key={idx}>
                <BreadcrumbItem>
                  {bc.href ? (
                    <BreadcrumbLink asChild>
                      <Link
                        href={bc.href}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {bc.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {bc.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="size-4 text-gray-400 dark:text-gray-500" />
                  </BreadcrumbSeparator>
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        

        {/* Title */}
        <h2 className="mt-2 text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white flex items-center gap-2">
          {title}
          {levelLabel && (
            <span className="flex items-center gap-1 text-white bg-pink-600 text-xs font-semibold py-0.5 pl-0.5 pr-1.5 shadow rounded-full">
              <BadgeCheck className="w-4 h-4" />
              {levelLabel}
            </span>
          )}
        </h2>

        {/* Meta */}
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {ageLabel && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <UserIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
              {ageLabel}
            </div>
          )}
          {nationalityLabel && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Globe aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
              {nationalityLabel}
            </div>
          )}
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
            {location}
          </div>

          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
            {followersCount} abonnés
          </div>

          
          
        </div>

      </div>

      {/* Actions */}
      <div className="mt-5 flex lg:mt-0 lg:ml-4">
        <span className="hidden sm:block">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Flag aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
            Report profile
          </button>
        </span>

        <span className="ml-3 hidden sm:block">
          <button
            type="button"
            onClick={onToggleFollow}
            className={`group inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs inset-ring inset-ring-gray-300 transition-all
              ${isFollowed
                ? 'bg-pink-50 text-pink-700 hover:bg-pink-100 dark:bg-pink-600/20 dark:text-pink-300 dark:hover:bg-pink-600/30'
                : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-zinc-800/60 dark:text-white dark:hover:bg-zinc-700/60'}
              ${followAnimating ? 'ring-2 ring-pink-400 ring-offset-1' : ''}`}
          >
            {/* Icon state: default heart, on hover show broken heart when followed */}
            {isFollowed ? (
              <>
                <Heart aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-pink-600 block group-hover:hidden" />
                <HeartCrack aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-pink-600 hidden group-hover:block" />
              </>
            ) : (
              <Heart aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400 dark:text-white" />
            )}
            <span className={isFollowed ? 'group-hover:line-through' : ''}>
              {isFollowed ? 'Suivi' : 'Suivre'}
            </span>
          </button>
        </span>

        <span className="sm:ml-3">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-pink-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 dark:shadow-none"
          >
            <Send aria-hidden="true" className="mr-1.5 -ml-0.5 size-5" />
            Contact
          </button>
        </span>

        {/* Dropdown (mobile) */}
        <div className="relative ml-3 sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20">
              More
              <ChevronDown aria-hidden="true" className="-mr-1 ml-1.5 size-5 text-gray-400 dark:text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-28">
              <DropdownMenuItem>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
          {/* Bento grid above header: 4 photos */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:grid-rows-2">
        {/* Block 1: visible on all, spans 2/3 on md, 4/6 on lg */}
        <div className="flex p-px md:col-span-2 lg:col-span-4">
          <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-t-4xl lg:rounded-tl-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
            <img alt="" src={images[0] || "/images/placeholder.jpg"} className="h-80 w-full object-cover object-center" />
          </div>
        </div>
        {/* Block 2: hidden on base, visible md (1/3) and lg (2/6) */}
        <div className="hidden p-px md:flex md:col-span-1 lg:col-span-2">
          <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-tr-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
            <img alt="" src={images[1] || images[0] || "/images/placeholder.jpg"} className="h-80 w-full object-cover object-center" />
          </div>
        </div>
        {/* Block 3: only visible on lg (2/6) */}
        <div className="hidden p-px lg:flex lg:col-span-2">
          <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 lg:rounded-bl-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
            <img alt="" src={images[2] || images[0] || "/images/placeholder.jpg"} className="h-80 w-full object-cover object-center" />
          </div>
        </div>
        {/* Block 4: only visible on lg (4/6) */}
        <div className="hidden p-px lg:flex lg:col-span-4">
          <div className="w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 max-lg:rounded-b-4xl lg:rounded-br-4xl dark:bg-gray-800 dark:shadow-none dark:outline-white/15">
            <img alt="" src={images[3] || images[1] || "/images/placeholder.jpg"} className="h-80 w-full object-cover object-center" />
          </div>
        </div>
      </div>
    </>
  );
}
