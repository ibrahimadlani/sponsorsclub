import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Importation de la police Mona Sans en local (variable font)
// Les fichiers utilisés ici sont ceux issus du téléchargement de Mona Sans Variable Font.
// Vous pouvez adapter les chemins selon l'emplacement de vos fichiers dans le dossier public.
const monaSans = localFont({
  src: [
    {
      path: "/fonts/MonaSans-VariableFont_wdth,wght.ttf",
      // La version "normal" de la police variable
      style: "normal",
    },
    {
      path: "/fonts/MonaSans-Italic-VariableFont_wdth,wght.ttf",
      // La version "italic" de la police variable
      style: "italic",
    },
  ],
  variable: "--font-mona-sans",
});

export const metadata = {
  title: "SponsorsClub",
  description: "SponsorsClub is a platform for connecting sponsors with creators.",
  icons: {
    icon: "/../favicon/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${monaSans.variable} antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            {/* <Toaster /> */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}