import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import FullPageTravelBackground from "@/components/3d/background/FullPageTravelBackground";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vagabond AI - Friendly Travel Assistant",
  description: "Generate custom, day-by-day itineraries using AI with interactive controls, real landmarks, and dining recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 relative overflow-x-hidden selection:bg-primary/30 selection:text-primary`}
      >
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col w-full">
            {/* Site-Wide Global Multilayer Travel Background */}
            <FullPageTravelBackground intensity={1.0} />

            <Navbar />
            <main className="flex-grow relative z-10">
              {children}
            </main>
            <footer className="border-t border-border bg-card/85 backdrop-blur-md py-8 text-center text-xs text-foreground-muted relative z-10 mt-auto">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-foreground">Vagabond AI</span>
                  <span className="text-foreground-muted">• Premium Travel Planner</span>
                </div>
                <div className="text-xs text-foreground-muted">
                  Note: Trips are stored locally on your device. Clearing browser data will delete them.
                </div>
                <div>
                  &copy; {new Date().getFullYear()} Vagabond AI. Created with Antigravity. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
