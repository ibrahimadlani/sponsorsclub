import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonItem() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      {/* Image Placeholder */}
      <Skeleton className="h-[250px] w-full rounded-xl" />
      
      {/* Text Placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}