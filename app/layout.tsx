import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quantum at Lehigh",
  description: "Quantum at Lehigh. Coming soon. Play with a qubit while you wait.",
};

export const viewport: Viewport = {
  themeColor: "#c5dbf2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
      <Analytics/>
    </html>
  );
}
