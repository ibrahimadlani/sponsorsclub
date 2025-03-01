import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useTheme } from "next-themes";

const AthletesTabs = () => {
  const { theme, resolvedTheme } = useTheme();
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent mismatches during SSR
  if (!mounted) return null;

  // Helper to append "-white" to the filename when dark mode is active
  const getImagePath = (filename) => {
    if (!filename) {
      throw new Error("Filename is required");
    }
  
    const basePath = "/images/sports";
    const theme = typeof currentTheme !== "undefined" && currentTheme === "dark" ? "white" : "black";
    console.log(`${basePath}/${theme}/${filename}.png`)
    return `${basePath}/${theme}/${filename}.png`;
  };
  

  return (
    <Tabs defaultValue="olympics" className="max-w-screen overflow-x-auto">
      <TabsList className="gap-10 p-3 flex items-center justify-center">
      <TabsTrigger
        value="olympics"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("olympics")} width={32} height={32} alt="Catégorie Olympiques" />
        Olympiques
      </TabsTrigger>
      <TabsTrigger
        value="top-performers"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("laurelwreath")} width={32} height={32} alt="Catégorie Top Performers" />
        Top Performers
      </TabsTrigger>

      <TabsTrigger
        value="trends"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("fire")} width={32} height={32} alt="Catégorie Tendances" />
        Tendances
      </TabsTrigger>
      <TabsTrigger
        value="trends"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("plant")} width={32} height={32} alt="Catégorie Tendances" />
        Espoirs
      </TabsTrigger>
      <div className='border-r  h-12 w[1px]'></div>
      <TabsTrigger
        value="football"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("football")} width={32} height={32} alt="Catégorie Football" />
        Football
      </TabsTrigger>

      <TabsTrigger
        value="basketball"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("basketball")} width={32} height={32} alt="Catégorie Basketball" />
        Basketball
      </TabsTrigger>

      <TabsTrigger
        value="tennis"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("tennis")} width={32} height={32} alt="Catégorie Tennis" />
        Tennis
      </TabsTrigger>

      <TabsTrigger
        value="cycling"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("bike")} width={32} height={32} alt="Catégorie Cyclisme" />
        Cyclisme
      </TabsTrigger>

      <TabsTrigger
        value="handball"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("handball")} width={32} height={32} alt="Catégorie Handball" />
        Handball
      </TabsTrigger>

      <TabsTrigger
        value="martial-arts"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("martialsarts")} width={32} height={32} alt="Catégorie Arts Martiaux" />
        Arts Martiaux
      </TabsTrigger>

      <TabsTrigger
        value="athletics"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("athletics")} width={32} height={32} alt="Catégorie Athlétisme" />
        Athlétisme
      </TabsTrigger>

      <TabsTrigger
        value="ski"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("ski")} width={32} height={32} alt="Catégorie Ski" />
        Ski
      </TabsTrigger>

      <TabsTrigger
        value="snowboard"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("snowboard")} width={32} height={32} alt="Catégorie Snowboard" />
        Snowboard
      </TabsTrigger>
      <TabsTrigger
        value="fencing"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("fencing")} width={32} height={32} alt="Catégorie Escrime" />
        Escrime
      </TabsTrigger>
      <TabsTrigger
        value="golf"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("swimming")} width={32} height={32} alt="Catégorie Golf" />
        Natation
      </TabsTrigger>

      <TabsTrigger
        value="canoe"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("canoe")} width={32} height={32} alt="Catégorie Canoë" />
        Canoë
      </TabsTrigger>
      <TabsTrigger
        value="surf"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("surf")} width={32} height={32} alt="Catégorie Surf" />
        Surf
      </TabsTrigger>
      <TabsTrigger
        value="weightlifting"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("weightlifting")} width={32} height={32} alt="Catégorie Haltérophilie" />
        Haltérophilie
      </TabsTrigger>

      <TabsTrigger
        value="motorsport"
        className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
      >
        <Image src={getImagePath("moto")} width={32} height={32} alt="Catégorie Moto" />
        Moto
      </TabsTrigger>
      </TabsList>
      {/* Optional TabsContent can be added here */}
    </Tabs>
  );
};

export default AthletesTabs;