"use client";

import Link from "next/link";
import { Compass, MapPin, Menu, X, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-navbar w-full px-4 pt-3 pb-2 transition-all duration-300 pointer-events-none">
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 rounded-[24px] transition-all duration-300 pointer-events-auto border ${
          scrolled
            ? "bg-card/95 backdrop-blur-[24px] border-border shadow-glass-strong"
            : "bg-card/80 backdrop-blur-[16px] border-border shadow-glass"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-foreground transition hover:opacity-95 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary group-hover:scale-110 transition duration-300">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
          <span className="font-heading text-xl tracking-tight text-foreground font-extrabold">
            Vagabond<span className="text-primary">.AI</span>
          </span>
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground-secondary hover:text-primary transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Plan a Trip</span>
          </Link>
          
          <Link
            href="/trips"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground-secondary hover:text-primary transition-colors"
          >
            <FolderOpen className="h-3.5 w-3.5 text-primary" />
            <span>My Trips</span>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-card-hover focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl rounded-[24px] border border-border bg-card p-4 shadow-glass-strong pointer-events-auto animate-fade-in-up">
          <nav className="flex flex-col gap-3">
            <Link
              href="/plan"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-foreground hover:bg-card-hover"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="h-4 w-4 text-primary" />
              Plan a Trip
            </Link>
            <Link
              href="/trips"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-foreground hover:bg-card-hover"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FolderOpen className="h-4 w-4 text-primary" />
              My Saved Trips
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
