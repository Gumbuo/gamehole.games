import "./globals.css";
import "./alien-animations.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";
import MusicPlayer from "./components/MusicPlayer";
import dynamic from "next/dynamic";

const IframeAwareGlobals = dynamic(() => import("./components/IframeAwareGlobals"), { ssr: false });

export const metadata: Metadata = {
  title: "Game Hole - Free Browser Games",
  description: "Play free browser games — Alien AF, Alien Arena, and more. Jump in and play instantly, no sign-up required.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Game Hole - Free Browser Games",
    description: "Play free browser games — Alien AF, Alien Arena, and more. Jump in and play instantly, no sign-up required.",
    url: "https://www.gamehole.games",
    siteName: "Game Hole",
    images: [
      {
        url: "https://www.gamehole.games/logo.png",
        width: 1024,
        height: 1536,
        alt: "Game Hole Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Hole - Free Browser Games",
    description: "Play free browser games — Alien AF, Alien Arena, and more. Jump in and play instantly, no sign-up required.",
    images: ["https://www.gamehole.games/logo.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Audiowide&family=Share+Tech+Mono&family=Iceland&family=Electrolize&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-black">
        <Providers>
          <IframeAwareGlobals />
          {children}
          <MusicPlayer />
        </Providers>
      </body>
    </html>
  );
}
