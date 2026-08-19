# Airport Weather Intelligence System

Offline airport operations dashboard for Northern Nigeria aviation monitoring.

## Overview

This project provides a local weather intelligence and decision-support interface for Abuja, Kano, Jos, and Bauchi airports. It is designed for demonstrations, academic presentation, and offline operation where an external weather service is unavailable.

All weather values are generated locally from the selected airport and current forecast hour. No API key, database, or internet connection is required.

## Features

- Airport selector for ABV, KAN, JOS, and BCU
- Overview, live monitoring, forecast, and comparison tabs
- Local 24-hour weather simulation
- Temperature, wind, humidity, and visibility metrics
- Operational score and configurable risk thresholds
- Offline risk alerts with Web Audio sound signals
- Radar visualization with airport, aircraft, and weather markers
- Temperature and wind charts
- Hourly forecast table
- Runway headwind and crosswind analysis
- AI-style local trend prediction and recommendations
- Demo mode for airport cycling during presentations
- CSV export
- Premium aviation-weather logo and favicon

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Radix UI primitives
- Web Audio API

## Requirements

- Node.js 18 or newer
- npm, pnpm, or another Node package manager

## Run Locally

```powershell
cd "Airport weather system"
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

For a production build:

```powershell
npm run build
npm run start
```

## Project Structure

```text
app/                 Next.js app entry, layout, styles, and dashboard page
components/dashboard Dashboard feature components
components/ui        Reusable interface primitives
hooks/                Sound and utility hooks
lib/                  Airport data, local weather generation, and calculations
styles/               Shared style definitions
```

## Risk Levels

- Normal: suitable operating conditions
- Restricted: limited operations and caution advised
- High risk: delay or operational review advised

Risk thresholds can be changed from the dashboard Settings dialog.

## Offline Design

The dashboard does not call Open-Meteo or any other remote weather service. Refresh generates a new local simulation variation, while airport changes and forecast calculations remain available without network access.

## GitHub

Repository: https://github.com/kirfi02/airport-weather-intelligence-system
