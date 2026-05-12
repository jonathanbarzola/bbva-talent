import type { Metadata } from "next";
import { Syne, Space_Mono } from "next/font/google";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${syne.variable} ${spaceMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Anti-FOUC theme boot — applies the saved theme before first paint.
            Lives as a real file in public/ (not inline) so React 19 doesn't
            warn about <script> tags inside components. */}
        <Script src="/theme-boot.js" strategy="beforeInteractive" />
        <a href="#main-content" className="skip-to-content">Saltar al contenido</a>
        <ErrorBoundary>
          <div id="main-content">{children}</div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
