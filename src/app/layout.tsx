import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nerdy Executive - Decision OS — Experience better decisions",
  description:
    "Capture, frame, and reflect on your decisions. Think clearly. Choose confidently.",
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0c0a09]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2 sm:px-6">
            <Link
              href="/"
              className="flex items-center"
              aria-label="Decision OS home"
            >
              <Image
                src="/Nerdy logo_white.svg"
                alt=""
                width={160}
                height={48}
                className="h-[95px] w-auto"
                priority
              />
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
