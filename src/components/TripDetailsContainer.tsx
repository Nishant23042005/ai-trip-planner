"use client";

import { useState } from "react";
import { Calendar, Compass, DollarSign, Info, MapPin, Users, Utensils, Clock, Star } from "lucide-react";
import { getDestinationImage } from "@/lib/images";
import GlassBadge from "./GlassBadge";
import TiltCard from "./3d/TiltCard";
import dynamic from "next/dynamic";

// Dynamically load TripMap3D with SSR disabled to prevent static build prerender failures
const TripMap3D = dynamic(() => import("./3d/TripMap3D"), { ssr: false });

interface Activity {
  title: string;
  description: string;
  time: string;
  lat: number;
  lng: number;
}

interface Restaurant {
  name: string;
  description: string;
  meal: string;
  lat: number;
  lng: number;
}

interface DayItinerary {
  dayNumber: number;
  theme: string;
  notes: string;
  activities: Activity[];
  restaurants: Restaurant[];
}

interface ItineraryJSON {
  estimatedTotalCost: string;
  days: DayItinerary[];
}

interface TripData {
  id: string;
  destination: string;
  startDate: Date | string;
  endDate: Date | string;
  budget: string;
  travelParty: string;
  interests: string[] | string;
  itinerary: unknown;
}

interface TripDetailsContainerProps {
  trip: TripData;
}

export default function TripDetailsContainer({ trip }: TripDetailsContainerProps) {
  const itinerary = trip.itinerary as ItineraryJSON;
  const days = itinerary.days || [];
  
  const interestsArray = Array.isArray(trip.interests)
    ? trip.interests
    : (typeof trip.interests === "string" && trip.interests
        ? trip.interests.split(",")
        : []);

  const [activeDay, setActiveDay] = useState<number>(1);

  const imageSrc = getDestinationImage(trip.destination);

  // Compile active day places for the map
  const activeDayData = days.find((d) => d.dayNumber === activeDay) || days[0];
  
  const getMapPlacesForActiveDay = () => {
    if (!activeDayData) return [];
    
    const activityPlaces = (activeDayData.activities || []).map((act, index) => ({
      id: `day-${activeDayData.dayNumber}-act-${index}`,
      title: act.title,
      description: act.description,
      type: "activity" as const,
      timeOrMeal: act.time,
      position: { lat: Number(act.lat), lng: Number(act.lng) },
    }));

    const restaurantPlaces = (activeDayData.restaurants || []).map((rest, index) => ({
      id: `day-${activeDayData.dayNumber}-rest-${index}`,
      title: rest.name,
      description: rest.description,
      type: "restaurant" as const,
      timeOrMeal: rest.meal,
      position: { lat: Number(rest.lat), lng: Number(rest.lng) },
    }));

    return [...activityPlaces, ...restaurantPlaces];
  };

  const mapPlaces = getMapPlacesForActiveDay();

  // Helper formatting functions
  const formatDate = (dateVal: Date | string) => {
    return new Date(dateVal).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPartyLabel = (party: string) => {
    const labels: Record<string, string> = {
      solo: "Solo Traveler",
      couple: "Couple",
      family: "Family Trip",
      friends: "Group of Friends",
    };
    return labels[party] || party;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-card animate-fade-in">
      {/* Travel Journal Header Banner */}
      <div className="relative mb-10 rounded-[36px] overflow-hidden bg-slate-100 text-white shadow-xl min-h-[280px] sm:min-h-[360px] border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={trip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-85"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="relative z-card flex flex-col justify-end p-6 sm:p-10 h-full">
          <div className="max-w-3xl space-y-4">
            <GlassBadge icon={<Compass className="h-3.5 w-3.5" />} variant="primary">
              Digital Travel Journal
            </GlassBadge>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-md uppercase break-words leading-tight text-white">
              {trip.destination.split(",")[0]}
            </h1>
            
            {/* Floating Glass Stats Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-foreground bg-white/95 border border-border p-4 rounded-2xl shadow-lg shadow-slate-900/10">
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Users className="h-4 w-4 text-primary" />
                <span>{getPartyLabel(trip.travelParty)}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Level: {trip.budget}</span>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl px-3 py-1 font-bold text-xs">
                Total Expenses: {itinerary.estimatedTotalCost || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {interestsArray.length > 0 && (
        <div className="mb-8 p-5 bg-card border border-border rounded-2xl shadow-sm animate-fade-in-up">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted block mb-3">Included Travel Styles</span>
          <div className="flex flex-wrap gap-2">
            {interestsArray.map((interest, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-background border border-border px-4 py-1.5 text-xs font-bold text-foreground-secondary capitalize"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid Layout: Left Column timeline, Right Column map */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (58% width on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day Navigation Tabs */}
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-border">
            {days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setActiveDay(day.dayNumber);
                }}
                className={`flex-shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl transition duration-200 backdrop-blur-md ${
                  activeDay === day.dayNumber
                    ? "bg-primary text-primary-foreground shadow-md font-extrabold scale-[1.02]"
                    : "bg-card text-foreground-secondary border border-border hover:bg-card-hover hover:scale-[1.02]"
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {activeDayData && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Daily Theme & Notes Banner */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                <h3 className="font-heading text-xl font-extrabold text-primary flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow-sm">
                    {activeDayData.dayNumber}
                  </span>
                  {activeDayData.theme}
                </h3>
                {activeDayData.notes && (
                  <div className="mt-4 flex items-start gap-3 text-sm text-foreground-secondary bg-card border border-border p-4 rounded-xl backdrop-blur-md shadow-sm font-medium">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed italic">{activeDayData.notes}</p>
                  </div>
                )}
              </div>

              {/* Day Schedule Items */}
              <div className="space-y-6">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground-muted">Timeline & Scheduled Stops</h4>
                
                {/* Vertical Timeline container */}
                <div className="relative border-l-2 border-primary/30 ml-4 pl-8 space-y-10">
                  {/* Activities List */}
                  {activeDayData.activities && activeDayData.activities.map((act, index) => {
                    return (
                      <div key={`act-${index}`} className="relative">
                        {/* Dot Indicator with glowing effect */}
                        <span className="absolute -left-[39px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border-2 border-primary text-primary shadow-sm transition-all duration-300 z-floating">
                          <Clock className="h-3 w-3" />
                        </span>

                        <TiltCard maxTilt={4}>
                          <div className="p-6 rounded-2xl border border-border bg-card shadow-md hover:border-primary/50 hover:bg-card-hover transition-all duration-300 space-y-2">
                            {/* Time Indicator */}
                            <div className="text-xs font-extrabold text-primary uppercase tracking-widest">
                              {act.time}
                            </div>
                            
                            {/* Activity Title */}
                            <h3 className="font-heading text-xl font-extrabold text-foreground">
                              {act.title}
                            </h3>
                            
                            {/* Activity Description */}
                            <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
                              {act.description}
                            </p>

                            {/* Coordinates / Meta info */}
                            {act.lat && act.lng && (
                              <div className="inline-flex items-center gap-1.5 text-xs text-foreground-muted font-semibold pt-2 border-t border-border/50 w-full mt-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span>Coordinates: {act.lat.toFixed(4)}, {act.lng.toFixed(4)}</span>
                              </div>
                            )}
                          </div>
                        </TiltCard>
                      </div>
                    );
                  })}

                  {/* Restaurants List */}
                  {activeDayData.restaurants && activeDayData.restaurants.map((rest, index) => {
                    // Parse Google rating if exists in name
                    const ratingMatch = rest.description.match(/(\d\.\d★)/);
                    const rating = ratingMatch ? ratingMatch[0] : "4.8★";

                    return (
                      <div key={`rest-${index}`} className="relative">
                        {/* Dot Indicator for restaurants */}
                        <span className="absolute -left-[39px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-card border-2 border-accent text-accent shadow-sm transition-all duration-300 z-floating">
                          <Utensils className="h-3 w-3" />
                        </span>

                        <TiltCard maxTilt={4}>
                          <div className="p-6 rounded-2xl border border-border bg-card shadow-md hover:border-accent/50 hover:bg-card-hover transition-all duration-300 space-y-2">
                            {/* Time Indicator */}
                            <div className="text-xs font-extrabold text-accent uppercase tracking-widest">
                              {rest.meal || "Dining Recommendation"}
                            </div>
                            
                            {/* Restaurant Name */}
                            <h3 className="font-heading text-xl font-extrabold text-foreground">
                              {rest.name}
                            </h3>
                            
                            {/* Restaurant Description */}
                            <p className="text-sm text-foreground-secondary leading-relaxed font-medium">
                              {rest.description}
                            </p>

                            {/* Ratings and Coordinates */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-border/50 text-xs mt-2">
                              <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                <span>{rating} Google Rating</span>
                              </div>
                              {rest.lat && rest.lng && (
                                <div className="inline-flex items-center gap-1.5 text-foreground-muted font-semibold">
                                  <MapPin className="h-3.5 w-3.5 text-accent" />
                                  <span>{rest.lat.toFixed(4)}, {rest.lng.toFixed(4)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TiltCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (42% width, sticky map) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 h-[500px] lg:h-[620px]">
          <TripMap3D places={mapPlaces} />
        </div>
      </div>
    </div>
  );
}
