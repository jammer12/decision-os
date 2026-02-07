import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { AuthUI } from "@/components/auth-ui";
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
  title: "Decision OS — Your operating system for better decisions",
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
            <nav className="flex items-center gap-6">
              <Link
                href="/decisions"
                className="text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Decisions
              </Link>
              <Link
                href="/decisions/new"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] transition-opacity hover:opacity-90"
              >
                New decision
              </Link>
              <AuthUI />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
