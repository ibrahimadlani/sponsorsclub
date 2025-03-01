"use client";

// React Imports
import { useState, useEffect, useContext } from "react";

// Next.js Imports
import Link from "next/link";
import Image from "next/image";

// Third-Party Library Imports
import {
  Globe,
  BadgeCheck,
  Euro,
  ChevronDown,
  Search,
  Handshake,
  MessageSquare,
  Heart,
  User,
  Instagram,
  Facebook,
  Youtube,
  MapIcon,
  ClipboardPen,
  AlignJustify,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Logo from "@/components/ui/logo";
import Skeleton from "@/components/skeleton-item";

// Navigation Components
import { NavUser } from "@/components/nav-user";
import { NavMenu } from "@/components/nav-bar";
import AthletesTabs from "@/components/athletes-tabs";

// Charts
import FollowerGrowthChart from "@/components/bar-chart";
import RadarChartComponent from "@/components/radar-chart";

// Context
import AuthContext from "@/context/AuthContext";

// Utility Functions
import { handleScroll, formatNumber } from "@/lib/utils";


// Données JSON des athlètes avec leur URL de profil
const itemsData = [
  {
    id: 1,
    name: "Teddy Riner",
    location: "Paris, France",
    category: "🥋 Judo",
    price: "20 000",
    isCarousel: true,
    profileUrl: "/athletes/teddy-riner",
    certified: true,
    images: ["/images/teddy-1.jpg", "/images/teddy-2.jpg", "/images/teddy-3.jpg"],
    bio: "Triple champion olympique, 11 fois champion du monde. Un des plus grands judokas de l’histoire.",
    subscribers: { vb: 200000, instagram: 800000, youtube: 150000 },
    level: "PRO",
  },
  {
    id: 2,
    name: "Victor Wembanyama",
    location: "Paris, France",
    category: "🏀 Basketball",
    price: "18 500",
    isCarousel: true,
    profileUrl: "/athletes/victor-wembanyama",
    certified: true,
    images: ["/images/wemby-1.jpg", "/images/wemby-2.jpg", "/images/wemby-3.jpg"],
    bio: "Phénomène du basket français et star de la NBA. L’un des plus grands espoirs du basket mondial.",
    subscribers: { vb: 250000, instagram: 3_500_000, youtube: 500000 },
    level: "PRO",
  },
  {
    id: 3,
    name: "Kylian Mbappé",
    location: "Paris, France",
    category: "⚽ Football",
    price: "50 000",
    isCarousel: true,
    profileUrl: "/athletes/kylian-mbappe",
    certified: true,
    images: ["/images/mbappe-1.jpg", "/images/mbappe-2.jpg", "/images/mbappe-3.jpg"],
    bio: "Champion du monde 2018, joueur du Real Madrid, leader de l’équipe de France.",
    subscribers: { vb: 1_000_000, instagram: 120_000_000, youtube: 2_000_000 },
    level: "PRO",
  },
  {
    id: 4,
    name: "Léon Marchand",
    location: "Toulouse, France",
    category: "🏊‍♂️ Natation",
    price: "10 500",
    isCarousel: true,
    profileUrl: "/athletes/leon-marchand",
    certified: true,
    images: ["/images/leon-1.jpg", "/images/leon-2.jpg", "/images/leon-3.jpg"],
    bio: "Champion du monde du 400m 4 nages et espoir olympique français.",
    subscribers: { vb: 35000, instagram: 1_200_000, youtube: 180000 },
    level: "PRO",
  },
  {
    id: 5,
    name: "Antoine Dupont",
    location: "Toulouse, France",
    category: "🏉 Rugby",
    price: "15 000",
    isCarousel: true,
    profileUrl: "/athletes/antoine-dupont",
    certified: true,
    images: ["/images/dupont-1.jpg", "/images/dupont-2.jpg", "/images/dupont-3.jpg"],
    bio: "Capitaine du XV de France, meilleur joueur du monde en 2021.",
    subscribers: { vb: 80000, instagram: 1_300_000, youtube: 400000 },
    level: "PRO",
  },
  {
    id: 6,
    name: "Clarisse Agbegnenou",
    location: "Paris, France",
    category: "🥋 Judo",
    price: "9 000",
    isCarousel: true,
    profileUrl: "/athletes/clarisse-agbegnenou",
    certified: true,
    images: ["/images/clarisse-1.jpg", "/images/clarisse-2.jpg", "/images/clarisse-3.jpg"],
    bio: "Double championne olympique et six fois championne du monde de judo.",
    subscribers: { vb: 60000, instagram: 500000, youtube: 100000 },
    level: "PRO",
  },
  {
    id: 7,
    name: "Alizé Cornet",
    location: "Nice, France",
    category: "🎾 Tennis",
    price: "7 500",
    isCarousel: true,
    profileUrl: "/athletes/alize-cornet",
    certified: true,
    images: ["/images/alize-1.jpg", "/images/alize-2.jpg", "/images/alize-3.jpg"],
    bio: "Joueuse emblématique du tennis français, avec plus de 60 participations en Grand Chelem.",
    subscribers: { vb: 30000, instagram: 200000, youtube: 80000 },
    level: "PRO",
  },
  {
    id: 8,
    name: "Romain Bardet",
    location: "Clermont-Ferrand, France",
    category: "🚴‍♂️ Cyclisme",
    price: "6 000",
    isCarousel: true,
    profileUrl: "/athletes/romain-bardet",
    certified: true,
    images: ["/images/romain-1.jpg", "/images/romain-2.jpg", "/images/romain-3.jpg"],
    bio: "Meilleur grimpeur français, multiple vainqueur d’étape sur le Tour de France.",
    subscribers: { vb: 50000, instagram: 300000, youtube: 120000 },
    level: "PRO",
  },
  {
    id: 9,
    name: "Estelle Mossely",
    location: "Paris, France",
    category: "🥊 Boxe",
    price: "8 500",
    isCarousel: true,
    profileUrl: "/athletes/estelle-mossely",
    certified: true,
    images: ["/images/estelle-1.jpg", "/images/estelle-2.jpg", "/images/estelle-3.jpg"],
    bio: "Championne olympique et multiple championne du monde de boxe.",
    subscribers: { vb: 70000, instagram: 400000, youtube: 100000 },
    level: "PRO",
  },
  {
    id: 10,
    name: "Justine Braisaz-Bouchet",
    location: "Albertville, France",
    category: "🎿 Biathlon",
    price: "5 500",
    isCarousel: true,
    profileUrl: "/athletes/justine-braisaz",
    certified: true,
    images: ["/images/justine-1.jpg", "/images/justine-2.jpg", "/images/justine-3.jpg"],
    bio: "Championne olympique et étoile montante du biathlon français.",
    subscribers: { vb: 40000, instagram: 250000, youtube: 75000 },
    level: "PRO",
  },
  {
    id: 11,
    name: "Thibaut Pinot",
    location: "Besançon, France",
    category: "🚴‍♂️ Cyclisme",
    price: "7 200",
    isCarousel: true,
    profileUrl: "/athletes/thibaut-pinot",
    certified: true,
    images: ["/images/thibaut-1.jpg", "/images/thibaut-2.jpg", "/images/thibaut-3.jpg"],
    bio: "Ancien vainqueur du Tourmalet, l’un des cyclistes français les plus appréciés.",
    subscribers: { vb: 60000, instagram: 700000, youtube: 180000 },
    level: "PRO",
  },
  {
    id: 12,
    name: "Kevin Mayer",
    location: "Montpellier, France",
    category: "🏃‍♂️ Décathlon",
    price: "9 500",
    isCarousel: true,
    profileUrl: "/athletes/kevin-mayer",
    certified: true,
    images: ["/images/kevin-1.jpg", "/images/kevin-2.jpg", "/images/kevin-3.jpg"],
    bio: "Recordman du monde du décathlon, double vice-champion olympique.",
    subscribers: { vb: 75000, instagram: 500000, youtube: 120000 },
    level: "PRO",
  },
  {
    id: 13,
    name: "Earvin Ngapeth",
    location: "Poitiers, France",
    category: "🏐 Volley-ball",
    price: "8 000",
    isCarousel: true,
    profileUrl: "/athletes/earvin-ngapeth",
    certified: true,
    images: ["/images/earvin-1.jpg", "/images/earvin-2.jpg", "/images/earvin-3.jpg"],
    bio: "Star du volley français, champion olympique et joueur emblématique.",
    subscribers: { vb: 90000, instagram: 400000, youtube: 110000 },
    level: "PRO",
  },
  {
    id: 14,
    name: "Perrine Laffont",
    location: "Toulouse, France",
    category: "⛷ Ski",
    price: "950",
    isCarousel: true,
    profileUrl: "/athletes/perrine-laffont",
    certified: true,
    images: ["/images/perrine-1.jpg", "/images/perrine-2.jpg", "/images/perrine-3.jpg"],
    bio: "Championne olympique de ski de bosses, en route pour Los Angles 2028.",
    subscribers: { vb: 8000, instagram: 34000, youtube: 20000 },
    level: "PRO",
  },
  {
    id: 19,
    name: "Caroline Garcia",
    location: "Lyon, France",
    category: "🎾 Tennis",
    price: "9 800",
    isCarousel: true,
    profileUrl: "/athletes/caroline-garcia",
    certified: true,
    images: ["/images/garcia-1.jpg", "/images/garcia-2.jpg", "/images/garcia-3.jpg"],
    bio: "Joueuse de tennis professionnelle, vainqueure de plusieurs titres WTA en simple et double.",
    subscribers: { vb: 11000, instagram: 200000, youtube: 60000 },
    level: "PRO",
  },
  {
    id: 24,
    name: "Tony Yoka",
    location: "Paris, France",
    category: "🥊 Boxe",
    price: "10 000",
    isCarousel: true,
    profileUrl: "/athletes/tony-yoka",
    certified: true,
    images: ["/images/yoka-1.jpg", "/images/yoka-2.jpg", "/images/yoka-3.jpg"],
    bio: "Champion olympique des poids super-lourds en 2016, boxeur professionnel invaincu.",
    subscribers: { vb: 11500, instagram: 250000, youtube: 90000 },
    level: "PRO",
  },

];

// Composant pour afficher chaque item
const ItemComponent = ({ item }) => {

  return (
    <div className="rounded-xl w-full group relative block transition-transform transform z-0">
      {/* Badge de certification */}
      {item.certified && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-black bg-white text-xs font-semibold px-2 py-1 rounded-lg shadow z-50">
          {item.category}
        </span>
      )}

      {item.isCarousel ? (
        <div className="relative w-full h-64 rounded-xl border overflow-hidden">
          <Carousel className="w-full h-full z-0">
            <Link href={item.profileUrl}>
              <CarouselContent className="h-full z-20">
                {item.images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center h-full w-full"
                  >
                    <Image
                      src={image}
                      alt={`Slide ${index + 1}`}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover object-center mx-auto"
                    />
                  </CarouselItem>
                ))}
                {/* Slide du graphique */}
                <CarouselItem className="flex items-center justify-center h-full w-full">
                  <FollowerGrowthChart />
                </CarouselItem>
                <CarouselItem className="flex items-center justify-center h-full w-full">
                  <RadarChartComponent />
                </CarouselItem>
              </CarouselContent>
            </Link>

            {/* Hide Buttons on Mobile */}
            <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration certified: true, z-30 hidden md:flex" />
            <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration certified: true, z-30 hidden md:flex" />
          </Carousel>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted/50" />
      )}

      {/* Informations de l'item */}
      <div className="flex flex-col mt-3">
        <div className="">
          <h1 className="font-medium text-base leading-2 flex justify-start items-center gap-2">{item.name}
            {item.level ? (
              <span className="right-4 flex items-center gap-1 text-white bg-pink-600 text-xs font-semibold  py-0.5 pl-0.5 pr-1.5  shadow z-50 rounded-full">
                <BadgeCheck className="w-4 h-4" strokeWidth={2} />
                {item.level}
              </span>
            ) : ("")}
          </h1>


          <p className="font-normal text-sm dark:text-white/50 text-black/50 leading-5">
            <span className="font-medium">{item.location}</span>
            <span className="font-bold mx-2">·</span>
            <span>{item.bio}</span>
          </p>


        </div>
        <div className="font-medium text-sm dark:text-white/50 text-black/50 leading-5 flex  items-center gap-2 my-2 ">
          <div className="flex items-center"><Instagram className="h-5 w-5 me-1" strokeWidth={1.5} />{formatNumber(item.subscribers.instagram)}</div>
          <span className="font-bold">·</span>
          <div className="flex items-center"><Facebook className="h-5 w-5 me-1" strokeWidth={1.5} />{formatNumber(item.subscribers.vb)}</div>
          <span className="font-bold">·</span>
          <div className="flex items-center"><Youtube className="h-5 w-5 me-1" strokeWidth={1.5} />{formatNumber(item.subscribers.youtube)}</div>
        </div>
        <p className="font-normal text-sm leading-5">
          À partir de{" "}
          <span className="font-medium text-base">{item.price}</span>€
        </p>
      </div>
    </div>
  );
};

const GoogleMap = () => {
  return (
    <div className="w-full h-full">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed/v1/view?key=AIzaSyD5z6oVvSfl5zkdyIXlsIiaXGHTqtmfB3I&center=48.8566,2.3522&zoom=6"
      />
    </div>
  );
};

export default function Page() {

  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [isHidden, setIsHidden] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Fetch data (Simulating API call)
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
        <header className="sticky top-0 z-50 w-full bg-background text-center border-b px-6 md:px-0 shadow-lg">
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
            <div className="absolute flex right-0 top-4 md:right-12 2xl:right-24 gap-1 items-center ">
                <NavUser user={user} />
              </div>

            </div>
        </header>
        <AthletesTabs className="w-full"/>
        {/* Conditional Rendering */}
        {showMap ? (
            <GoogleMap />
          ) : (
        <div className="flex flex-1 flex-col gap-4 px-6 md:px-12 2xl:px-24 py-3">
          
            <div className="grid mb-36 gap-x-6 gap-y-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
              {loading
                ? Array(10).fill(0).map((_, index) => <Skeleton key={index} />)
                : items.map((item) => <ItemComponent key={item.id} item={item} />)
              }
            </div>
        </div>
          )}  
        {/* GRID des items */}
        

        <footer className="sticky bottom-0 w-full px-6 md:px-12 2xl:px-24 py-4 text-center border-t bg-background items-center justify-between text-sm hidden md:flex">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="">
              &copy; {new Date().getFullYear()} SponsorsClub
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
              Infos sur l&apos;entreprise
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
        {/* ${isHidden ? "translate-y-24" : "translate-y-0"} */}
        <div className="flex w-full justify-center">
          <Button className={`fixed bottom-16 hidden md:flex  py-0 text-xs bg-foreground rounded-full text-background shadow-xl  items-center justify-center z-50  font-semibold `} onClick={() => setShowMap(!showMap)}>

            Afficher la carte
            <MapIcon className="w-4 h-4" />
          </Button>
          <Button className={`transition-transform duration certified: true, ease-in-out fixed bottom-24 md:hidden py-0 text-xs bg-foreground rounded-full text-background shadow-xl flex items-center justify-center z-50  font-semibold ${isHidden ? "translate-y-[75px]" : "translate-y-0"} `}>

            Afficher la carte
            <MapIcon className="w-4 h-4" />
          </Button>
        </div>
        <footer
          className={`fixed bottom-5 left-2.5 right-2.5 w-auto max-w-[560px] mx-auto py-3 bg-background text-center border-t md:hidden px-7 
  transition-transform duration certified: true, ease-in-out rounded-full shadow-xl  ${isHidden ? "translate-y-[100px]" : "translate-y-0"
            }`}
        >
          <div className="flex justify-between w-full">
            <Link href="/explorer" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] text-pink-500">
              <Search className="w-6 h-6 stroke-[1.8]" strokeWidth={1.8} />
              <span className="text-[0.625rem] font-semibold">Explorer</span>
            </Link>
            <Link href="/messages" className="flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[50px] opacity-70">
              <Heart className="w-6 h-6 stroke-[1.4]" strokeWidth={1.4} />
              <span className="text-[0.625rem]">Suivis</span>
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
        <footer
          className={`fixed bottom-5 left-2.5 right-2.5 w-auto max-w-[560px] mx-auto py-3 bg-background text-center border-t md:hidden px-7 
          transition-transform ease-in-out rounded-full shadow-xl ${isHidden ? "translate-y-[100px]" : "translate-y-0"
            }`}
        >
          <div className="flex justify-around w-full">
            <Link href="/explorer" className="flex flex-col items-center gap-0.5 font-medium w-full max-w-[50px] text-pink-500">
              <Search className="w-6 h-6 stroke-[1.8]" />
              <span className="text-[0.625rem] font-semibold">Explorer</span>
            </Link>
            <Link href="/favorites" className="flex flex-col items-center gap-0.5 font-medium w-full max-w-[50px] opacity-70">
              <Heart className="w-6 h-6 stroke-[1.4]" />
              <span className="text-[0.625rem]">Suivis</span>
            </Link>
            <Link href="/login" className="flex flex-col items-center gap-0.5 font-medium w-full max-w-[50px] opacity-70">
              <User className="w-6 h-6 stroke-[1.4]" />
              <span className="text-[0.625rem]">Connexion</span>
            </Link>
            <Link href="/login" className="flex flex-col items-center gap-0.5 font-medium w-full max-w-[50px] opacity-70">
              <ClipboardPen className="w-6 h-6 stroke-[1.4]" />
              <span className="text-[0.625rem]">Inscription</span>
            </Link>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}