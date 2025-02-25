"use client";

import Link from "next/link";
import {
  Globe,
  BadgeCheck,
  Euro,
  ChevronDown,
  Search,
  Mail,
  Handshake,
  UserCircle,
  MessageSquare,
  Heart,
  User,
  Bell,
  Moon,
  Sun,

} from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { handleScroll } from "@/lib/utils";

import { CardContent } from "@/components/ui/card";
import Logo from "@/components/ui/logo";
import BarChart from "@/components/bar-chart";
import FollowerGrowthChart from "@/components/bar-chart";
import { NavUser } from "@/components/nav-user";
import { NavMenu } from "@/components/nav-bar";
import AthletesTabs from "@/components/athletes-tabs";
import Skeleton from "@/components/skeleton-item";
import { useState, useEffect } from "react";

// Données utilisateur
const data = {
  user: {
    name: "Ibrahim Adlani",
    email: "ibrahim@adlani.com",
    avatar: "/images/ski-1.jpg",
  },
};

// Données JSON des athlètes avec leur URL de profil
const itemsData = [
  {
    id: 1,
    name: "Jean Skieur",
    location: "Chamonix, France",
    category: "Ski Freestyle",
    price: "675",
    isCarousel: true,
    profileUrl: "/athletes/jean-skieur",
    certified: true,
    images: ["/images/ski-1.jpg", "/images/ski-2.jpg", "/images/ski-3.jpg"],
  },
  {
    id: 2,
    name: "Sophie Martin",
    location: "Lyon, France",
    category: "Tennis",
    price: "850",
    isCarousel: true,
    profileUrl: "/athletes/sophie-martin",
    certified: true,
    images: ["/images/nadal-1.jpg", "/images/nadal-2.jpg"],
  },
  {
    id: 3,
    name: "Lucas Durand",
    location: "Marseille, France",
    category: "Basketball",
    price: "720",
    isCarousel: true,
    profileUrl: "/athletes/lucas-durand",
    certified: true,
    images: ["/images/wemby-1.jpg", "/images/wemby-2.jpg"],
  },
  {
    id: 4,
    name: "Emma Leclerc",
    location: "Nice, France",
    category: "Swimming",
    price: "900",
    isCarousel: true,
    profileUrl: "/athletes/emma-leclerc",
    certified: false,
    images: ["/images/ski-1.jpg", "/images/ski-2.jpg", "/images/ski-3.jpg"],
  },
  {
    id: 5,
    name: "Nathan Giraud",
    location: "Paris, France",
    category: "Football",
    price: "1050",
    isCarousel: true,
    profileUrl: "/athletes/nathan-giraud",
    certified: true,
    images: ["/images/nadal-1.jpg", "/images/nadal-2.jpg"],
  },
  {
    id: 6,
    name: "Chloé Lambert",
    location: "Bordeaux, France",
    category: "Cycling",
    price: "780",
    isCarousel: true,
    profileUrl: "/athletes/chloe-lambert",
    certified: true,
    images: ["/images/wemby-1.jpg", "/images/wemby-2.jpg"],
  },
  {
    id: 7,
    name: "Hugo Petit",
    location: "Toulouse, France",
    category: "Rugby",
    price: "970",
    isCarousel: true,
    profileUrl: "/athletes/hugo-petit",
    certified: true,
    images: ["/images/ski-1.jpg", "/images/ski-2.jpg"],
  },
  {
    id: 8,
    name: "Camille Roche",
    location: "Strasbourg, France",
    category: "Athletics",
    price: "600",
    isCarousel: true,
    profileUrl: "/athletes/camille-roche",
    certified: false,
    images: ["/images/nadal-1.jpg", "/images/nadal-2.jpg"],
  },
  {
    id: 9,
    name: "Maxime Dupont",
    location: "Grenoble, France",
    category: "Snowboarding",
    price: "820",
    isCarousel: true,
    profileUrl: "/athletes/maxime-dupont",
    certified: true,
    images: ["/images/wemby-1.jpg", "/images/wemby-2.jpg"],
  },
  {
    id: 10,
    name: "Léa Fontaine",
    location: "Rennes, France",
    category: "Gymnastics",
    price: "730",
    isCarousel: true,
    profileUrl: "/athletes/lea-fontaine",
    certified: false,
    images: ["/images/ski-1.jpg", "/images/ski-2.jpg"],
  },
  {
    id: 11,
    name: "Antoine Leroy",
    location: "Dijon, France",
    category: "Judo",
    price: "880",
    isCarousel: true,
    profileUrl: "/athletes/antoine-leroy",
    certified: true,
    images: ["/images/judo-1.jpg", "/images/judo-2.jpg"],
  },
  {
    id: 12,
    name: "Sophie Dufresne",
    location: "Montpellier, France",
    category: "Handball",
    price: "920",
    isCarousel: true,
    profileUrl: "/athletes/sophie-dufresne",
    certified: true,
    images: ["/images/handball-1.jpg", "/images/handball-2.jpg"],
  },
  {
    id: 13,
    name: "Julien Morel",
    location: "Marseille, France",
    category: "Diving",
    price: "845",
    isCarousel: true,
    profileUrl: "/athletes/julien-morel",
    certified: true,
    images: ["/images/diving-1.jpg", "/images/diving-2.jpg"],
  },
  {
    id: 14,
    name: "Élodie Richard",
    location: "Toulon, France",
    category: "Surfing",
    price: "700",
    isCarousel: true,
    profileUrl: "/athletes/elodie-richard",
    certified: false,
    images: ["/images/surfing-1.jpg", "/images/surfing-2.jpg"],
  },
  {
    id: 15,
    name: "Thomas Garnier",
    location: "Lille, France",
    category: "Fencing",
    price: "980",
    isCarousel: true,
    profileUrl: "/athletes/thomas-garnier",
    certified: false,
    images: ["/images/athletics-1.jpg", "/images/athletics-2.jpg"],
  },
];

// Composant pour afficher chaque item
const ItemComponent = ({ item }) => {

  return (
    <div className="rounded-xl w-full group relative block transition-transform transform z-0">
      {/* Badge de certification */}
      {item.certified && (
        <span className="absolute top-2 right-2 flex items-center gap-1 bg-pink-700 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow z-50">
          <BadgeCheck className="w-4 h-4 text-white" />
          Pro
        </span>
      )}

      {item.isCarousel ? (
        <div className="relative w-full h-64 rounded-xl overflow-hidden">
          <Carousel className="w-full h-full z-0">
            <Link href={item.profileUrl}>
              <CarouselContent className="h-full z-20">
                {item.images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center h-full w-full"
                  >
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover object-center mx-auto"
                    />
                  </CarouselItem>
                ))}
                {/* Slide du graphique */}
                <CarouselItem className="flex items-center justify-center h-full w-full">
                  <FollowerGrowthChart />
                </CarouselItem>
              </CarouselContent>
            </Link>

            {/* Hide Buttons on Mobile */}
            <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hidden md:flex" />
            <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hidden md:flex" />
          </Carousel>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted/50" />
      )}

      {/* Informations de l'item */}
      <div className="flex flex-col mt-3">
        <h1 className="font-medium text-base leading-5">{item.name}</h1>
        <p className="font-normal text-sm dark:text-white/50 text-black/50 leading-5">
          {item.location} <span className="font-bold">·</span> {item.category}
        </p>

        <p className="font-normal text-sm leading-5 mt-1">
          À partir de{" "}
          <span className="font-medium text-base">{item.price}</span>€
        </p>
      </div>
    </div>
  );
};

export default function Page() {


  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ✅ Fetch data (Simulating API call)
  useEffect(() => {
    setTimeout(() => {
      setItems(itemsData); // Load data after delay (simulate API call)
      setLoading(false); // Stop loading
    }, 1500); // Simulate API response time (1.5s)
  }, []);

  useEffect(() => {
    const onScroll = () => handleScroll(setIsHidden, lastScrollY, setLastScrollY);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  return (
    <SidebarProvider>
      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-50 w-full bg-background text-center border-b px-6 md:px-0">
          <div className="relative flex items-center justify-center min-h-[80px]">
            {/* Logo (positionné à gauche) */}
            <div className="absolute left-6 top-6 md:left-12 2xl:left-24 hidden md:block">
              <Logo />
            </div>

            {/* Barre de navigation centrale (Desktop) */}
            <div className="relative max-w-md flex-col justify-center items-center lg:flex hidden">
              <NavMenu />
            </div>

            {/* Barre de navigation centrale (Mobile) */}
            <div className="relative max-w-md flex items-center md:hidden">
              <Logo className="md:hidden mx-auto" />

            </div>

            {/* Boutons de navigation et options utilisateur (Desktop Only) */}
            <div className="absolute flex right-0 top-4 md:right-12 2xl:right-24 gap-1 items-center ">
              {/* <Link href="/notifications" className="ml-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
      </Link> */}
              <Link href="/search" className="p-3 hover:bg-muted/50 rounded-full text-sm font-semibold hidden md:flex">
                <p className="text-nowrap">Passez <span className="text-pink-500">Premium</span></p>
              </Link>
              <Link href="/search" className="p-3 hover:bg-muted/50 rounded-full !hidden md:!flex">
                <Globe className="w-4 h-4" />
              </Link>
              <NavUser user={data.user} />
            </div>
          </div>
        </header>

        {/* GRID des items */}
        {/* <AthletesTabs className="w-full"/> */}
        <div className="flex flex-1 flex-col gap-4 px-6 md:px-12 2xl:px-24 py-3">
          <div className="grid gap-x-6 gap-y-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
            {loading
              ? Array(10).fill(0).map((_, index) => <Skeleton key={index} />) // ✅ Show Skeletons while loading
              : items.map((item) => <ItemComponent key={item.id} item={item} />) // ✅ Render real data
            }
          </div>
        </div>
        <footer className="sticky bottom-0 w-full px-6 md:px-12 2xl:px-24 py-4 text-center border-t bg-background items-center justify-between text-sm hidden md:flex">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="">
              &copy; {new Date().getFullYear()} <span className="font-semibold">SponsorsClub</span>
            </span>
            <span> · </span>
            <Link href="/privacy" className="hover:underline">
              Confidentialité
            </Link>
            <span> · </span>
            <Link href="/terms-of-services" className="hover:underline">
              Conditions générales
            </Link>
            <span> · </span>
            <Link href="/sitemap" className="hover:underline">
              Plan du site
            </Link>
            <span> · </span>
            <Link href="/about" className="hover:underline">
              Infos sur l'entreprise
            </Link>
          </div>
          <div className="flex  items-center gap-2.5">

            <Link href="/privacy" className="font-semibold flex items-center gap-1 hover:underline  whitespace-nowrap">
              <Globe className="w-4 h-4" />
              Français (FR)
            </Link>
            <span> · </span>
            <Link href="/privacy" className="font-semibold flex items-center gap-1 hover:underline  whitespace-nowrap">
              <Euro className="w-4 h-4" />
              EUR
            </Link>
            <span> · </span>
            <Link href="/privacy" className="font-semibold flex items-center gap-1 hover:underline  whitespace-nowrap">

              Assistance et ressources
              <ChevronDown className="w-4 h-4" />
            </Link>
          </div>
        </footer>
        {/* FOOTER - version mobile */}
        <footer
          className={`fixed bottom-5 left-2.5 right-2.5 w-auto max-w-[560px] mx-auto py-3 bg-background text-center border-t md:hidden px-7 
  transition-transform duration-300 ease-in-out rounded-full shadow-xl  ${isHidden ? "translate-y-24" : "translate-y-0"
            }`}
        >
          <div className="flex justify-between w-full">
            <Link href="/explorer" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] text-pink-500">
              <Search className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem] font-semibold">Explorer</span>
            </Link>
            <Link href="/messages" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] opacity-70">
              <Heart className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem]">Followed</span>
            </Link>
            <Link href="/messages" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] opacity-70">
              <MessageSquare className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem]">Messages</span>
            </Link>
            <Link href="/collab" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] opacity-70">
              <Handshake className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem]">Collab.</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] opacity-70">
              <User className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem]">Profile</span>
            </Link>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}