"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Compass, Plus, Sparkles, AlertCircle } from "lucide-react";
import DashboardTripCard from "@/components/DashboardTripCard";
import GlassBadge from "@/components/GlassBadge";

interface LocalTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelParty: string;
  interests: string[] | string;
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<LocalTrip[]>([]);
  const [loading, setLoading] = useState(true);

  // Load trips from localStorage on client mount
  useEffect(() => {
    try {
      const localData = localStorage.getItem("vagabond_trips");
      if (localData) {
        setTrips(JSON.parse(localData));
      }
    } catch (err) {
      console.error("Failed to load local trips:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteTrip = (tripId: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-foreground-secondary">Loading your local itineraries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-card animate-fade-in">
      {/* Local storage advisory badge */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-800 dark:text-amber-300 font-extrabold mb-6 animate-fade-in-up">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>
          Advisory: Your trips are stored locally in this browser. Clearing your browser data will delete them.
        </span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6 mb-10">
        <div>
          <GlassBadge icon={<Compass className="h-3.5 w-3.5" />} variant="primary" className="mb-2">
            Morphic Travel Collection
          </GlassBadge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            My Saved Adventures
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary font-medium">
            Manage your AI-generated travel plans and launch new adventures.
          </p>
        </div>
        
        <Link
          href="/plan"
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-extrabold shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          Plan New Trip
        </Link>
      </div>

      {/* Trips Display Grid */}
      {trips.length === 0 ? (
        <div className="text-center rounded-[32px] border border-dashed border-border bg-card p-12 shadow-glass animate-scale-in relative overflow-hidden">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 border border-primary/30 text-primary mb-4">
            <Compass className="h-8 w-8 animate-spin-slow" />
          </div>
          <h3 className="mt-4 text-xl font-extrabold font-heading text-foreground">No trips planned yet</h3>
          <p className="mt-2 text-sm text-foreground-secondary max-w-sm mx-auto font-medium">
            Ready to explore? Create your first AI-generated day-by-day travel itinerary with maps and dining details.
          </p>
          <div className="mt-8">
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent text-accent-foreground px-7 py-4 text-sm font-extrabold shadow-lg shadow-accent/20 hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-4.5 w-4.5" />
              Plan Your First Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <DashboardTripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      )}
    </div>
  );
}
