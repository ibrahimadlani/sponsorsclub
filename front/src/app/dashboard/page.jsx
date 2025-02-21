import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
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

import { Card, CardContent } from "@/components/ui/card";
import  Logo  from "@/components/logo";

// Reusable Item Component
const ItemComponent = ({ isCarousel = true }) => {
    if (isCarousel) {
        return (
            <div className="rounded-xl w-full group relative">
                <Carousel className="w-full h-full border h-64 rounded-lg">
                    <CarouselContent className="h-full">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index}>
                                <CardContent className="flex items-center justify-center p-6 h-full w-full">
                                    <span className="text-4xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Carousel>
                <h1 className="text-bold font-base text-lg">Ibrahim Adlani</h1>              
            </div>
        );
    }

    return <div className="aspect-video rounded-xl bg-muted/50" />;
};

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-48 shrink-0 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-3">
                        <Logo />
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 px-24 py-12">
                    <div className="grid auto-rows-min gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {Array.from({ length: 20 }).map((_, index) => (
                            <ItemComponent key={index} />
                        ))}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}