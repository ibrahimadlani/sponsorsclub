import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Instagram, Facebook, Youtube } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselDots } from "@/components/ui/carousel";
import FollowerGrowthChart from "@/components/bar-chart";
import RadarChartComponent from "@/components/radar-chart";
import { formatNumber, formatPriceEUR } from "@/lib/utils";
const safeFormatPrice = (value) => {
  if (typeof formatPriceEUR === 'function') return formatPriceEUR(value);
  try {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\s|€/g, ''));
    if (Number.isNaN(num)) return `${value}€`;
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num) + '€';
  } catch { return `${value}€`; }
};

// Composant réutilisable pour afficher chaque item (athlète, équipe, organisation)
const ItemCard = ({ item, badgeColor = "bg-pink-600" }) => {
  // Normalize shapes from API vs legacy mocks
  const href = item.profileUrl || item.profile_url || "#";
  const images = Array.isArray(item.images) && item.images.length
    ? item.images
    : [item.image1, item.image2, item.image3].filter(Boolean);
  const isCarousel = item.isCarousel ?? item.is_carousel ?? Boolean(images.length);
  const subs = item.subscribers || {
    instagram: item.subscribers_instagram ?? 0,
    vb: item.subscribers_facebook ?? 0,
    youtube: item.subscribers_youtube ?? 0,
  };
  return (
    <div className="rounded-xl w-full group relative block transition-transform transform z-0">
      {/* Badge de certification */}
      {item.certified && (
        <span className="absolute top-4 right-4 flex items-center gap-1 text-black bg-white text-xs font-semibold px-2 py-1 rounded-lg shadow z-50">
          {item.category}
        </span>
      )}
      
      {/* Carousel d'images */}
      {isCarousel ? (
        <div className="relative w-full h-64 rounded-xl border overflow-hidden">
          <Carousel className="w-full h-full z-0">
            <Link href={href}>
              <CarouselContent className="h-full z-20">
                {images.map((image, index) => (
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
                {/* Chart slides for follower growth and radar stats */}
                <CarouselItem className="flex items-center justify-center h-full w-full">
                  <FollowerGrowthChart />
                </CarouselItem>
                <CarouselItem className="flex items-center justify-center h-full w-full">
                  <RadarChartComponent />
                </CarouselItem>
              </CarouselContent>
            </Link>

            {/* Hide carousel navigation buttons on mobile */}
            <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hidden md:flex" />
            <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 hidden md:flex" />
            {/* Progress bullets */}
            <CarouselDots />
          </Carousel>
        </div>
      ) : (
        <div className="aspect-video rounded-xl bg-muted/50" />
      )}
      
      {/* Infos item */}
      <div className="flex flex-col mt-3">
        <div className="">
          <h1 className="font-medium text-base leading-2 flex justify-start items-center gap-2">
            {item.name}
            {item.level ? (
              <span className={`right-4 flex items-center gap-1 text-white ${badgeColor} text-xs font-semibold py-0.5 pl-0.5 pr-1.5 shadow z-50 rounded-full`}>
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
        <div className="font-medium text-sm dark:text-white/50 text-black/50 leading-5 flex items-center gap-2 my-2">
          <div className="flex items-center">
            <Instagram className="h-5 w-5 me-1" strokeWidth={1.5} />
            {formatNumber(subs.instagram || 0)}
          </div>
          <span className="font-bold">·</span>
          <div className="flex items-center">
            <Facebook className="h-5 w-5 me-1" strokeWidth={1.5} />
            {formatNumber(subs.vb || 0)}
          </div>
          <span className="font-bold">·</span>
          <div className="flex items-center">
            <Youtube className="h-5 w-5 me-1" strokeWidth={1.5} />
            {formatNumber(subs.youtube || 0)}
          </div>
        </div>
        <p className="font-normal text-sm leading-5">
          À partir de {" "}
          <span className="font-medium text-base">{safeFormatPrice(item.price)}</span>
        </p>
      </div>
    </div>
  );
};

export default ItemCard;
