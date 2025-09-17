"use client";

// Followed feed page: shows a unified feed of updates
// from all athletes the user follows (social posts, competitions,
// follower growth, trophies, photos, etc.).

import { useMemo, useState, useContext, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Medal,
  Instagram,
  Facebook,
  Youtube,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  ImageIcon as ImageIc,
  Camera,
  Heart,
  MessageSquare,
  Search,
  Handshake,
  User,
} from "lucide-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import AuthContext from "@/context/AuthContext";
import { getFollowedAthletes } from "@/lib/userApi";

const sampleFeed = [
  {
    id: "p1",
    type: "post",
    athlete: { name: "Kylian Mbappé", avatar: "/images/mbappe-1.jpg" },
    platform: "instagram",
    text: "Séance d'entraînement avant le match de samedi. On y va à fond !",
    images: ["/images/mbappe-2.jpg", "/images/mbappe-3.jpg"],
    time: "il y a 2 h",
  },
  {
    id: "c1",
    type: "competition",
    athlete: { name: "Clarisse Agbegnenou", avatar: "/images/clarisse-1.jpg" },
    title: "Grand Slam de Paris",
    location: "Accor Arena, Paris",
    date: "12 Mars 2025",
    result: "Qualification en finale",
    time: "hier",
  },
  {
    id: "f1",
    type: "followers",
    athlete: { name: "Victor Wembanyama", avatar: "/images/wemby-1.jpg" },
    delta: +15200,
    platform: "instagram",
    note: "Suite au dernier match",
    time: "il y a 3 j",
  },
  {
    id: "t1",
    type: "trophy",
    athlete: { name: "Teddy Riner", avatar: "/images/teddy-1.jpg" },
    title: "Championnats d'Europe",
    award: "Médaille d'or",
    time: "il y a 1 sem",
  },
  {
    id: "ph1",
    type: "photo",
    athlete: { name: "Caroline Garcia", avatar: "/images/garcia-1.jpg" },
    caption: "Séance photo avant le départ.",
    images: [
      "/images/garcia-2.jpg",
      "/images/garcia-3.jpg",
      "/images/garcia-1.jpg",
    ],
    time: "il y a 2 sem",
  },
  {
    id: "yt1",
    type: "post",
    athlete: { name: "Tony Yoka", avatar: "/images/yoka-1.jpg" },
    platform: "youtube",
    text: "Nouvelle vidéo : retour sur mon dernier combat.",
    images: ["/images/yoka-2.jpg"],
    time: "il y a 1 mois",
  },
];

const FILTERS = [
  { key: "all", label: "Tout" },
  { key: "post", label: "Posts" },
  { key: "competition", label: "Compétitions" },
  { key: "followers", label: "Croissance" },
  { key: "trophy", label: "Trophées" },
  { key: "photo", label: "Photos" },
];

export default function FollowedFeedPage() {
  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");
  const [athletes, setAthletes] = useState([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const pathname = usePathname();
  const isExplorer = pathname === "/" || ["/explorer", "/athletes", "/teams", "/organisations"].some((p) => pathname.startsWith(p));

  const events = useMemo(() => {
    if (filter === "all") return sampleFeed;
    return sampleFeed.filter((e) => e.type === filter);
  }, [filter]);

  // Load followed athletes
  useEffect(() => {
    (async () => {
      try {
        const items = await getFollowedAthletes();
        setAthletes(items);
      } catch (e) {
        setAthletes([]);
      } finally {
        setLoadingAthletes(false);
      }
    })();
  }, []);

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* Shared header */}
        <PageHeader user={user} />

        <div className="max-w-6xl mx-auto px-4 py-6 w-full">
          {/* Followed athletes grid */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Athlètes suivis</h2>
              {!loadingAthletes && (
                <span className="text-sm text-muted-foreground">{athletes.length}</span>
              )}
            </div>
            {loadingAthletes ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : athletes.length === 0 ? (
              <div className="text-sm text-muted-foreground">Vous ne suivez encore aucun athlète.</div>
            ) : (
              <div className="-mx-2 overflow-x-auto pb-2">
                <ul className="flex gap-4 px-2 snap-x snap-mandatory">
                  {athletes.map((a) => {
                    const images = Array.isArray(a.images) && a.images.length ? a.images : [a.image1, a.image2, a.image3].filter(Boolean);
                    return (
                      <li key={a.id} className="snap-start shrink-0 w-[220px]">
                        <Link href={a.profile_url || `#/athletes/${a.id}`}
                          className="relative flex flex-col items-center rounded-lg border border-gray-300 bg-white px-4 py-5 shadow-xs focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pink-600 hover:border-gray-400 dark:border-white/10 dark:bg-gray-800/50 dark:shadow-none dark:focus-within:outline-pink-500 dark:hover:border-white/25">
                          <span aria-hidden="true" className="absolute inset-0" />
                          <div className="relative">
                            {images?.[0] ? (
                              <img
                                alt=""
                                src={images[0]}
                                className="size-20 rounded-full bg-gray-300 outline -outline-offset-1 outline-black/5 dark:bg-gray-700 dark:outline-white/10"
                              />
                            ) : (
                              <div className="size-20 rounded-full bg-muted" />
                            )}
                            {a.recent_activity_count > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-pink-600 text-white text-[10px] font-semibold flex items-center justify-center shadow">
                                {a.recent_activity_count}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-1">{a.name}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-1">{a.category}</p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Actualités des athlètes suivis</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "default" : "ghost"}
                className={filter === f.key ? "bg-pink-600 hover:bg-pink-700" : ""}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Feed list */}
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-10 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 opacity-70 mx-auto mb-2" />
                <p>Aucune actualité pour ce filtre.</p>
              </div>
            ) : (
              events.map((item) => <FeedCard key={item.id} item={item} />)
            )}
          </div>
        </div>
      </SidebarInset>
      {/* Mobile sticky navigation/footer */}
      <footer
        className={"fixed bottom-5 left-2.5 right-2.5 w-auto max-w-[560px] mx-auto py-3 bg-background text-center border-t md:hidden px-7 rounded-full shadow-xl"}
      >
        {user ? (
          <div className="flex justify-between w-full">
            {/* Connecté: Explorer, Suivis, Collab, Messages, Profile */}
            <Link href="/" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${isExplorer ? 'text-pink-500' : 'opacity-70'}`}>
              <Search className="w-6 h-6" strokeWidth={isExplorer ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${isExplorer ? 'font-bold' : 'font-medium'}`}>Explorer</span>
            </Link>
            <Link href="/followed" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${pathname.startsWith('/followed') ? 'text-pink-500' : 'opacity-70'}`}>
              <Heart className="w-6 h-6" strokeWidth={pathname.startsWith('/followed') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/followed') ? 'font-bold' : 'font-medium'}`}>Suivis</span>
            </Link>
            <Link href="/collab" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${pathname.startsWith('/collab') ? 'text-pink-500' : 'opacity-70'}`}>
              <Handshake className="w-6 h-6" strokeWidth={pathname.startsWith('/collab') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/collab') ? 'font-bold' : 'font-medium'}`}>Collab</span>
            </Link>
            <Link href="/messages" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${pathname.startsWith('/messages') ? 'text-pink-500' : 'opacity-70'}`}>
              <MessageSquare className="w-6 h-6" strokeWidth={pathname.startsWith('/messages') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/messages') ? 'font-bold' : 'font-medium'}`}>Messages</span>
            </Link>
            <Link href="/settings" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${pathname.startsWith('/settings') ? 'text-pink-500' : 'opacity-70'}`}>
              <User className="w-6 h-6" strokeWidth={pathname.startsWith('/settings') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/settings') ? 'font-bold' : 'font-medium'}`}>Profile</span>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-6 w-full">
            {/* Déconnecté: Explorer, Suivis, Connexion */}
            <Link href="/explorer" className={`flex flex-col items-center gap-0.5 font-medium w-full max-w-[56px] ${isExplorer ? 'text-pink-500' : 'opacity-70'}`}>
              <Search className="w-6 h-6" strokeWidth={isExplorer ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${isExplorer ? 'font-bold' : 'font-medium'}`}>Explorer</span>
            </Link>
            <Link href="/followed" className={`flex flex-col items-center gap-0.5 font-medium w-full max-w-[56px] ${pathname.startsWith('/followed') ? 'text-pink-500' : 'opacity-70'}`}>
              <Heart className="w-6 h-6" strokeWidth={pathname.startsWith('/followed') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/followed') ? 'font-bold' : 'font-medium'}`}>Suivis</span>
            </Link>
            <Link href="/login" className={`flex flex-col items-center gap-0.5 font-medium w-full max-w-[56px] ${pathname.startsWith('/login') ? 'text-pink-500' : 'opacity-70'}`}>
              <User className="w-6 h-6" strokeWidth={pathname.startsWith('/login') ? 2.5 : 1.5} />
              <span className={`text-[0.625rem] ${pathname.startsWith('/login') ? 'font-bold' : 'font-medium'}`}>Connexion</span>
            </Link>
          </div>
        )}
      </footer>
    </SidebarProvider>
  );
}

function FeedCard({ item }) {
  return (
    <article className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow border border-transparent">
      <header className="flex items-start gap-3 mb-3">
        <Image
          src={item.athlete.avatar}
          alt={item.athlete.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold truncate">{item.athlete.name}</h3>
            <TypeBadge type={item.type} platform={item.platform} />
          </div>
          <div className="text-xs text-muted-foreground">{item.time}</div>
        </div>
      </header>

      {/* Body */}
      {item.type === "post" && <PostBody item={item} />}
      {item.type === "competition" && <CompetitionBody item={item} />}
      {item.type === "followers" && <FollowersBody item={item} />}
      {item.type === "trophy" && <TrophyBody item={item} />}
      {item.type === "photo" && <PhotoBody item={item} />}
    </article>
  );
}

function TypeBadge({ type, platform }) {
  const base = "text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1";
  if (type === "post") {
    const Icon = platform === "instagram" ? Instagram : platform === "facebook" ? Facebook : Youtube;
    const color = platform === "instagram" ? "text-pink-600" : platform === "facebook" ? "text-blue-600" : "text-red-600";
    return (
      <span className={`${base} bg-muted/40`}>
        <Icon className={`w-3 h-3 ${color}`} /> Post
      </span>
    );
  }
  if (type === "competition") {
    return (
      <span className={`${base} bg-muted/40`}>
        <Calendar className="w-3 h-3" /> Compétition
      </span>
    );
  }
  if (type === "followers") {
    return (
      <span className={`${base} bg-muted/40`}>
        <TrendingUp className="w-3 h-3 text-emerald-600" /> Croissance
      </span>
    );
  }
  if (type === "trophy") {
    return (
      <span className={`${base} bg-muted/40`}>
        <Trophy className="w-3 h-3 text-amber-600" /> Trophée
      </span>
    );
  }
  if (type === "photo") {
    return (
      <span className={`${base} bg-muted/40`}>
        <Camera className="w-3 h-3" /> Photo
      </span>
    );
  }
  return null;
}

function PostBody({ item }) {
  return (
    <div className="ml-13">
      {item.text && <p className="text-sm mb-3">{item.text}</p>}
      {item.images?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {item.images.map((src, i) => (
            <Image key={i} src={src} alt="post" width={300} height={200} className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      ) : null}
      <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
        <button className="flex items-center gap-1 hover:text-foreground"><Heart className="w-4 h-4" /> J'aime</button>
        <button className="flex items-center gap-1 hover:text-foreground"><MessageSquare className="w-4 h-4" /> Commenter</button>
      </div>
    </div>
  );
}

function CompetitionBody({ item }) {
  return (
    <div className="ml-13 text-sm">
      <div className="flex items-center gap-2"><Medal className="w-4 h-4" /> {item.title}</div>
      <div className="flex items-center gap-2 mt-1 text-muted-foreground"><MapPin className="w-4 h-4" /> {item.location}</div>
      <div className="mt-1 text-muted-foreground"><Calendar className="inline w-4 h-4 mr-1" /> {item.date}</div>
      {item.result && <div className="mt-2 font-medium">{item.result}</div>}
    </div>
  );
}

function FollowersBody({ item }) {
  const positive = (item.delta || 0) >= 0;
  return (
    <div className="ml-13 text-sm">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        Variation followers {item.platform}: {positive ? "+" : ""}{item.delta?.toLocaleString("fr-FR")}
      </div>
      {item.note && <div className="mt-1 text-muted-foreground">{item.note}</div>}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden max-w-xs">
        <div className={`h-full ${positive ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${Math.min(Math.abs(item.delta) / 300, 100)}%` }} />
      </div>
    </div>
  );
}

function TrophyBody({ item }) {
  return (
    <div className="ml-13 text-sm">
      <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-600" /> {item.award}</div>
      <div className="text-muted-foreground mt-1">{item.title}</div>
    </div>
  );
}

function PhotoBody({ item }) {
  return (
    <div className="ml-13 text-sm">
      {item.caption && <p className="mb-3">{item.caption}</p>}
      <div className="grid grid-cols-3 gap-2">
        {item.images?.map((src, i) => (
          <Image key={i} src={src} alt="photo" width={300} height={200} className="w-full h-28 object-cover rounded-lg" />
        ))}
      </div>
    </div>
  );
}
