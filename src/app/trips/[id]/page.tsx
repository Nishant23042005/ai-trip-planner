"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TripDetailsContainer from "@/components/TripDetailsContainer";
import { Compass } from "lucide-react";

interface TripPageProps {
  params: {
    id: string;
  };
}

interface LocalTrip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelParty: string;
  interests: string[] | string;
  itinerary: unknown;
}

export default function TripDetailPage({ params }: TripPageProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<LocalTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const localData = localStorage.getItem("vagabond_trips");
      if (localData) {
        const trips: LocalTrip[] = JSON.parse(localData);
        const matched = trips.find((t) => t.id === params.id);
        if (matched) {
          setTrip(matched);
        } else {
          console.warn(`Trip with ID ${params.id} not found locally.`);
        }
      }
    } catch (err) {
      console.error("Failed to parse local trips:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Compass className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-foreground-secondary">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">Trip Not Found</h2>
        <p className="text-sm text-foreground-secondary mb-8">
          We couldn&apos;t find this trip on your device. It might have been deleted, or generated in a different browser.
        </p>
        <button
          onClick={() => router.push("/plan")}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-extrabold shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-200"
        >
          Plan a New Trip
        </button>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen relative overflow-hidden">
      <div className="relative z-card">
        <TripDetailsContainer trip={trip} />
      </div>
    </div>
  );
}
