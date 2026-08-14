"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, MapPin, ChevronRight, Utensils, Globe, ShieldCheck } from "lucide-react";
import GlassBadge from "@/components/GlassBadge";
import TiltCard from "@/components/3d/TiltCard";
import ScrollJourney from "@/components/3d/ScrollJourney";
import InteractiveGlobe from "@/components/InteractiveGlobe"; // 100% Crash-free projected Canvas Globe

export default function LandingPage() {
  const router = useRouter();

  // Handle destination selection from globe
  const handleSelectDestination = (destinationName: string) => {
    router.push(`/plan?destination=${encodeURIComponent(destinationName)}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent text-foreground transition-colors duration-300">
      {/* Background Atmospheric Radial Gradient Blobs */}
      <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[550px] h-[550px] bg-primary/8 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-accent/60 rounded-full blur-[140px] pointer-events-none animate-pulse-subtle" style={{ animationDelay: "2s" }} />
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-card">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8 animate-fade-in-up">
              <GlassBadge icon={<Sparkles className="h-3.5 w-3.5" />} variant="primary">
                AI Travel Companion
              </GlassBadge>
              
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
                Your next adventure, <br className="hidden sm:inline" />
                <span className="text-primary">
                  curated by AI.
                </span>
              </h1>
              
              <p className="max-w-2xl text-base sm:text-lg md:text-xl text-foreground-secondary leading-relaxed font-sans font-medium">
                Skip hours of research. Experience a clean, friendly digital travel journal with custom day-by-day itineraries, real landmarks, dining spots, and maps.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-accent text-accent-foreground px-8 py-4 text-base font-extrabold shadow-lg shadow-accent/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  Start Planning Free
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/trips"
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-8 py-4 text-base font-bold text-foreground-secondary shadow-md hover:bg-card-hover hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  My Trips
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-border flex items-center gap-8 text-sm text-foreground-muted">
                <div>
                  <strong className="block font-heading text-3xl font-extrabold text-foreground">10k+</strong>
                  Trips Curated
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div>
                  <strong className="block font-heading text-3xl font-extrabold text-foreground">99.8%</strong>
                  Coordinate Accuracy
                </div>
              </div>
            </div>

            {/* Right Hero Preview Card & Globe */}
            <div className="lg:col-span-5 flex flex-col items-center gap-8 relative animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <TiltCard className="w-full max-w-[420px] sm:max-w-none">
                <div className="relative rounded-[32px] border border-border bg-card p-6 sm:p-8 hover:border-primary/45 transition-all duration-300 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500/90 animate-pulse"></span>
                      <span className="h-3 w-3 rounded-full bg-amber-500/90"></span>
                      <span className="h-3 w-3 rounded-full bg-emerald-500/90"></span>
                    </div>
                    <GlassBadge variant="primary" icon={<Globe className="h-3 w-3" />}>
                      Interactive Preview
                    </GlassBadge>
                  </div>
                  
                  {/* Simulated Itinerary Card */}
                  <div className="space-y-4 text-left">
                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-muted group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80" 
                        alt="Kyoto Pagoda"
                        className="h-full w-full object-cover transition-transform duration-75 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 drop-shadow-sm">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> Kyoto, Japan
                      </span>
                    </div>

                    <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5">
                      <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">Day 1 Theme: Cultural Marvels</span>
                      <h3 className="font-heading font-extrabold text-foreground text-sm mt-1">Explore Gion Town & Bamboo Groves</h3>
                    </div>

                    <div className="border-l-2 border-primary/40 pl-4 ml-2 space-y-4">
                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card"></span>
                        <span className="text-[10px] text-primary font-bold block">09:30 AM</span>
                        <strong className="text-xs text-foreground block font-heading">Kinkaku-ji Golden Pavilion</strong>
                        <p className="text-[11px] text-foreground-muted line-clamp-1">Marvel at the iconic Zen temple surrounded by reflective ponds.</p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-card"></span>
                        <span className="text-[10px] text-accent font-bold block">12:30 PM (Lunch)</span>
                        <strong className="text-xs text-foreground block font-heading">Gion Ramen House</strong>
                        <p className="text-[11px] text-foreground-muted line-clamp-1">Savor authentic chicken paitan broth in traditional townhouse.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Interactive Dotted Projected Globe (60fps, No WebGL required) */}
              <div className="flex flex-col items-center mt-4">
                <InteractiveGlobe onSelectDestination={handleSelectDestination} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 border-t border-border bg-background-secondary/80 backdrop-blur-md z-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <GlassBadge icon={<ShieldCheck className="h-3.5 w-3.5" />} variant="secondary" className="mb-4">
              Morphic Features
            </GlassBadge>
            <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-5xl tracking-tight">
              Engineered for Seamless Exploration
            </h2>
            <p className="mt-4 text-foreground-secondary text-base sm:text-lg font-sans font-medium">
              We compile your travel dates, budget parameters, and party preferences into a digital travel journal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <TiltCard maxTilt={5}>
              <div 
                className="rounded-[28px] border border-border bg-card p-8 text-left hover:shadow-glass-strong hover:border-primary/40 transition-all duration-300 animate-fade-in-up group h-full"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary mb-6 group-hover:scale-110 transition duration-300">
                  <Compass className="h-6 w-6 animate-spin-slow" />
                </div>
                <h3 className="font-heading text-xl font-extrabold text-foreground">Destinations Worldwide</h3>
                <p className="mt-3 text-sm text-foreground-secondary leading-relaxed">
                  Powered by Google Places API. Simply type any global city, town, or region to start your customized morphic itinerary.
                </p>
              </div>
            </TiltCard>

            {/* Feature 2 */}
            <TiltCard maxTilt={5}>
              <div 
                className="rounded-[28px] border border-border bg-card p-8 text-left hover:shadow-glass-strong hover:border-primary/40 transition-all duration-300 animate-fade-in-up group h-full"
                style={{ animationDelay: "200ms", animationFillMode: "both" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 border border-accent/40 text-accent mb-6 group-hover:scale-110 transition duration-300">
                  <Utensils className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-extrabold text-foreground">Curated Local Dining</h3>
                <p className="mt-3 text-sm text-foreground-secondary leading-relaxed">
                  Forget tourist traps. Get AI dining suggestions optimized for breakfast, lunch, and dinner matching your exact budget level.
                </p>
              </div>
            </TiltCard>

            {/* Feature 3 */}
            <TiltCard maxTilt={5}>
              <div 
                className="rounded-[28px] border border-border bg-card p-8 text-left hover:shadow-glass-strong hover:border-primary/40 transition-all duration-300 animate-fade-in-up group h-full"
                style={{ animationDelay: "300ms", animationFillMode: "both" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 text-primary mb-6 group-hover:scale-110 transition duration-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl font-extrabold text-foreground">Interactive Routing</h3>
                <p className="mt-3 text-sm text-foreground-secondary leading-relaxed">
                  Visualized on Leaflet & Google Maps. Coordinates are generated by AI so you can click to see route paths and open directions.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Scroll-Linked Narrative Storytelling */}
      <section className="relative py-12 border-t border-border bg-transparent z-card">
        <ScrollJourney />
      </section>

      {/* CTA Section */}
      <section className="relative py-24 text-center overflow-hidden border-t border-border z-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-card space-y-8 animate-fade-in-up">
          <h2 className="font-heading text-4xl font-extrabold text-foreground sm:text-6xl tracking-tight">
            Ready to Plan Your Next Escape?
          </h2>
          <p className="text-foreground-secondary max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Join thousands of travelers who use Vagabond AI to build itineraries and simplify their journeys.
          </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-accent text-accent-foreground px-9 py-4.5 text-base font-extrabold shadow-xl shadow-accent/25 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started for Free
              <ChevronRight className="h-5 w-5" />
            </Link>
        </div>
      </section>
    </div>
  );
}
