import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import "./styles/globals.css";

/**
 * Load the Mona Sans font from local files.
 *
 * This variable font includes both the normal and italic styles.
 * Adjust the file paths if needed according to the public folder structure.
 */
const monaSans = localFont({
  src: [
    {
      path: "/fonts/MonaSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "/fonts/MonaSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-mona-sans",
});

/**
 * Application metadata for SEO and favicon configuration.
 */
export const metadata = {
  title: "SponsorsClub",
  description:
    "SponsorsClub is a platform for connecting sponsors with creators.",
  icons: {
    icon: "/../favicon/favicon.ico",
  },
};

/**
 * RootLayout Component
 *
 * This is the main layout component for the application.
 * It wraps the entire application with authentication and theming providers.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to be rendered.
 * @returns {JSX.Element} The rendered root layout.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${monaSans.variable} antialiased`}>
        {/* AuthProvider makes authentication context available throughout the app */}
        <AuthProvider>
          {/* ThemeProvider manages the application's theme (light/dark/system) */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}