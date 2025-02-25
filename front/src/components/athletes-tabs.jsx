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
  const getImageSrc = (src) => {
    // Split the source on the last dot to get filename and extension
    const lastDot = src.lastIndexOf('.');
    if (currentTheme === 'dark' && lastDot !== -1) {
      return `${src.slice(0, lastDot)}-white${src.slice(lastDot)}`;
    }
    return src;
  };

  return (
    <Tabs defaultValue="account">
      <TabsList className="gap-10 p-3">
        <TabsTrigger
          value="football"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/football.png")}
            width={32}
            height={32}
            alt="Categorie Football"
          />
          Football
        </TabsTrigger>
        <TabsTrigger
          value="basketball"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/basketball.png")}
            width={32}
            height={32}
            alt="Categorie Basketball"
          />
          Basketball
        </TabsTrigger>
        <TabsTrigger
          value="tennis"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/tennis.png")}
            width={32}
            height={32}
            alt="Categorie Tennis"
          />
          Tennis
        </TabsTrigger>
        <TabsTrigger
          value="cyclisme"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/bike.png")}
            width={32}
            height={32}
            alt="Categorie Cyclisme"
          />
          Cyclisme
        </TabsTrigger>
        <TabsTrigger
          value="handball"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/handball.png")}
            width={32}
            height={32}
            alt="Categorie Handball"
          />
          Handball
        </TabsTrigger>
        <TabsTrigger
          value="fight"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/fight.png")}
            width={32}
            height={32}
            alt="Categorie Art Martials"
          />
          Art Martiaux
        </TabsTrigger>
        <TabsTrigger
          value="athletism"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/athletism.png")}
            width={32}
            height={32}
            alt="Categorie Athlétisme"
          />
          Athlétisme
        </TabsTrigger>
        <TabsTrigger
          value="ski"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/ski.png")}
            width={32}
            height={32}
            alt="Categorie Ski"
          />
          Ski
        </TabsTrigger>
        <TabsTrigger
          value="snowboard"
          className="flex-col items-center justify-center gap-2 text-xs font-medium opacity-75 hover:opacity-100"
        >
          <Image
            src={getImageSrc("/images/sports/snowboard.png")}
            width={32}
            height={32}
            alt="Categorie Snowboard"
          />
          Snowboard
        </TabsTrigger>
      </TabsList>
      {/* Optional TabsContent can be added here */}
    </Tabs>
  );
};

export default AthletesTabs;