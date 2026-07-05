# 🌬️ AirIQ — Nairobi Real-Time Air Quality Intelligence

> **Live air quality monitoring, health recommendations, and pollutant analytics for all 17 Nairobi subcounties.**

Live Dashboard: *(add Vercel URL here)*  
GitHub: *(add GitHub URL here)*

---

## Table of Contents

1. [What is AirIQ?](#1-what-is-airiq)
2. [How it Works](#2-how-it-works)
3. [System Architecture](#3-system-architecture)
4. [Dashboard Features](#4-dashboard-features)
   - [Live Monitor Tab](#41-live-monitor-tab)
   - [Statistics Tab](#42-statistics-tab)
   - [Health Nexus Tab](#43-health-nexus-tab)
   - [Pollutant Encyclopedia Tab](#44-pollutant-encyclopedia-tab)
5. [Air Quality Standards Covered](#5-air-quality-standards-covered)
6. [Pollutants Tracked](#6-pollutants-tracked)
7. [AI Health Advisor](#7-ai-health-advisor)
8. [Healthcare Accessibility Layer](#8-healthcare-accessibility-layer)
9. [Data Sources](#9-data-sources)
10. [Project Structure](#10-project-structure)
11. [Environment Variables](#11-environment-variables)
12. [Local Development](#12-local-development)
13. [Deployment — Vercel](#13-deployment--vercel)
14. [Known Limitations](#14-known-limitations)

---

## 1. What is AirIQ?

AirIQ is a full-stack air quality intelligence platform built specifically for Nairobi, Kenya. It pulls live sensor readings from the World Air Quality Index (WAQI) network, overlays them across all 17 Nairobi subcounties, and delivers:

- **Real-time AQI** for each subcounty with GPS-based auto-detection of your location
- **Per-pollutant breakdowns** (PM2.5, PM10, NO₂, O₃, CO, SO₂) with EPA AQI sub-indices
- **Health profile-aware recommendations** — different advice for asthmatic adults, children, athletes, pregnant women, and the elderly
- **Gemini AI-powered advisor** with Nairobi-specific context (matatus, jua kali, cooking fires, JKIA)
- **Multi-standard regulatory analytics** — comparing Kenya NEMA, US EPA, EU AQD 2024, WHO 2021, and UNEP Africa limits side by side
- **Healthcare accessibility overlay** — combining air quality risk with health facility access for each subcounty, directly informing SDG 3 gaps

The platform is designed for anyone navigating Nairobi's air: commuters deciding whether to wear a mask, parents checking if their child can play outside, healthcare workers identifying high-burden areas, and researchers studying the intersection of pollution and healthcare access.

---

## 2. How it Works

### AQI Calculation

AirIQ uses the **US EPA standard** AQI breakpoint interpolation formula applied to raw µg/m³ and ppb readings from WAQI sensors:

```
AQI = ((I_hi - I_lo) / (BP_hi - BP_lo)) × (C_p - BP_lo) + I_lo
```

Where `C_p` is the measured concentration, `BP_lo/BP_hi` are the concentration breakpoints, and `I_lo/I_hi` are the corresponding AQI breakpoints.

Each pollutant has its own breakpoint table:

| Pollutant | Good (0–50) | Moderate (51–100) | Unhealthy Sensitive (101–150) |
|-----------|-------------|-------------------|-------------------------------|
| **PM2.5** | 0–12 µg/m³ | 12.1–35.4 µg/m³ | 35.5–55.4 µg/m³ |
| **PM10**  | 0–54 µg/m³ | 55–154 µg/m³    | 155–254 µg/m³   |
| **NO₂**   | 0–53 ppb   | 54–100 ppb       | 101–360 ppb      |
| **O₃**    | 0–54 ppb   | 55–70 ppb        | 71–85 ppb        |

The reported AQI for a station is the **maximum sub-index** across all measured pollutants — the "worst actor" drives the headline number.

### Subcounty Mapping

All 17 Nairobi subcounties have coordinates stored in `lib/aqi.ts`. Subcounties with a live WAQI station (Westlands `@8773`, Starehe/CBD `@8772`, Embakasi Central `@8774`) get real readings. The remainder are interpolated from the nearest station using an inverse-distance weighted model and a ±15 % randomised perturbation to reflect local variation — clearly flagged as estimated in the UI.

### 10-Minute Caching

The API route (`/api/airiq`) caches the full response in memory for **10 minutes**. This prevents hammering the WAQI API on every browser request while keeping data fresh enough for day-to-day decisions.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           AirIQ                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     DATA LAYER                           │   │
│  │  WAQI API (3 live stations: Westlands, Starehe,          │   │
│  │  Embakasi Central) + geo-search bounding box             │   │
│  │  → 10-min server-side cache                              │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │  StationReading[]                   │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                  AQI ENGINE  (lib/aqi.ts)                 │   │
│  │  • EPA breakpoint interpolation (6 pollutants)            │   │
│  │  • Subcounty-to-station assignment                        │   │
│  │  • IDW spatial interpolation for unmapped subcounties     │   │
│  │  • Hourly trend generation                                │   │
│  │  • Exposure risk scoring (calcExposure)                   │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │  AirIQResponse                      │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                  API ROUTES                              │   │
│  │  GET /api/airiq    → full subcounty array + city avg     │   │
│  │  POST /api/recommend → AI/rule-based health advice       │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                  NEXT.JS DASHBOARD                       │   │
│  │  💨 Live Monitor · 📊 Statistics · 🏥 Health Nexus       │   │
│  │  🧪 Pollutant Encyclopedia                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| AI | Google Gemini 1.5 Flash (with rule-based fallback) |
| Data | WAQI (World Air Quality Index) REST API |
| Deployment | Vercel |

---

## 4. Dashboard Features

### 4.1 Live Monitor Tab

The main landing screen. Everything updates automatically every 10 minutes; you can also force a refresh with the **🔄 Refresh** button.

**Subcounty selector grid** — 17 clickable cards showing the AQI for every Nairobi subcounty. Colour-coded green → hazardous. Live stations are marked with a ✓ badge.

**GPS auto-detection** — on page load the browser requests your location and selects the nearest subcounty automatically. Falls back to Starehe (CBD) after 3 seconds if no GPS response.

**Hero AQI gauge** — an SVG half-circle dial for the selected subcounty. Shows the numerical AQI, category label (Good / Moderate / Unhealthy / etc.), and a colour-matched needle.

**Pollutant breakdown row** — six cards (PM2.5, PM10, NO₂, O₃, CO, SO₂) each showing the raw concentration, AQI sub-index, and a coloured status badge.

**Hourly trend chart** — a 24-hour area chart of AQI values, showing how air quality has changed through the day (generated from the current reading with a realistic diurnal model).

**Detail / AI Advisor panel** — two sub-tabs:
- *Detail*: dominant pollutant, confidence level (live vs estimated), subcounty context blurb, WHO guideline comparison
- *AI Advisor*: health profile selector → personalised outdoor advice, indoor advice, activity table, and forecast narrative (Gemini-powered when API key is set; rule-based fallback otherwise)

**Health profile selector** — six profiles: Healthy Adult, Child, Elderly, Asthma/Respiratory, Pregnant, Athlete. Selecting a profile instantly updates the AI Advisor.

### 4.2 Statistics Tab

A city-wide analytics dashboard comparing all 17 subcounties.

- **Ranked bar chart** — subcounties sorted by AQI descending, colour-coded
- **Pollutant comparison** — a grouped bar chart comparing PM2.5, PM10, and NO₂ across every subcounty
- **City summary cards** — city average AQI, the cleanest and most polluted subcounty, number of stations above WHO guidelines
- **Trend analysis** — AQI distribution histogram and percentage of subcounties in each health category

### 4.3 Health Nexus Tab

A research-grade dashboard cross-referencing air quality data with healthcare accessibility (sourced from the [Healthcare Accessibility in Nairobi](https://github.com/Vinylango25/Healthcare-Accessibility-in-Nairobi) study).

Six evidence figures built with Recharts:

| Figure | Content |
|--------|---------|
| **Fig 1** | Air quality vs health facility count — scatter plot per subcounty |
| **Fig 2** | Population-weighted pollution exposure ranking |
| **Fig 3** | SDG 3 service gap matrix (ANC, ART, PMTCT, TB diagnostics, immunisation per subcounty) |
| **Fig 4** | Facilities per 10,000 people vs AQI — dual-axis chart |
| **Fig 5** | Vulnerability index (composite of AQI + density + facility access) |
| **Fig 6** | Healthcare service coverage radar chart — comparing subcounties on 6 SDG-3 dimensions |

The tab includes a research summary panel citing the WHO data gap, Kenya NEMA enforcement gaps, and actionable policy recommendations for Nairobi County.

### 4.4 Pollutant Encyclopedia Tab

A deep-dive reference for each tracked pollutant. Organised into four sub-tabs:

**Overview** — formula, name, WHO 2021 annual guideline, full description, Nairobi-specific context (e.g. charcoal jiko cooking fires for CO, Mombasa Road industrial belt for SO₂), sources list, and health effects.

**Standards** — side-by-side bar charts and a scrollable table comparing annual, 24-hour, and 1-hour limits across:
- 🇺🇸 US EPA NAAQS
- 🇪🇺 EU Air Quality Directive 2024
- 🌍 WHO Global Air Quality Guidelines 2021
- 🇰🇪 Kenya NEMA Environmental Standards 2014
- 🌍 UNEP Africa Regional recommendations

**Sources** — FAIRMODE/EMEP source apportionment donut chart and bar breakdown for each pollutant, quantifying the % contribution from vehicle exhaust, cooking fires, industrial activity, dust, etc. — specific to Nairobi's emission inventory.

**AQI Bands** — the full US EPA AQI breakpoint table visualised as a colour-coded strip with concentration ranges and health category labels.

---

## 5. Air Quality Standards Covered

| Standard | Body | Annual PM2.5 | 24h PM2.5 | Annual NO₂ | Notes |
|----------|------|-------------|-----------|-----------|-------|
| **US EPA NAAQS** | US EPA | 9 µg/m³ | 35 µg/m³ | 53 ppb | Revised 2024 |
| **EU AQD 2024** | European Commission | 10 µg/m³ | 25 µg/m³ | 20 µg/m³ | New binding limits 2030 |
| **WHO 2021** | World Health Organization | 5 µg/m³ | 15 µg/m³ | 10 µg/m³ | Most protective globally |
| **Kenya NEMA 2014** | NEMA Kenya | 15 µg/m³ | 35 µg/m³ | 40 µg/m³ | Legal limit in Kenya |
| **UNEP Africa** | UNEP | 10 µg/m³ | 25 µg/m³ | 20 µg/m³ | Regional guidance |

Nairobi's annual average PM2.5 frequently exceeds **all five standards** simultaneously, making the regulatory comparison directly relevant to everyday life.

---

## 6. Pollutants Tracked

| Pollutant | Key | Unit | Primary Nairobi Source |
|-----------|-----|------|------------------------|
| Fine Particulate Matter | **PM2.5** | µg/m³ | Charcoal cooking fires (32%), vehicle exhaust (28%) |
| Coarse Particulate Matter | **PM10** | µg/m³ | Road/soil dust (38%), construction (18%) |
| Nitrogen Dioxide | **NO₂** | ppb / µg/m³ | Matatu/lorry exhaust (68%) |
| Ozone | **O₃** | ppb | Secondary: NOₓ + VOCs + UV (55%) |
| Carbon Monoxide | **CO** | ppm | Charcoal jiko/cooking (40%), traffic (35%) |
| Sulfur Dioxide | **SO₂** | ppb | Mombasa Rd industrial belt (48%) |

---

## 7. AI Health Advisor

The `/api/recommend` route accepts a subcounty reading and a health profile and returns a structured recommendation object:

```typescript
{
  summary:           string;   // Overall AQ situation narrative
  outdoorAdvice:     string;   // What you should/shouldn't do outside
  indoorAdvice:      string;   // Ventilation, purifier, window advice
  sensitiveGroupNote: string;  // Profile-specific medical alert
  forecast:          string;   // Expected AQI trajectory for the next few hours
  activities: [                // Activity-level safety table
    { activity: string; safe: boolean; note: string }
  ]
}
```

### Gemini Integration

When `GEMINI_API_KEY` is set in the environment, the advisor sends a structured prompt to **Gemini 1.5 Flash**:

```
You are an expert environmental health advisor for Nairobi, Kenya.
Air quality data for {subcounty}: AQI {n} ({category}), PM2.5: {v} µg/m³,
dominant: {pollutant}, time: {HH:MM} EAT, profile: {profile}.
Respond JSON only: {"summary":"...","outdoorAdvice":"...","indoorAdvice":"...","sensitiveGroupNote":"...","forecast":"..."}
Be specific to Nairobi (matatus, jua kali, cooking fires, JKIA). Use Kenyan English.
```

The LLM response is merged with the rule-based output so activity tables and structured fields are always present even if the LLM omits them.

### Rule-Based Fallback

Without a Gemini key, a deterministic rule engine generates advice based on:
- AQI band (Good / Moderate / USG / Unhealthy / Very Unhealthy)
- Health profile sensitivity level
- Time of day (rush hour: 06–09, 17–20 EAT)
- Dominant pollutant
- PM2.5 vs WHO 24h guideline (15 µg/m³)

The fallback is Nairobi-aware: it references matatu commutes, jua kali workshops, and cooking fire smoke.

---

## 8. Healthcare Accessibility Layer

The Health Nexus tab integrates data from a separate study on healthcare access in Nairobi (based on the 2019 Kenya Population Census and Ministry of Health facility datasets).

Each subcounty record includes:

| Field | Description |
|-------|-------------|
| `population` | 2019 Census count |
| `healthFacilities` | Number of registered health facilities |
| `facilitiesPerCapita` | Facilities per 10,000 residents |
| `has24HourService` | Whether 24-hour emergency care is available |
| `weekendService` | Weekend availability |
| `services.art` | Antiretroviral Therapy |
| `services.anc` | Antenatal Care |
| `services.pmtct` | Prevention of Mother-to-Child Transmission |
| `services.tbDiagnostics` | TB screening and diagnosis |
| `services.obstetricEmergency` | `'basic'`, `'comprehensive'`, or `'none'` |
| `sdg3Gaps` | Named SDG 3 gaps for that subcounty |

Subcounties like **Kibra** and **Mathare** score poorly on both axes — high AQI *and* low facility access — creating a compounded vulnerability that the Health Nexus visualises directly.

---

## 9. Data Sources

| Source | What it provides | Update frequency |
|--------|-----------------|-----------------|
| **WAQI API** (`api.waqi.info`) | Live AQI + raw pollutant concentrations for Nairobi stations | Real-time, cached 10 min |
| **US EPA NAAQS** | AQI breakpoints and health category thresholds | Static (2024 revision) |
| **WHO Global AQG 2021** | WHO annual + 24h guidelines for all 6 pollutants | Static |
| **EU AQD 2024** | EU binding limits effective 2030 | Static |
| **Kenya NEMA 2014** | Kenya national ambient air quality standards | Static |
| **UNEP Africa 2022** | Source apportionment data, regional recommendations | Static |
| **Kenya MoH / 2019 Census** | Healthcare facility counts and service coverage | Static (2019) |
| **FAIRMODE/EMEP** | Emission sector apportionment methodology | Static |

---

## 10. Project Structure

```
airiq/
├── app/
│   ├── page.tsx                  # Main dashboard (all 4 tabs, all UI components)
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Tailwind base styles
│   └── api/
│       ├── airiq/
│       │   └── route.ts          # GET /api/airiq — fetches WAQI, builds 17-subcounty response
│       └── recommend/
│           └── route.ts          # POST /api/recommend — Gemini / rule-based AI advisor
│
├── components/
│   ├── pollutants/
│   │   ├── index.tsx             # PollutantEncyclopedia — top-level tab with sub-nav
│   │   ├── header.tsx            # PollutantSelector + PollutantHeader (formula, WHO line, AQI scale)
│   │   ├── standards.tsx         # StandardsComparison — bar charts + scrollable table
│   │   └── sources-health.tsx    # SourcesAndHealth · SourceApportionment · AqiBandsPanel
│   └── health-nexus/
│       ├── index.tsx             # HealthNexusTab — research summary + fig selector
│       ├── figures-1-2.tsx       # AQ vs facilities scatter · population exposure ranking
│       ├── figures-3-4.tsx       # SDG-3 service gap matrix · facilities/capita vs AQI
│       └── figures-5-6.tsx       # Vulnerability index · SDG-3 service coverage radar
│
├── lib/
│   ├── aqi.ts                    # AQI engine: breakpoints, subcounty data, POLLUTANT_INFO
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── profiles.ts               # HealthProfile type + labels/icons
│   ├── ai.ts                     # Gemini integration + rule-based recommendation engine
│   └── healthcare.ts             # HEALTHCARE_DATA — 17 subcounty records
│
├── public/                       # Static assets (SVGs)
├── .env.local                    # Local environment variables (not committed)
├── .env.example                  # Template for required env vars
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 11. Environment Variables

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
# WAQI API token — get yours free at https://aqicn.org/api/
WAQI_TOKEN=your_waqi_token_here

# Google Gemini API key — optional, enables AI-powered health advice
# Without this, the rule-based advisor is used automatically
# Get one at https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Free WAQI Token

1. Go to **https://aqicn.org/api/**
2. Enter your email and click **Request API Key**
3. Copy the token from the confirmation email
4. Add it as `WAQI_TOKEN` in your `.env.local`

The `demo` token works for development but is heavily rate-limited (returns demo data for most queries). Use your own token for real data.

### Setting Up Vercel Environment Variables

```bash
echo "your_waqi_token" | npx vercel env add WAQI_TOKEN production
echo "your_gemini_key" | npx vercel env add GEMINI_API_KEY production
```

Or via the Vercel dashboard at **Settings → Environment Variables**.

---

## 12. Local Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Vinylango25/airiq.git
cd airiq
npm install
```

### Create your `.env.local`

```bash
cp .env.example .env.local
# Then edit .env.local and add your WAQI_TOKEN
```

### Run the development server

```bash
npm run dev
```

Opens at **http://localhost:3000**.

### Build for production

```bash
npm run build
npm start
```

---

## 13. Deployment — Vercel

### Deploy from CLI

```bash
npx vercel --prod
```

### What happens on deployment

1. Vercel runs `npm run build` — Next.js compiles the app, performs static optimisation, and bundles server components
2. The `/api/airiq` route runs as a serverless function with a **60-second timeout** (WAQI fetches are fast, but multiple parallel geo-search calls may take up to 5–8 seconds)
3. The in-memory cache resets on every cold start — meaning the first request after a deployment will hit WAQI directly

### Vercel project info

This project is linked to Vercel project `airiq` (org `team_yd6uLOmPzklRmMSTVCcgtTdi`). The `.vercel/project.json` contains the project and org IDs.

---

## 14. Known Limitations

### Data Coverage

- **Only 3 live WAQI stations** exist in Nairobi (Westlands, Starehe, Embakasi Central). The remaining 14 subcounties are **spatially interpolated** — these are estimates, not measurements. They are clearly marked in the UI.
- **WAQI demo token** returns static demo data, not live Nairobi readings. Always use a real token in production.
- **Sensor gaps** — Kibra, Mathare, and other high-density informal settlements — which likely have the highest real-world pollution — have no sensors at all. The data systematically under-represents the most vulnerable areas.

### Temporal

- AQI is a **10-minute snapshot** — the caching interval. In Nairobi, pollution can spike significantly within minutes (e.g. a lorry convoy on Mombasa Road, a jua kali area fire). The hourly trend chart is modelled, not measured.
- **Historical data is not stored** — all readings are fetched live. There is no time-series database behind this app.

### AI Advisor

- Without `GEMINI_API_KEY`, advice is rule-based — accurate and useful but not contextualised to the specific pollutant mix of the moment.
- Gemini responses are **not medical advice**. The platform is an informational tool. Always consult a healthcare professional for medical decisions.

### Healthcare Data

- Healthcare data is from the **2019 Kenya Population Census** and MoH records. Facility counts may have changed.
- SDG 3 gap analysis is based on available administrative data and may not reflect ground truth.

---

## AQI Colour Reference

| Range | Category | Colour | Who is at risk? |
|-------|----------|--------|----------------|
| 0–50  | Good | 🟢 Green | None |
| 51–100 | Moderate | 🟡 Amber | Very sensitive individuals |
| 101–150 | Unhealthy for Sensitive Groups | 🟠 Orange | Children, elderly, asthmatic, pregnant |
| 151–200 | Unhealthy | 🔴 Red | Everyone |
| 201–300 | Very Unhealthy | 🟣 Purple | Everyone — serious effects |
| 301–500 | Hazardous | 🟤 Maroon | Emergency conditions |

---

*Built with Next.js 16, TypeScript, Tailwind CSS v4, Recharts, Google Gemini, and the WAQI API.*  
*Healthcare data from the [Nairobi Healthcare Accessibility Study](https://github.com/Vinylango25/Healthcare-Accessibility-in-Nairobi).*  
*Air quality standards: US EPA NAAQS, EU AQD 2024, WHO 2021, Kenya NEMA 2014, UNEP Africa.*
