import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BBVA Talent — Knowledge Graph",
  description: "Descubre el talento oculto usando grafos de conocimiento e IA Generativa.",
};

/**
 * Anti-FOUC theme script — runs synchronously in <head> before first paint.
 * Reads the user's saved preference from localStorage and applies the
 * data-theme attribute to <html> immediately. Prevents the brief flash
 * of dark theme before React hydrates and the toggle takes over.
 */
const themeBootScript = `
(function() {
  try {
    var t = localStorage.getItem('bbva-talent:theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${spaceMono.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">Saltar al contenido</a>
        <ErrorBoundary>
          <div id="main-content">{children}</div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
