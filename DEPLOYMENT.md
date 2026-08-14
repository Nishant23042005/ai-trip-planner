# Vagabond AI Deployment Guide

This guide details the step-by-step instructions to deploy Vagabond AI to **Vercel** and map the custom domain **`vagabond.ai`**.

---

## 1. Prerequisites

Before starting, ensure that:
1. Your repository is pushed to your GitHub account: `https://github.com/Nishant23042005/ai-trip-planner`.
2. You have your **OpenAI API Key** ready.
3. You have your **Google Maps API Key** ready.

---

## 2. Environment Variables Checklist

Ensure these variables are configured in the Vercel Dashboard (do **NOT** include them in your git commits):

| Key | Scope | Purpose | Description / Where to get |
| :--- | :--- | :--- | :--- |
| `OPENAI_API_KEY` | Server-side | AI Itinerary Generation | Generate from [OpenAI Developer Platform](https://platform.openai.com) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client-side | Interactive Maps | Enable *Maps JavaScript API* and *Places API* in [Google Cloud Console](https://console.cloud.google.com) |

---

## 3. Step-by-Step Vercel Deployment Checklist

Follow these steps to deploy your application online:

### Step 1: Import Your Repository
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Under *Import Git Repository*, select your GitHub account and click **Import** next to `ai-trip-planner`.

### Step 2: Configure Build Settings
Vercel automatically detects Next.js configurations. Ensure these default configurations are active:
- **Framework Preset**: `Next.js`
- **Root Directory**: `./`
- **Build Command**: `next build` (Default)
- **Output Directory**: `.next` (Default)

### Step 3: Add Environment Variables
1. Scroll down to the **Environment Variables** section.
2. Add your keys exactly as shown below:
   - **Name**: `OPENAI_API_KEY`  
     **Value**: `sk-proj-xxxxxx...`
   - **Name**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`  
     **Value**: `AIzaSyxxxxxx...`
3. Click **Add** for each variable.

### Step 4: Click Deploy!
1. Click the **Deploy** button.
2. Vercel will build the project, run linting checks, optimize serverless functions, and deploy the app.
3. Once completed, Vercel will output a live preview URL (e.g., `ai-trip-planner-abc.vercel.app`).

---

## 4. Connect Your Custom Domain (`vagabond.ai`)

Once the build is successful, map your custom domain:

1. In the Vercel Dashboard, go to your project page and select **Settings** -> **Domains**.
2. Click **Add**.
3. Enter `vagabond.ai` and click **Add**.
4. Vercel will display the DNS configuration details:
   - **A Record**: Point `@` to `76.76.21.21`
   - **CNAME Record**: Point `www` to `cname.vercel-dns.com`
5. Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.), update the DNS records with these parameters, and wait 5–10 minutes for SSL provisioning.

---

## 5. Automated CI/CD (Continuous Integration)
- Every time you push to the `main` branch, Vercel will automatically trigger a production build.
- Branch/PR pushes will automatically trigger isolated preview environments, allowing safe testing.
