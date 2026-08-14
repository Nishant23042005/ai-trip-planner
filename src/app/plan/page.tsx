"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DestinationInput from "@/components/DestinationInput";
import { Calendar, CircleDollarSign, Compass, AlertCircle, Loader2, Sparkles, Tent, Users, Globe } from "lucide-react";
import GlassBadge from "@/components/GlassBadge";

const INTEREST_OPTIONS = [
  { id: "food", name: "Food & Dining", icon: "🍳" },
  { id: "history", name: "History & Culture", icon: "🏛️" },
  { id: "nature", name: "Nature & Outdoors", icon: "⛰️" },
  { id: "nightlife", name: "Nightlife & Bars", icon: "🍸" },
  { id: "shopping", name: "Shopping", icon: "🛍️" },
  { id: "adventure", name: "Adventure & Sports", icon: "🪂" },
];

const BUDGET_OPTIONS = [
  { id: "$", name: "Economy", desc: "Budget-friendly options" },
  { id: "$$", name: "Mid-Range", desc: "Balanced comfort & cost" },
  { id: "$$$", name: "Luxury", desc: "Premium stays & fine dining" },
];

const PARTY_OPTIONS = [
  { id: "solo", name: "Solo Traveler", icon: "👤" },
  { id: "couple", name: "Couple", icon: "👥" },
  { id: "family", name: "Family Trip", icon: "👨‍👩‍👧‍👦" },
  { id: "friends", name: "Group of Friends", icon: "🥳" },
];

const LOADING_STEPS = [
  "Discovering destinations...",
  "Finding hidden gems...",
  "Building your itinerary...",
  "Optimizing your route...",
  "Finalizing your adventure...",
];

function PlanTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form states
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("$$");
  const [travelParty, setTravelParty] = useState("couple");
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Set destination automatically if passed from InteractiveGlobe
  useEffect(() => {
    const destParam = searchParams.get("destination");
    if (destParam) {
      setDestination(destParam);
    }
  }, [searchParams]);

  // Interest selection toggler
  const handleToggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setInterests(interests.filter((i) => i !== interestId));
    } else {
      setInterests([...interests, interestId]);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination.trim() || !startDate || !endDate) {
      setError("Please fill out all required fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setError("End date must be after start date.");
      return;
    }

    setLoading(true);
    setError(null);

    // Dynamic loading text effect
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    try {
      const response = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          budget,
          travelParty,
          interests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate trip");
      }

      const data = await response.json();
      clearInterval(interval);

      // Generate a unique client-side ID
      const uniqueId = "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      
      const newTrip = {
        id: uniqueId,
        destination,
        startDate,
        endDate,
        budget,
        travelParty,
        interests,
        itinerary: typeof data.itinerary === "string" ? JSON.parse(data.itinerary) : data.itinerary,
        createdAt: new Date().toISOString()
      };

      const existingTrips = JSON.parse(localStorage.getItem("vagabond_trips") || "[]");
      existingTrips.push(newTrip);
      localStorage.setItem("vagabond_trips", JSON.stringify(existingTrips));

      router.push(`/trips/${uniqueId}`);
    } catch (err) {
      clearInterval(interval);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-[32px] border border-border bg-card shadow-glass relative overflow-hidden min-h-[420px] animate-scale-in">
        {/* Animated Bouncing Suitcase / Compass Wrapper (60fps, CSS animations) */}
        <div className="relative mb-6 flex h-36 w-36 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary">
          <Globe className="h-16 w-16 animate-spin-slow text-primary" />
          <Sparkles className="absolute right-2 top-2 h-7 w-7 text-accent animate-bounce" />
        </div>

        <h2 className="font-heading text-2xl font-extrabold text-foreground">Generating Your Journey...</h2>
        
        <p className="mt-4 text-primary font-extrabold tracking-wider text-sm animate-pulse">
          {LOADING_STEPS[loadingStep]}
        </p>

        {/* Progress timeline bar */}
        <div className="mt-8 w-72 bg-muted border border-border rounded-full h-2 overflow-hidden relative shadow-inner">
          <div className="bg-primary h-2 rounded-full absolute left-0 top-0 animate-loading-bar" style={{ width: "70%" }}></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-slate-200/50 sm:p-10 transition-colors duration-300 animate-fade-in-up relative overflow-hidden">
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-600 font-extrabold">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Destination */}
      <div className="space-y-2.5">
        <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          Where do you want to go?
        </label>
        <div className="hover:-translate-y-[2px] transition duration-200">
          <DestinationInput
            value={destination}
            onChange={setDestination}
            placeholder="Search destinations (e.g. Kyoto, Japan)"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Start Date
          </label>
          <input
            type="date"
            required
            value={startDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-2xl border border-border bg-input text-foreground px-4 py-3.5 text-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-ring shadow-sm hover:-translate-y-[2px]"
          />
        </div>
        <div className="space-y-2.5">
          <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            End Date
          </label>
          <input
            type="date"
            required
            value={endDate}
            min={startDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-2xl border border-border bg-input text-foreground px-4 py-3.5 text-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-ring shadow-sm hover:-translate-y-[2px]"
          />
        </div>
      </div>

      {/* Travel Party */}
      <div className="space-y-3">
        <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Who is traveling with you?
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PARTY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTravelParty(opt.id)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-[2px] ${
                travelParty === opt.id
                  ? "border-primary bg-primary/10 text-primary shadow-sm font-extrabold scale-[1.02]"
                  : "border-border bg-input text-foreground-secondary hover:border-primary/50 hover:bg-card-hover"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs uppercase tracking-wider font-extrabold">{opt.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-3">
        <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          What is your budget level?
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setBudget(opt.id)}
              className={`flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-[2px] ${
                budget === opt.id
                  ? "border-primary bg-primary/10 shadow-sm scale-[1.02]"
                  : "border-border bg-input hover:border-primary/50 hover:bg-card-hover"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                    budget === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground-secondary"
                  }`}
                >
                  {opt.id}
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  {opt.name}
                </span>
              </div>
              <span className="text-xs text-foreground-secondary mt-1 font-medium">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div className="space-y-3">
        <label className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
          <Tent className="h-4 w-4 text-primary" />
          What are your interests?
        </label>
        <div className="flex flex-wrap gap-2.5">
          {INTEREST_OPTIONS.map((opt) => {
            const selected = interests.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleToggleInterest(opt.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-extrabold tracking-wider uppercase transition-all duration-200 hover:-translate-y-[2px] ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                    : "border-border bg-input text-foreground-secondary hover:border-primary/50 hover:bg-card-hover"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-accent text-accent-foreground px-7 py-4.5 text-base font-extrabold shadow-xl shadow-accent/25 hover:scale-[1.01] active:scale-95 transition-all duration-200 focus:outline-none"
        >
          <Sparkles className="h-5 w-5" />
          Generate Trip
        </button>
      </div>
    </form>
  );
}

export default function PlanTripPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 relative z-card animate-fade-in">
      {/* Title */}
      <div className="text-center mb-10 animate-fade-in-up">
        <GlassBadge icon={<Sparkles className="h-3.5 w-3.5" />} variant="primary" className="mb-3">
          AI Itinerary Builder
        </GlassBadge>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Design Your Next Journey
        </h1>
        <p className="mt-3 text-base sm:text-lg text-foreground-secondary">
          Tell us your preferences and let our AI curate a personalized travel itinerary.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[420px] bg-card rounded-[32px] border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <PlanTripForm />
      </Suspense>
    </div>
  );
}
