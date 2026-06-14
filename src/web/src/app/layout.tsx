import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "FinAdvisor — Personal CFO",
  description: "Your personal AI financial advisor for India",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinAdvisor",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased dark`}>
      <body className="app-canvas h-full text-gray-100">
        <Providers>
          <CommandPalette />
          <MobileNav />
          <div className="flex h-full">
            <Sidebar />
            {/* pt-14 on mobile to clear the fixed top bar; no pt on md+ */}
            <main className="flex-1 overflow-y-auto p-4 pt-18 md:pt-0 md:p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
