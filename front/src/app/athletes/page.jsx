"use client";
/**
 * Athletes Listing Page
 * Displays a grid of athlete cards using a shared header and grid components.
 */

// Page: Athletes listing
// Factorized header and grid; comments added for clarity.
import { useState, useEffect, useContext, useRef } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthContext from "@/context/AuthContext";
import PageHeader from "@/components/page-header";
import ItemsGrid from "@/components/items-grid";
import { getAthletesPage } from "@/lib/api";
import SkeletonItem from "@/components/skeleton-item";

// Exemple d'items athlètes (à adapter selon ta vraie structure)
const athletesData = [
  {
    id: 201,
    name: "Kylian Mbappé",
    location: "Paris, France",
    category: "⚽ Football",
    price: "50 000",
    isCarousel: true,
    profileUrl: "/athletes/mbappe",
    certified: true,
    images: ["/images/mbappe-1.jpg", "/images/mbappe-2.jpg", "/images/mbappe-3.jpg"],
    bio: "Attaquant vedette du PSG et de l'équipe de France.",
    subscribers: { vb: 1000000, instagram: 108000000, youtube: 2000000 },
    level: "PRO",
  },
  {
    id: 202,
    name: "Teddy Riner",
    location: "Paris, France",
    category: "🥋 Judo",
    price: "30 000",
    isCarousel: true,
    profileUrl: "/athletes/teddy-riner",
    certified: true,
    images: ["/images/teddy-1.jpg", "/images/teddy-2.jpg", "/images/teddy-3.jpg"],
    bio: "Judoka le plus titré de l'histoire.",
    subscribers: { vb: 500000, instagram: 800000, youtube: 100000 },
    level: "PRO",
  },
  {
    id: 203,
    name: "Clarisse Agbégnénou",
    location: "Paris, France",
    category: "🥋 Judo",
    price: "20 000",
    isCarousel: true,
    profileUrl: "/athletes/clarisse",
    certified: true,
    images: ["/images/clarisse-1.jpg", "/images/clarisse-2.jpg", "/images/clarisse-3.jpg"],
    bio: "Championne olympique et mondiale de judo.",
    subscribers: { vb: 200000, instagram: 300000, youtube: 50000 },
    level: "PRO",
  },
  {
    id: 204,
    name: "Estelle Mossely",
    location: "Paris, France",
    category: "🥊 Boxe",
    price: "15 000",
    isCarousel: true,
    profileUrl: "/athletes/estelle",
    certified: true,
    images: ["/images/estelle-1.jpg", "/images/estelle-2.jpg", "/images/estelle-3.jpg"],
    bio: "Championne olympique de boxe.",
    subscribers: { vb: 100000, instagram: 120000, youtube: 30000 },
    level: "PRO",
  },
  {
    id: 205,
    name: "Victor Wembanyama",
    location: "Paris, France",
    category: "🏀 Basket",
    price: "40 000",
    isCarousel: true,
    profileUrl: "/athletes/wemby",
    certified: true,
    images: ["/images/wemby-1.jpg", "/images/wemby-2.jpg", "/images/wemby-3.jpg"],
    bio: "Phénomène du basket français et NBA.",
    subscribers: { vb: 300000, instagram: 1500000, youtube: 100000 },
    level: "PRO",
  },
  {
    id: 206,
    name: "Tony Yoka",
    location: "Paris, France",
    category: "🥊 Boxe",
    price: "18 000",
    isCarousel: true,
    profileUrl: "/athletes/yoka",
    certified: true,
    images: ["/images/yoka-1.jpg", "/images/yoka-2.jpg", "/images/yoka-3.jpg"],
    bio: "Champion olympique de boxe.",
    subscribers: { vb: 120000, instagram: 200000, youtube: 40000 },
    level: "PRO",
  },
];

export default function AthletesPage() {
  const { user } = useContext(AuthContext);

  // Local state: loading flag and fetched items
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  // Initial page
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { results, next } = await getAthletesPage(12, 0);
        if (!mounted) return;
        setItems(results);
        setHasMore(Boolean(next));
        setOffset(results.length);
      } catch (e) {
        setItems([]);
        setHasMore(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Infinite scroll with IntersectionObserver
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !fetchingMore) {
        setFetchingMore(true);
        try {
          const { results, next } = await getAthletesPage(12, offset);
          setItems((prev) => [...prev, ...results]);
          setOffset((prev) => prev + results.length);
          setHasMore(Boolean(next));
        } catch (e) {
          setHasMore(false);
        } finally {
          setFetchingMore(false);
        }
      }
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [offset, hasMore, fetchingMore, loading]);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* Shared app header */}
        <PageHeader user={user} />

        {/* Main content: grid of athlete cards */}
        <div className="flex flex-1 flex-col gap-4 px-6 md:px-12 2xl:px-24 py-3">
          <ItemsGrid loading={loading} items={items} badgeColor="bg-pink-600" />
          {/* Additional skeletons while fetching more */}
          {fetchingMore && (
            <div className="grid gap-x-6 gap-y-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array(8).fill(0).map((_, i) => (
                <SkeletonItem key={`more-${i}`} />
              ))}
            </div>
          )}
          {/* Invisible sentinel for infinite scroll trigger */}
          {hasMore && <div ref={sentinelRef} className="h-2" />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
