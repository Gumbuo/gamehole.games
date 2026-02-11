import "./globals.css";
import "./alien-animations.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";
import MusicPlayer from "./components/MusicPlayer";
import dynamic from "next/dynamic";

const IframeAwareGlobals = dynamic(() => import("./components/IframeAwareGlobals"), { ssr: false });

export const metadata: Metadata = {
  title: "Game Hole - Web3 Gaming Platform",
  description: "Play amazing browser games including Alien Catacombs, Alien Arena, and more! Connect your wallet to earn rewards.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Game Hole - Web3 Gaming Platform",
    description: "Play amazing browser games including Alien Catacombs, Alien Arena, and more! Connect your wallet to earn rewards.",
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
    title: "Game Hole - Web3 Gaming Platform",
    description: "Play amazing browser games including Alien Catacombs, Alien Arena, and more! Connect your wallet to earn rewards.",
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
