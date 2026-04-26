import type { Metadata } from "next";
import { Roboto_Flex } from "next/font/google";

import "./globals.css";
import PrivvyProviderWrapper from "@/lib/providers/privyProvider";
import SolanaProviderWrapper from "@/lib/providers/solana-adapter-provider";
import { Toaster } from "react-hot-toast";

const font = Roboto_Flex({
  style: "normal",
  weight: [
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solwill.vercel.app"), // replace with your real domain

  title: {
    default: "SolWill — Trustless Crypto Inheritance on Solana",
    template: "%s | SolWill",
  },

  description:
    "Create an on-chain crypto will on Solana. Automatically transfer SOL, SPL tokens, and NFTs to your heirs through a fully trustless smart contract.",

  keywords: [
    "SolWill",
    "Crypto Inheritance",
    "Solana",
    "On-chain Will",
    "Web3 Estate Planning",
    "SPL Tokens",
    "NFT Inheritance",
    "Trustless Protocol",
    "Anchor",
    "Solana Wallet",
    "Crypto Will",
    "DeFi",
  ],

  authors: [{ name: "SolWill" }],
  creator: "SolWill",
  publisher: "SolWill",
  applicationName: "SolWill",
  category: "technology",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "https://solwill.xyz",
    siteName: "SolWill",
    title: "SolWill — Your Crypto, Protected Forever",
    description:
      "The first trustless crypto inheritance protocol on Solana. Securely pass SOL, tokens, and NFTs to your heirs with code, not trust.",
    images: [
      {
        url: "/og-image.png", // put inside /public
        width: 1200,
        height: 630,
        alt: "SolWill - Trustless Crypto Inheritance on Solana",
      },
    ],
    locale: "en_US",
  },

  twitter: {
    card: "summary_large_image",
    title: "SolWill — Your Crypto, Protected Forever",
    description:
      "Create a trustless on-chain will for your SOL, SPL tokens, and NFTs. Built on Solana.",
    images: ["/og-image.png"],
    creator: "@solwill",
    site: "@solwill",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  other: {
    "theme-color": "#0a0a0a",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${font.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PrivvyProviderWrapper>
          <SolanaProviderWrapper>
            {children}
            <Toaster position="top-right" />
          </SolanaProviderWrapper>
        </PrivvyProviderWrapper>
      </body>
    </html>
  );
}