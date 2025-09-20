import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curax AI - Family Health Platform",
  description: "AI-powered family health platform with voice diagnosis, medical imaging, and comprehensive health monitoring",
  keywords: ["Curax AI", "Family Health", "AI Diagnosis", "Medical Imaging", "Healthcare Platform"],
  authors: [{ name: "Curax AI Team" }],
  openGraph: {
    title: "Curax AI - Family Health Platform",
    description: "AI-powered family health platform with comprehensive health monitoring and diagnosis",
    url: "https://curax-ai.com",
    siteName: "Curax AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curax AI - Family Health Platform",
    description: "AI-powered family health platform with comprehensive health monitoring and diagnosis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
