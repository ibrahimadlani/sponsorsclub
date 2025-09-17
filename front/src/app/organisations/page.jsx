"use client";
/**
 * Organisations Listing Page
 * Displays a grid of organisation cards using a shared header and grid components.
 */

// Page: Organisations listing
// Factorized header and grid; comments added for clarity.
import { useState, useEffect, useContext } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthContext from "@/context/AuthContext";
import PageHeader from "@/components/page-header";
import ItemsGrid from "@/components/items-grid";

// Exemple d'items organisations (à adapter selon ta vraie structure)
const organisationsData = [
  {
    id: 301,
    name: "Fédération Française de Football",
    location: "Paris, France",
    category: "🏛️ Fédération",
    price: "150 000",
    isCarousel: true,
    profileUrl: "/organisations/fff",
    certified: true,
    images: ["/images/fff-1.jpg", "/images/fff-2.jpg", "/images/fff-3.jpg"],
    bio: "Fédération nationale de football, organisatrice des compétitions françaises.",
    subscribers: { vb: 2000000, instagram: 5000000, youtube: 1500000 },
    level: "OFFICIEL",
  },
  {
    id: 302,
    name: "Comité National Olympique",
    location: "Paris, France",
    category: "🏛️ Olympique",
    price: "200 000",
    isCarousel: true,
    profileUrl: "/organisations/cnosf",
    certified: true,
    images: ["/images/cnosf-1.jpg", "/images/cnosf-2.jpg", "/images/cnosf-3.jpg"],
    bio: "Comité National Olympique et Sportif Français.",
    subscribers: { vb: 1500000, instagram: 3000000, youtube: 800000 },
    level: "OFFICIEL",
  },
  {
    id: 303,
    name: "Ligue 1 Uber Eats",
    location: "Paris, France",
    category: "⚽ Championnat",
    price: "120 000",
    isCarousel: true,
    profileUrl: "/organisations/ligue1",
    certified: true,
    images: ["/images/ligue1-1.jpg", "/images/ligue1-2.jpg", "/images/ligue1-3.jpg"],
    bio: "Championnat de France de football professionnel.",
    subscribers: { vb: 3000000, instagram: 8000000, youtube: 2000000 },
    level: "OFFICIEL",
  },
  {
    id: 304,
    name: "Roland Garros",
    location: "Paris, France",
    category: "🎾 Tournoi",
    price: "180 000",
    isCarousel: true,
    profileUrl: "/organisations/roland-garros",
    certified: true,
    images: ["/images/rg-1.jpg", "/images/rg-2.jpg", "/images/rg-3.jpg"],
    bio: "Tournoi du Grand Chelem de tennis sur terre battue.",
    subscribers: { vb: 1000000, instagram: 4000000, youtube: 1200000 },
    level: "OFFICIEL",
  },
  {
    id: 305,
    name: "Tour de France",
    location: "Paris, France",
    category: "🚴‍♂️ Course",
    price: "250 000",
    isCarousel: true,
    profileUrl: "/organisations/tour-de-france",
    certified: true,
    images: ["/images/tdf-1.jpg", "/images/tdf-2.jpg", "/images/tdf-3.jpg"],
    bio: "Course cycliste la plus prestigieuse au monde.",
    subscribers: { vb: 2500000, instagram: 6000000, youtube: 3000000 },
    level: "OFFICIEL",
  },
  {
    id: 306,
    name: "Fédération Française de Rugby",
    location: "Marcoussis, France",
    category: "🏉 Fédération",
    price: "100 000",
    isCarousel: true,
    profileUrl: "/organisations/ffr",
    certified: true,
    images: ["/images/ffr-1.jpg", "/images/ffr-2.jpg", "/images/ffr-3.jpg"],
    bio: "Fédération nationale de rugby, gérant le XV de France.",
    subscribers: { vb: 800000, instagram: 1500000, youtube: 600000 },
    level: "OFFICIEL",
  },
];

export default function OrganisationsPage() {
  const { user } = useContext(AuthContext);
  // Local state: loading flag and fetched items
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Simulate API call to fetch data
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(organisationsData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* Shared app header */}
        <PageHeader user={user} />

        {/* Tabs for organisation categories */}
        {/* <OrganisationsTabs className="w-full"/> */}
        {/* Conditional rendering: show map or grid */}
        <div className="flex flex-1 flex-col gap-4 px-6 md:px-12 2xl:px-24 py-3">
          {/* Grid of organisation cards or skeletons while loading */}
          <ItemsGrid loading={loading} items={items} badgeColor="bg-blue-600" />
        </div>
        {/* GRID of items end */}
      </SidebarInset>
    </SidebarProvider>
  );
}
