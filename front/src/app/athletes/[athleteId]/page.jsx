"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BadgeCheck, Instagram, Facebook, Youtube, MapIcon } from "lucide-react";
import FollowerGrowthChart from "@/components/bar-chart";
import RadarChartComponent from "@/components/radar-chart";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Athlete data array with profile URLs and social stats
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
  ,{
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

export default function AthletePage() {
  const { athleteId } = useParams();
  const [athlete, setAthlete] = useState(null);

  useEffect(() => {
    // Find the athlete by profileUrl or id
    const found = (itemsData || []).filter(Boolean).find(
      (item) =>
        item.profileUrl === `/athletes/${athleteId}` ||
        item.id?.toString() === athleteId
    );
    setAthlete(found);
  }, [athleteId]);

  if (!athlete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg font-semibold text-gray-500">Athlete not found.</p>
        <Link href="/" className="mt-4 text-pink-600 font-semibold hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Athlete header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        {/* Athlete carousel */}
        <div className="w-full md:w-1/2">
          <Carousel className="w-full h-64 rounded-xl border overflow-hidden">
            <CarouselContent className="h-full z-20">
              {athlete.images.map((image, index) => (
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
            </CarouselContent>
          </Carousel>
        </div>
        {/* Athlete info */}
        <div className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {athlete.name}
            {athlete.certified && (
              <span className="flex items-center gap-1 text-white bg-pink-600 text-xs font-semibold py-0.5 pl-0.5 pr-1.5 shadow rounded-full">
                <BadgeCheck className="w-4 h-4" strokeWidth={2} />
                {athlete.level}
              </span>
            )}
          </h1>
          <div className="text-gray-500 font-medium">{athlete.location}</div>
          <div className="text-base text-black/80 dark:text-white/80 mb-2">
            {athlete.bio}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-pink-600 font-semibold">
              <Instagram className="h-5 w-5" strokeWidth={1.5} />
              {formatNumber(athlete.subscribers.instagram)}
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-semibold">
              <Facebook className="h-5 w-5" strokeWidth={1.5} />
              {formatNumber(athlete.subscribers.vb)}
            </div>
            <div className="flex items-center gap-1 text-red-600 font-semibold">
              <Youtube className="h-5 w-5" strokeWidth={1.5} />
              {formatNumber(athlete.subscribers.youtube)}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-semibold text-pink-600">
              {athlete.price}€
            </span>
            <span className="ml-2 text-gray-500">/ collaboration</span>
          </div>
          <Button className="mt-4 w-fit bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-full px-6 py-2 flex items-center gap-2">
            Contact Athlete
            <MapIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Follower Growth</h2>
          <FollowerGrowthChart />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold mb-2">Performance Radar</h2>
          <RadarChartComponent />
        </div>
      </div>
    </div>
  );
}
