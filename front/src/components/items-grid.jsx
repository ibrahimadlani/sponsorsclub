"use client";

import SkeletonItem from "@/components/skeleton-item";
import ItemCard from "@/components/item-card";

// Reusable grid for listing items (athletes, teams, organisations, ...)
// Props:
// - loading: boolean to display skeletons
// - items: array of data objects (see ItemCard contract)
// - badgeColor: tailwind class for the category/level badge
// - renderItem: optional custom renderer (item) => ReactNode
export default function ItemsGrid({ loading, items = [], badgeColor = "bg-pink-600", renderItem }) {
  return (
    <div className="grid mb-36 gap-x-6 gap-y-12 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
      {loading
        ? Array(10).fill(0).map((_, index) => <SkeletonItem key={index} />)
        : items.map((item) =>
            renderItem ? renderItem(item) : <ItemCard key={item.id} item={item} badgeColor={badgeColor} />
          )}
    </div>
  );
}

