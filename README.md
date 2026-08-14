# Vagabond AI - Anonymous AI Travel Planner

Vagabond AI is a modern, responsive travel planner web application built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. It uses **OpenAI's GPT-4o-mini** to generate detailed day-by-day travel itineraries and **Google Maps JS API + Places API** for interactive map rendering, marker routing, and place autocomplete.

To protect user privacy and maximize load speeds, all generated trips are saved locally in the browser using `localStorage`—no sign-ups, logins, or database setup required!

---

## Features
- **Frictionless Anonymous Experience**: No login, sign-up, email verification, or phone OTP required. Just open and start planning.
- **Smart Itinerary Planner**: Enter a destination, select travel dates, companion party size, budget level, and interests to generate a structured day-by-day itinerary.
- **AI-Powered Itineraries**: Custom daily themes, scheduled activities, description details, and coordinate-mapped dining spots.
- **Interactive Routing Map**: Plots day-by-day destinations on a Google Map, linking pins with path polylines. Info windows link directly to Google Maps.
- **User Dashboard**: Save, load, list, and delete trips directly in your browser's local store.
- **Dynamic 3D Travel Animations**: Engaging, site-wide, multi-layered background graphics that animate smoothly on all pages.

---

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **AI Engine**: OpenAI API (`gpt-4o-mini` model with JSON Response Format)
- **Maps Integration**: `@react-google-maps/api` (Google Maps JavaScript SDK & Google Places Autocomplete)
- **Styling**: Tailwind CSS & Lucide Icons
- **Storage**: Browser-based Client `localStorage` (100% database-free for server runs)

---

## Local Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js** (v18.x or later) and **npm** installed on your system.

### 2. Clone and Install Dependencies
```bash
git clone <your-repository-url>
cd AI-trip-planner
npm install
```

### 3. Environment Configuration
Copy the `.env.example` template to `.env.local` in the root of the project:
```bash
cp .env.example .env.local
```

Open `.env.local` and configure your credentials:

#### A. OpenAI API Key
Get your key from [OpenAI Platform](https://platform.openai.com) and add it:
```env
OPENAI_API_KEY="sk-proj-xxxx"
```

#### B. Google Maps API Key
Go to [Google Cloud Console](https://console.cloud.google.com), create a project, enable the **Maps JavaScript API** and **Places API**, and obtain an API key:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyxxxx"
```
*(Note: The prefix `NEXT_PUBLIC_` is required to securely expose the API key to the client-side Google Maps script).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Production Deployment (Vercel)

Vagabond AI is fully optimized for one-click deployment to **Vercel**:

1. Push your repository to **GitHub**.
2. Log in to Vercel, click **Add New Project**, and select your GitHub repository.
3. In the **Environment Variables** section, configure:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Click **Deploy**.
5. Connect your custom domain `vagabond.ai` via the Vercel Domain Settings panel.

---

## Technical Architecture & Privacy Notes
- **Trips Scoping**: Trips are saved locally to the client browser's `localStorage` under the key `vagabond_trips`.
- **Data Loss Warning**: Because trips are stored locally on the user's device, clearing browser cache or cookies will remove saved itineraries.
- **Server Statelessness**: The Next.js API routes are completely stateless and require no database, making the app incredibly cheap, fast, and easy to run in production.

---

## License
All rights reserved. Created with Antigravity.
