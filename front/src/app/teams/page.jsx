
"use client";
/**
 * Teams Listing Page
 * Displays a grid of team cards using a shared header and grid components.
 */

// Page: Teams listing
// Factorized header and grid; comments added for clarity.
import { useState, useEffect, useContext } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthContext from "@/context/AuthContext";
import PageHeader from "@/components/page-header";
import ItemsGrid from "@/components/items-grid";



// Exemple d'items équipes (à adapter selon ta vraie structure)
const teamsData = [
  {
    id: 101,
    name: "Paris Saint-Germain",
    location: "Paris, France",
    category: "⚽ Football",
    price: "100 000",
    isCarousel: true,
    profileUrl: "/teams/psg",
    certified: true,
    images: ["/images/psg-1.jpg", "/images/psg-2.jpg", "/images/psg-3.jpg"],
    bio: "Club de football professionnel, multiple champion de France.",
    subscribers: { vb: 1000000, instagram: 50000000, youtube: 10000000 },
    level: "PRO",
  },
  {
    id: 102,
    name: "AS Monaco",
    location: "Monaco",
    category: "⚽ Football",
    price: "80 000",
    isCarousel: true,
    profileUrl: "/teams/monaco",
    certified: true,
    images: ["/images/monaco-1.jpg", "/images/monaco-2.jpg", "/images/monaco-3.jpg"],
    bio: "Club de football de la principauté, reconnu en Europe.",
    subscribers: { vb: 500000, instagram: 2000000, youtube: 500000 },
    level: "PRO",
  },
  {
    id: 103,
    name: "Stade Toulousain",
    location: "Toulouse, France",
    category: "🏉 Rugby",
    price: "60 000",
    isCarousel: true,
    profileUrl: "/teams/stade-toulousain",
    certified: true,
    images: ["/images/toulouse-1.jpg", "/images/toulouse-2.jpg", "/images/toulouse-3.jpg"],
    bio: "Club de rugby le plus titré de France.",
    subscribers: { vb: 300000, instagram: 800000, youtube: 200000 },
    level: "PRO",
  },
  {
    id: 104,
    name: "Team Vitality",
    location: "Paris, France",
    category: "🎮 Esport",
    price: "40 000",
    isCarousel: true,
    profileUrl: "/teams/vitality",
    certified: true,
    images: ["/images/vitality-1.jpg", "/images/vitality-2.jpg", "/images/vitality-3.jpg"],
    bio: "Équipe esport leader en Europe.",
    subscribers: { vb: 150000, instagram: 600000, youtube: 350000 },
    level: "PRO",
  },
  {
    id: 105,
    name: "Lyon ASVEL Féminin",
    location: "Lyon, France",
    category: "🏀 Basket Féminin",
    price: "30 000",
    isCarousel: true,
    profileUrl: "/teams/asvel-feminin",
    certified: true,
    images: ["/images/asvel-1.jpg", "/images/asvel-2.jpg", "/images/asvel-3.jpg"],
    bio: "Meilleure équipe féminine de basket en France.",
    subscribers: { vb: 90000, instagram: 120000, youtube: 40000 },
    level: "PRO",
  },
  {
    id: 106,
    name: "RC Toulon",
    location: "Toulon, France",
    category: "🏉 Rugby",
    price: "55 000",
    isCarousel: true,
    profileUrl: "/teams/rc-toulon",
    certified: true,
    images: ["/images/toulon-1.jpg", "/images/toulon-2.jpg", "/images/toulon-3.jpg"],
    bio: "Club de rugby triple champion d'Europe.",
    subscribers: { vb: 250000, instagram: 500000, youtube: 120000 },
    level: "PRO",
  },
];

export default function TeamsPage() {
  const { user } = useContext(AuthContext);
  // Local state: loading flag and fetched items
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // Simulate API call to fetch data
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(teamsData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* Shared app header */}
        <PageHeader user={user} />

        {/* Main content: grid of team cards */}
        <div className="flex flex-1 flex-col gap-4 px-6 md:px-12 2xl:px-24 py-3">
          <ItemsGrid loading={loading} items={items} badgeColor="bg-pink-600" />
        </div>

                {/* GRID of items end */}
      </SidebarInset>
    </SidebarProvider>
  );
}
