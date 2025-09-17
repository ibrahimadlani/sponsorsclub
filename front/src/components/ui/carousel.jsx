"use client";
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef((
  {
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    ...props
  },
  ref
) => {

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };
  
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile); // Listen for window resize
  
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  const [carouselRef, api] = useEmblaCarousel(
    {
      axis: orientation === "horizontal" ? "x" : "y",
      watchDrag: isMobile, // ✅ Disable swipe for non-mobile users
    },
    plugins
  );

  const onSelect = React.useCallback((api) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ChevronLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ChevronRight") {
      event.preventDefault()
      scrollNext()
    }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    };
  }, [api, onSelect])

  return (
    (<CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>)
  );
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    (<div ref={carouselRef} className="overflow-hidden w-full h-full">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "ml-0" : "-mt-4 flex-col h-full",
          className
        )}
        {...props} />
    </div>)
  );
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    (<div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-0" : "pt-4",
        className
      )}
      {...props} />)
  );
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-300 z-30",
        orientation === "horizontal"
          ? "left-2 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        // Ensure disabled buttons stay hidden off-hover, visible (40%) on hover
        // and block clicks from reaching elements underneath (override base disabled:pointer-events-none)
        "disabled:!opacity-0 group-hover:disabled:!opacity-40 disabled:cursor-not-allowed disabled:!pointer-events-auto",
        className
      )}
      disabled={!canScrollPrev}
      onClick={(e) => {
        e.stopPropagation(); // 🔹 Prevent anchor click
        scrollPrev();
      }}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity duration-300 z-50",
        orientation === "horizontal"
          ? "right-2 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        // Ensure disabled buttons stay hidden off-hover, visible (40%) on hover
        // and block clicks from reaching elements underneath (override base disabled:pointer-events-none)
        "disabled:!opacity-0 group-hover:disabled:!opacity-40 disabled:cursor-not-allowed disabled:!pointer-events-auto",
        className
      )}
      disabled={!canScrollNext}
      onClick={(e) => {
        e.stopPropagation(); // 🔹 Prevent anchor click
        scrollNext();
      }}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = "CarouselNext";

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };

// Progress bullets indicator for Embla Carousel
const CarouselDots = ({ className }) => {
  const { api } = useCarousel();
  const [count, setCount] = React.useState(0);
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onReInit = () => {
      try {
        setCount(api.scrollSnapList().length || 0);
        setSelected(api.selectedScrollSnap() || 0);
      } catch (_) {
        setCount(0);
        setSelected(0);
      }
    };
    const onSelect = () => setSelected(api.selectedScrollSnap());

    onReInit();
    api.on("reInit", onReInit);
    api.on("select", onSelect);
    return () => {
      api.off("reInit", onReInit);
      api.off("select", onSelect);
    };
  }, [api]);

  if (!api || count <= 1) return null;

  return (
    <div className={cn(
      "absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Aller au slide ${i + 1}`}
          onClick={(e) => { e.stopPropagation(); api.scrollTo(i); }}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === selected ? "w-3 bg-white shadow ring-1 ring-black/10" : "w-1.5 bg-white/70 hover:bg-white"
          )}
        />
      ))}
    </div>
  );
};

export { CarouselDots };
