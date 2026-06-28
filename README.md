# Airport Weather Intelligence System

## Overview

**Airport Weather Intelligence System: A Case Study of Northern Nigeria Aviation Operations**

A sophisticated, real-time weather intelligence and decision support system designed for aviation operations across Northern Nigeria. This system leverages real-time meteorological data, intelligent analysis, and professional-grade visualization to enhance flight safety and operational efficiency at regional airports.

## Key Features

### Real-Time Weather Monitoring
- **Live Weather Data**: Temperature, wind speed, humidity, visibility, and precipitation
- **Current Conditions Display**: Professional gauges and cards with trend indicators
- **Continuous Updates**: Auto-refresh every 5 minutes with seamless data synchronization

### Advanced Radar Visualization
- **Interactive Radar Panel**: Realistic control-room style radar display
- **Rotating Sweep Animation**: 360° rotating radar sweep with aircraft/weather blip detection
- **Dynamic Airport Positioning**: Station blips positioned based on actual geographic coordinates
- **Real-Time Monitoring**: Wind, visibility, and temperature indicators

### Multi-Airport Network Dashboard
- **Network Overview**: Side-by-side comparison of all 4 Northern Nigeria airports:
  - Abuja International Airport (ABV) - 9.0069°N, 7.2625°E
  - Kano International Airport (KAN) - 12.0469°N, 8.9829°E
  - Jos International Airport (JOS) - 9.8297°N, 8.8841°E
  - Bauchi International Airport (BCU) - 10.3167°N, 9.8167°E
- **Comparative Statistics**: Identify hottest, coldest, and windiest airports
- **Color-Coded Risk Status**: Quick visual assessment of operational conditions

### Runway Wind Analysis
- **Wind Direction Compass**: Animated compass visualization with directional arrow
- **Runway Performance Calculations**: Headwind and crosswind analysis for 3 runway configurations:
  - RWY 01/19 (North-South orientation)
  - RWY 03/21 (Northeast-Southwest orientation)
  - RWY 06/24 (East-West orientation)
- **Optimal Runway Recommendation**: Intelligent system identifies best runway configuration
- **Performance Indicators**: Color-coded performance bars (green=favorable, yellow=marginal, red=risk)

### Intelligent Weather Analytics
- **12-Hour Forecast Charts**: Temperature and wind speed trends with risk thresholds
- **Hourly Detailed Forecast**: 8-hour operational forecast table with status indicators
- **Risk Assessment Engine**: Real-time classification of operational conditions:
  - Normal Operations (green)
  - Restricted Operations (yellow) 
  - High Risk - Delay Advised (red)
- **AI Decision Support**: ML-powered analysis and weather trend predictions

### Professional Control Center Interface
- **Aviation Control Room Design**: Dark navy theme with neon cyan accents
- **Glassmorphism Effects**: Modern frosted glass UI components
- **Real-Time Status Indicators**: API status, ML model status, system operational state
- **Professional Monospace Typography**: Technical aesthetics for aviation operations

### Presentation Features
- **Demo Mode**: Automatic airport cycling every 8 seconds for presentations
- **Loading Screen**: Professional boot animation with system initialization sequence
- **Sound Alert System**: Configurable audio alerts for different risk levels
  - Normal: Confirmation beep
  - Restricted: Two warning beeps
  - High Risk: Three urgent alert beeps

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (React with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom animations
- **Charts**: Recharts for data visualization
- **UI Components**: shadcn/ui with custom enhancements

### Backend & Data
- **Weather API**: Open-Meteo (free, no authentication required)
- **Server Functions**: Next.js Server Actions for data fetching
- **Data Caching**: SWR for client-side state management

### Deployment
- **Hosting**: Vercel
- **Version Control**: GitHub
- **CI/CD**: Automatic deployment on Git push

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Local Setup

```bash
# Clone the repository
git clone https://github.com/kirfi02/airport-weather-intelligence-system.git
cd airport-weather-intelligence-system

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# Navigate to http://localhost:3000
```

### Environment Variables
No environment variables required - uses Open-Meteo API (free, public endpoint).

## Project Structure

```
airport-weather-intelligence-system/
├── app/
│   ├── page.tsx                 # Main dashboard page
│   ├── layout.tsx              # Root layout with theme
│   └── globals.css             # Global styles + animations
├── components/
│   └── dashboard/
│       ├── header.tsx                    # System header with controls
│       ├── weather-card.tsx             # Individual metric cards
│       ├── weather-charts.tsx           # Temperature & wind charts
│       ├── radar-panel.tsx              # Radar visualization
│       ├── risk-panel.tsx               # Alert status display
│       ├── operational-score.tsx        # Operational score gauge
│       ├── ai-prediction.tsx            # ML predictions
│       ├── forecast-table.tsx           # Hourly forecast
│       ├── airport-selector.tsx         # Airport dropdown
│       ├── multi-airport-comparison.tsx # Network overview
│       ├── runway-analysis.tsx          # Runway wind analysis
│       ├── loading-screen.tsx           # Boot animation
│       └── airport-selector.tsx         # Airport selector
├── lib/
│   ├── airports.ts              # Airport data & coordinates
│   ├── weather-api.ts           # Open-Meteo API integration
│   └── weather-types.ts         # TypeScript types & calculations
├── hooks/
│   └── use-sound-alerts.ts      # Sound alert system
└── public/
    └── (static assets)
```

## Usage

### Main Dashboard
1. **Select Airport**: Use dropdown in header to choose between ABV, KAN, JOS, BCU
2. **Monitor Conditions**: View real-time weather metrics and radar
3. **Check Runways**: Scroll to runway analysis section for optimal runway recommendation
4. **Compare Airports**: View multi-airport network dashboard for regional overview

### Demo Mode
- Click **"START DEMO MODE"** in control bar
- System automatically cycles through all 4 airports every 8 seconds
- Perfect for presentations and demonstrations
- Click **"STOP DEMO MODE"** to return to manual control

### Sound Alerts
- Click **"Sound: ON"** / **"Sound: OFF"** to toggle audio alerts
- Different alert tones for each risk level
- Useful for monitoring without constant screen attention

### Export Data
- Click **"EXPORT DATA"** to download weather briefing as CSV
- Timestamp and airport information included
- Use for record-keeping and documentation

## Key Algorithms

### Wind Component Calculation
```
Headwind = Wind_Speed × cos(Wind_Direction - Runway_Orientation)
Crosswind = Wind_Speed × sin(Wind_Direction - Runway_Orientation)
```

### Risk Level Classification
- **Normal**: Wind ≤ 20 km/h AND Visibility ≥ 3,000m
- **Restricted**: Wind 20-30 km/h OR Visibility 1,000-3,000m
- **High Risk**: Wind > 30 km/h OR Visibility < 1,000m

### Operational Score Formula
```
Score = 100 - (
  (Wind_Factor × 30) +
  (Visibility_Factor × 25) +
  (Humidity_Factor × 20) +
  (Weather_Factor × 25)
)
```

## API Integration

### Open-Meteo Weather API
- **Endpoint**: https://api.open-meteo.com/v1/forecast
- **Features**: Free, no authentication required
- **Data Points**: Temperature, wind, humidity, visibility, weather codes
- **Update Frequency**: Real-time

**Example Request:**
```
GET https://api.open-meteo.com/v1/forecast?latitude=9.0069&longitude=7.2625&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,wind_speed_10m
```

## Performance Optimizations

- **Server-Side Rendering**: Fast initial page load
- **Client-Side Caching**: SWR caching reduces API calls
- **CSS Animations**: Hardware-accelerated transforms and opacity
- **Image Optimization**: Vector-based graphics and SVG elements
- **Code Splitting**: Next.js automatic route code splitting

## Mobile Responsiveness

The dashboard is fully responsive and optimized for:
- Desktop (1920px and above)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

All features are accessible on mobile with touch-friendly interactions.

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel --prod
```

Or connect via GitHub for automatic deployments:
1. Push code to GitHub
2. Go to vercel.com/dashboard
3. Connect your GitHub repository
4. Vercel automatically deploys on every push

### View Live Deployment
- **Production URL**: Check your Vercel dashboard
- **Preview URL**: Available for every commit

## Future Enhancements

- Integration with actual METAR/TAF aviation weather data
- Real aircraft tracking via ADS-B data
- Historical weather analysis and comparisons
- Pilot-specific briefing report generation
- Integration with flight planning systems
- Mobile native app (React Native)
- Real-time weather alerts via push notifications
- Multi-language support

## Contributing

This is a final year project for university. Contributions, suggestions, and feedback are welcome!

To contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Project Context

**Institution**: University (Final Year Project)  
**Duration**: [Project Period]  
**Team**: [Your Name/Team]  
**Focus**: Aviation Operations & Weather Intelligence  

This project was developed as a case study of Northern Nigeria aviation operations, demonstrating the integration of real-time data, intelligent analysis, and professional UI/UX design for critical operational decisions.

## Acknowledgments

- **Open-Meteo**: Free weather API provider
- **Vercel**: Deployment platform
- **Next.js Team**: Framework and tooling
- **shadcn/ui**: Component library
- **Tailwind CSS**: Utility-first CSS framework

## License

This project is provided as-is for educational purposes. Modify and distribute as needed for your university project.

## Contact & Support

For questions, issues, or suggestions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Last Updated**: January 2026  
**Version**: 2.0.0  
**Status**: Production Ready

---

## Quick Links

- 🌐 [Live Demo](https://v0-airport-weather-system.vercel.app)
- 📖 [GitHub Repository](https://github.com/kirfi02/airport-weather-intelligence-system)
- 🐛 [Report Issues](https://github.com/kirfi02/airport-weather-intelligence-system/issues)
- 🚀 [Deploy Your Own to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/kirfi02/airport-weather-intelligence-system)

---

## Latest Updates

### Version 2.1.0 (Current)
- ✅ Multi-airport comparison dashboard fully functional
- ✅ Runway wind analysis with optimal runway recommendations
- ✅ Animated radar panel with correct geographic positioning
- ✅ Fixed all deprecation warnings (upgraded to Recharts v3)
- ✅ Deployed to production on Vercel
- ✅ Demo mode with automatic airport cycling
- ✅ Sound alert system with 3 alert levels
- ✅ Professional loading screen with boot animation

### Deployment Status
- **Production URL**: https://v0-airport-weather-system.vercel.app
- **Status**: ✅ Active and Running
- **Last Deploy**: January 2026
- **Build Time**: 4.2 seconds
- **Bundle Size**: Optimized for performance
