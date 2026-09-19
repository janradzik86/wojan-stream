import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { CatalogBoot } from "@/components/CatalogBoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wojan / Czarne Wilki Prawdy",
  description:
    "Muzyka z ognia i ziemi. Folk, bunt, prawda bez filtrów. Live + tracki społeczności.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-transparent text-zinc-100">
        <div className="site-bg" aria-hidden="true">
          <div className="site-bg__base" />
          <div className="site-bg__cover" />
          <div className="site-bg__wolf" />
          <div className="site-bg__overlay" />
          <div className="site-bg__grain" />
        </div>
        <CatalogBoot />
        <Nav />
        {children}
      </body>
    </html>
  );
}
