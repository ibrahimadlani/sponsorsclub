"use client";

// Messages page: classic private messaging UI
// - Left column: conversations with unread notifications and empty state
// - Right column: chat thread with composer

import { useEffect, useMemo, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Paperclip,
  Smile,
  Heart,
  ThumbsUp,
  Send,
  Search,
  Handshake,
  User,
} from "lucide-react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import AuthContext from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const sampleConversations = [
  { id: 1, name: "Teddy Riner", avatar: "/images/teddy-1.jpg", lastMessage: "On se parle demain ?", unread: 2 },
  { id: 2, name: "Clarisse A.", avatar: "/images/clarisse-1.jpg", lastMessage: "Merci !", unread: 0 },
  { id: 3, name: "Victor W.", avatar: "/images/wemby-1.jpg", lastMessage: "Ok pour vendredi", unread: 1 },
  { id: 4, name: "Caroline G.", avatar: "/images/garcia-1.jpg", lastMessage: "A bientôt", unread: 0 },
];

const initialMessages = {
  1: [
    { id: 101, from: "them", text: "Salut !", time: "10:21" },
    { id: 102, from: "me", text: "Hello Teddy, dispo demain ?", time: "10:22" },
    { id: 103, from: "them", text: "Oui, parfait.", time: "10:24" },
  ],
  2: [
    { id: 201, from: "me", text: "Félicitations pour la victoire !", time: "09:05" },
    { id: 202, from: "them", text: "Merci !", time: "09:08" },
  ],
  3: [
    { id: 301, from: "them", text: "Ok pour vendredi", time: "11:12" },
  ],
  4: [],
};

export default function MessagesPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const isExplorer = pathname === "/" || ["/athletes", "/teams", "/organisations"].some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!user) {
      toast.error("Vous devez être connecté pour accéder à cette page.");
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, router, pathname]);

  const [conversations, setConversations] = useState(sampleConversations);
  const [selectedId, setSelectedId] = useState(sampleConversations[0]?.id ?? null);
  const [messagesByConv, setMessagesByConv] = useState(initialMessages);
  const [input, setInput] = useState("");

  useEffect(() => {
    // Mark selected conversation as read
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, unread: 0 } : c))
    );
  }, [selectedId]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const messages = messagesByConv[selectedId] || [];

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    const newMsg = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessagesByConv((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg],
    }));
    setInput("");
  };

  // Avoid rendering content briefly for non-authenticated users
  if (!user) return null;

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen flex flex-col">
        {/* App header */}
        <PageHeader user={user} />

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 py-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Conversations column */}
          <aside className="md:col-span-1">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-transparent p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Conversations</h2>
                <span className="text-xs text-muted-foreground">{conversations.length}</span>
              </div>

              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 opacity-70 mb-2" />
                  <p className="text-sm font-medium">Aucune conversation</p>
                  <p className="text-xs">Démarrez une nouvelle discussion.</p>
                </div>
              ) : (
                <ul className="divide-y divide-muted/40">
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full flex items-center gap-3 py-3 text-left hover:bg-muted/30 rounded-lg px-2 ${
                          selectedId === c.id ? "bg-muted/40" : ""
                        }`}
                      >
                        <div className="relative">
                          <Image
                            src={c.avatar}
                            alt={c.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                          {c.unread > 0 && (
                            <span className="absolute -right-1 -top-1 bg-pink-600 text-white text-[10px] rounded-full px-1.5 leading-4">
                              {c.unread}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <span className="text-[10px] text-muted-foreground">{c.unread > 0 ? "Nouveau" : ""}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{c.lastMessage}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat column */}
          <section className="md:col-span-2 flex flex-col h-[calc(100vh-220px)]">
            <div className="bg-white dark:bg-zinc-900 rounded-t-xl shadow p-4 border-b">
              {selectedConv ? (
                <div className="flex items-center gap-3">
                  <Image src={selectedConv.avatar} alt={selectedConv.name} width={36} height={36} className="rounded-full" />
                  <div>
                    <h3 className="text-sm font-semibold leading-4">{selectedConv.name}</h3>
                    <p className="text-xs text-muted-foreground">En ligne récemment</p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sélectionnez une conversation</div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow px-4 overflow-y-auto flex-1">
              {selectedConv ? (
                <div className="py-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <MessageSquare className="w-10 h-10 opacity-70 mb-2" />
                      <p className="text-sm font-medium">Démarrez la discussion</p>
                      <p className="text-xs">Écrivez votre premier message.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`${
                            m.from === "me"
                              ? "bg-pink-600 text-white"
                              : "bg-muted text-foreground"
                          } rounded-2xl px-3 py-2 max-w-[80%] text-sm`}
                        >
                          <p>{m.text}</p>
                          <div className={`text-[10px] mt-1 ${m.from === "me" ? "opacity-80" : "text-muted-foreground"}`}>
                            {m.time}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-b-xl shadow p-3 border-t">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="rounded-lg bg-white outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-pink-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-pink-500">
                    <textarea
                      rows={2}
                      placeholder="Écrire un message..."
                      className="block w-full resize-none bg-transparent px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button onClick={sendMessage} className="h-9">
                    <Send className="w-4 h-4 mr-1" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </SidebarInset>
      {/* Mobile sticky navigation/footer */}
      <footer
        className={"fixed bottom-5 left-2.5 right-2.5 w-auto max-w-[560px] mx-auto py-3 bg-background text-center border-t md:hidden px-7 rounded-full shadow-xl"}
      >
        {user ? (
          <div className="flex justify-between w-full">
            <Link href="/explorer" className={`flex flex-col items-center gap-0.5 font-medium antialiased w-full max-w-[56px] ${isExplorer ? 'text-pink-500' : 'opacity-70'}`}>
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
        ) : null}
      </footer>
    </SidebarProvider>
  );
}
