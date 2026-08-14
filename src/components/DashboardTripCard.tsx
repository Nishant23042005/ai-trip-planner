"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, DollarSign, Loader2, Trash2, Users } from "lucide-react";
import { getDestinationImage } from "@/lib/images";
import TiltCard from "./3d/TiltCard";

interface TripCardProps {
  trip: {
    id: string;
    destination: string;
    startDate: Date | string;
    endDate: Date | string;
    budget: string;
    travelParty: string;
    interests: string[] | string;
  };
  onDelete?: (id: string) => void;
}

export default function DashboardTripCard({ trip, onDelete }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const interestsArray = Array.isArray(trip.interests)
    ? trip.interests
    : (typeof trip.interests === "string" && trip.interests
        ? trip.interests.split(",")
        : []);

  const imageSrc = getDestinationImage(trip.destination);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete your trip to ${trip.destination}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const existingTrips = JSON.parse(localStorage.getItem("vagabond_trips") || "[]") as { id: string }[];
      const updatedTrips = existingTrips.filter((t) => t.id !== trip.id);
      localStorage.setItem("vagabond_trips", JSON.stringify(updatedTrips));

      // Instant state-based fade-out UI
      setIsDeleted(true);
      if (onDelete) {
        onDelete(trip.id);
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Error deleting trip. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateVal: Date | string) => {
    return new Date(dateVal).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPartyLabel = (party: string) => {
    const labels: Record<string, string> = {
      solo: "Solo",
      couple: "Couple",
      family: "Family",
      friends: "Friends",
    };
    return labels[party] || party;
  };

  const getDaysCount = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  // If deleted, hide immediately from client DOM
  if (isDeleted) return null;

  return (
    <div className="relative group/card-wrapper w-full h-full">
      {/* 3D Tilting Card container (handles Link navigation) */}
      <TiltCard maxTilt={5}>
        <Link
          href={`/trips/${trip.id}`}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-card shadow-md hover:shadow-xl hover:border-primary/40 hover:bg-card-hover transition-all duration-300 overflow-hidden relative h-full"
        >
          <div>
            {/* Cover Photo */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={trip.destination}
                className="h-full w-full object-cover transition-transform duration-75 group-hover:scale-105"
              />
              {/* High-contrast image overlay for title readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
              
              <div className="absolute bottom-4 left-5 text-white right-14 z-card">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-white/90 border border-border px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {getDaysCount()} Day Escape
                </span>
                <h3 className="font-heading font-extrabold text-2xl leading-tight truncate drop-shadow-md text-white">
                  {trip.destination.split(",")[0]}
                </h3>
              </div>
            </div>

            {/* Card Body Metas */}
            <div className="p-6 space-y-4 relative z-card">
              <div className="grid grid-cols-2 gap-3 text-xs text-foreground-secondary font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{formatDate(trip.startDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{getPartyLabel(trip.travelParty)}</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>
                    Budget: <strong className="text-foreground">{trip.budget}</strong> ({trip.budget === "$" ? "Economy" : trip.budget === "$$" ? "Mid-range" : "Luxury"})
                  </span>
                </div>
              </div>

              {interestsArray.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {interestsArray.slice(0, 3).map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-background border border-border px-3 py-1 text-[10px] font-bold text-foreground-secondary capitalize"
                    >
                      {interest}
                    </span>
                  ))}
                  {interestsArray.length > 3 && (
                    <span className="inline-block rounded-full bg-background border border-border px-2.5 py-1 text-[10px] font-bold text-foreground-muted">
                      +{interestsArray.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 pt-0 relative z-card">
            <div className="inline-flex w-full items-center justify-center rounded-2xl border border-primary/40 bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent px-4 py-3 text-xs font-extrabold text-primary transition-all duration-300 shadow-sm">
              Continue Planning &rarr;
            </div>
          </div>
        </Link>
      </TiltCard>

      {/* Delete Button (Rendered OUTSIDE Link and TiltCard to prevent event interception & 3D plane clipping) */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-3.5 right-3.5 bg-white/95 text-foreground-secondary hover:text-rose-500 disabled:opacity-50 p-2.5 rounded-xl transition duration-200 shadow-md border border-border z-toast"
        title="Delete Trip"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
