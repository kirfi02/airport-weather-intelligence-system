/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ChevronDown,
  Plane,
  Radio,
  BrainCircuit,
  RefreshCw,
  Search,
  MapPin,
  EyeOff,
  CloudRain,
  Bell,
  BellOff,
  Trash2,
  Volume2,
  Loader2,
  X,
  Compass,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { cn } from './lib/utils';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Markdown from 'react-markdown';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Types ---

interface Advisory {
  type: string;
  msg: string;
  source: string;
  time: string;
  impact: string;
}

interface WeatherData {
  temp: number;
  windSpeed: number;
  windDir: string;
  pressure: number;
  description: string;
  humidity: number;
  visibility: number;
  timestamp: string;
  source?: 'mock' | 'live';
  notams?: string[];
  advisories?: Advisory[];
  recommendation?: string;
}

interface ForecastData {
  time: string;
  day: string;
  temp: number;
  condition: string;
  wind: number;
  precip: number;
}

// --- Mock Data & Logic ---

const AIRPORTS = [
  { id: 'kano', name: 'Kano (KAN)', lat: 12.0476, lon: 8.5246, city: 'Kano, Nigeria' },
  { id: 'abuja', name: 'Abuja (ABV)', lat: 9.0065, lon: 7.3986, city: 'Abuja, Nigeria' },
  { id: 'jos', name: 'Jos (JOS)', lat: 9.8965, lon: 8.8583, city: 'Jos, Nigeria' },
  { id: 'bauchi', name: 'Bauchi (BCU)', lat: 10.3158, lon: 9.8442, city: 'Bauchi, Nigeria' },
];

const generateMockHistory = (count: number): WeatherData[] => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const conditions = ['Clear Sky', 'Partly Cloudy', 'Haze', 'Dusty', 'Light Rain'];
  
  return Array.from({ length: count }).map((_, i) => ({
    temp: 15 + Math.random() * 10,
    windSpeed: 5 + Math.random() * 15,
    windDir: directions[Math.floor(Math.random() * directions.length)],
    pressure: 1010 + Math.random() * 10,
    description: conditions[Math.floor(Math.random() * conditions.length)],
    humidity: 40 + Math.random() * 40,
    visibility: 8 + Math.random() * 4,
    timestamp: new Date(Date.now() - (count - i) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'mock',
    advisories: []
  }));
};

const FORECAST: ForecastData[] = [
  { day: 'MON', time: '08:00', temp: 22, condition: 'Clear Sky', wind: 8, precip: 0 },
  { day: 'MON', time: '14:00', temp: 28, condition: 'Partly Cloudy', wind: 14, precip: 5 },
  { day: 'MON', time: '20:00', temp: 21, condition: 'Haze', wind: 10, precip: 0 },
  { day: 'TUE', time: '08:00', temp: 23, condition: 'Clear Sky', wind: 12, precip: 0 },
  { day: 'TUE', time: '14:00', temp: 29, condition: 'Dusty', wind: 18, precip: 10 },
  { day: 'TUE', time: '20:00', temp: 22, condition: 'Clear Sky', wind: 11, precip: 0 },
  { day: 'WED', time: '08:00', temp: 20, condition: 'Light Rain', wind: 24, precip: 65 },
  { day: 'WED', time: '14:00', temp: 24, condition: 'Thunderstorm', wind: 32, precip: 85 },
  { day: 'WED', time: '20:00', temp: 18, condition: 'Overcast', wind: 15, precip: 40 },
];

// --- Gemini Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Components ---

const StatusIndicator = ({ label, status, colorClass }: { label: string; status: string; colorClass: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
    <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px]", colorClass)} />
    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">{label}:</span>
    <span className={cn("text-[10px] font-black tracking-widest uppercase", colorClass.replace('bg-', 'text-'))}>{status}</span>
  </div>
);

const WeatherCard = ({ icon: Icon, label, value, unit, trend, subLabel, subValue }: { 
  icon: any; 
  label: string; 
  value: string | number; 
  unit: string; 
  trend?: string;
  subLabel?: string;
  subValue?: string | number;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02, translateY: -4 }}
    className="glass-card p-6 flex flex-col justify-between min-h-[180px]"
  >
    <div className="flex justify-between items-start">
      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", trend.startsWith('+') ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400")}>
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tighter text-white neon-glow-cyan">{value}</span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mt-1">{label}</p>
      
      {subLabel && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{subLabel}</span>
          <span className="text-[10px] font-black text-white uppercase">{subValue}</span>
        </div>
      )}
    </div>
  </motion.div>
);

const FlightPlanModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  isLoading,
  origin,
  destination,
  onGeneratePlan
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  plan: string | null;
  isLoading: boolean;
  origin: typeof AIRPORTS[0] | null;
  destination: typeof AIRPORTS[0];
  onGeneratePlan: (origin: typeof AIRPORTS[0], destination: typeof AIRPORTS[0]) => void;
}) => {
  const [loadingStep, setLoadingStep] = useState(0);
  
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 4);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!isOpen) return null;

  const loadingMessages = [
    "Analyzing corridor vectors...",
    "Synthesizing METAR & TAF data...",
    "Calculating Cessna 172 fuel burn...",
    "Finalizing operational briefing..."
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-yellow-500/20 shadow-[0_0_100px_rgba(234,179,8,0.05)] bg-[#0a0f1d]"
          onClick={e => e.stopPropagation()}
        >
          {/* Decorative Folder Tab */}
          <div className="absolute top-0 left-8 h-1 w-32 bg-yellow-500 rounded-b-full shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent relative">
            <div className="flex gap-6">
              <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 shadow-inner">
                <BrainCircuit className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Operation Folder: {origin?.id} » {destination.id}</h2>
                  <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-[10px] font-black tracking-widest border border-yellow-500/30">AI ASSISTED</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Classification:</span>
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Operational Intelligence</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-800" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generated:</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all group">
              <X className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-grid-pattern">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-8 text-center">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-full border-2 border-white/5 border-t-yellow-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-black text-white uppercase tracking-[0.3em]">{loadingMessages[loadingStep]}</p>
                  <div className="flex justify-center gap-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={cn("w-8 h-1 rounded-full transition-all duration-500", i === loadingStep ? "bg-yellow-500" : "bg-white/5")} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase max-w-xs mx-auto leading-relaxed">
                    Accessing global aeronautical nodes for optimal route determination & risk mitigation
                  </p>
                </div>
              </div>
            ) : plan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="markdown-body">
                    <Markdown>{plan}</Markdown>
                  </div>
                </div>
                
                {/* Sidebar Stats */}
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Mission Parameters</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">AIRCRAFT TYPE</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">CESSNA 172</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">PRIORITY</span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">STANDARD OPS</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ENGINEERING</span>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">VALIDATED</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-yellow-500" />
                      <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest italic">Safety Notice</h4>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-relaxed font-mono italic uppercase">
                      This plan is AI-generated and must be verified against official NOTAMs and local meteorological briefings before departure.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-widest">Plan Synthesis Interrupted</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Neural link failed to establish stable connection for vector analysis.</p>
                </div>
                <button 
                  onClick={() => origin && destination && onGeneratePlan(origin, destination)}
                  className="mt-4 px-6 py-2 rounded-xl bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all font-sans"
                >
                  Retry Generation
                </button>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted Link</span>
              <span className="flex items-center gap-1.5"><Terminal className="w-3 h-3" /> Kernel-V8 Terminal</span>
            </div>
            <div className="flex gap-4">
               <button 
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all font-sans"
                >
                  Dismiss Folder
                </button>
                <button 
                  className={cn(
                    "px-8 py-3 rounded-xl bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] font-sans flex items-center gap-2",
                    (!plan || isLoading) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => plan && window.print()}
                  disabled={!plan || isLoading}
                >
                  <Printer className="w-4 h-4" />
                  Print Briefing
                </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const AirportDetailsModal = ({ 
  isOpen, 
  onClose, 
  airport, 
  currentData, 
  forecast 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  airport: typeof AIRPORTS[0]; 
  currentData: WeatherData;
  forecast: ForecastData[];
}) => {
  const [isNotamsOpen, setIsNotamsOpen] = useState(false);

  if (!isOpen) return null;

  const aiAdvisories = useMemo(() => {
    if (currentData.advisories && currentData.advisories.length > 0) {
      return currentData.advisories;
    }
    
    // Fallback/Default advisories if AI data is sparse
    const base = [
      { 
        type: 'INFO', 
        msg: 'Runway 22/04 operational with visual approach.', 
        source: 'METAR', 
        time: 'CURRENT', 
        impact: 'Standard landing procedures in effect.' 
      }
    ];
    
    if (currentData.notams && currentData.notams.length > 0) {
      return [
        ...currentData.notams.map(n => ({ 
          type: 'NOTAM', 
          msg: n, 
          source: 'FAA/NAMA', 
          time: 'Active', 
          impact: 'Specific local restrictions apply.' 
        })),
        ...base
      ];
    }
    
    return [
      { 
        type: 'WARNING', 
        msg: 'Elevated dust levels expected in the next 4 hours.', 
        source: 'AI PREDICT', 
        time: 'T+4h', 
        impact: 'Potential visibility reduction to 5km.' 
      },
      ...base
    ];
  }, [currentData.advisories, currentData.notams]);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-cyan-500/30 shadow-[0_0_100px_rgba(34,211,238,0.1)]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-cyan-500/20 via-transparent to-transparent">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <Plane className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black tracking-tighter text-white uppercase">{airport.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-widest border border-cyan-400/30 uppercase">
                    {airport.id.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-500 tracking-[0.3em] uppercase flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  {airport.city} • {airport.lat.toFixed(4)}°N {airport.lon.toFixed(4)}°E
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all text-slate-400 hover:text-white group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12 scrollbar-hide">
            {/* Mission Critical Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Temperature', val: currentData.temp.toFixed(1), unit: '°C', icon: Thermometer, color: 'text-rose-400' },
                { label: 'Wind Vector', val: currentData.windSpeed.toFixed(0), unit: `KN ${currentData.windDir}`, icon: Compass, color: 'text-cyan-400' },
                { label: 'Visibility', val: currentData.visibility.toFixed(1), unit: 'KM', icon: Eye, color: 'text-emerald-400' },
                { label: 'Pressure', val: currentData.pressure.toFixed(0), unit: 'HPA', icon: Activity, color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <stat.icon className="w-24 h-24" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 relative z-10">
                    <span className="text-4xl font-black text-white tracking-tighter">{stat.val}</span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tactical Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Forecast Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black tracking-[0.2em] uppercase text-cyan-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    3-Day Weather Outlook
                  </h3>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">METAR Forecast</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {forecast.slice(0, 5).map((f, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-center min-w-[50px]">
                          <span className="block text-[10px] font-black text-cyan-500 tracking-tighter">{f.day}</span>
                          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{f.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-white/5">
                            <CloudRain className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="text-xl font-black text-white tracking-tighter">{f.temp}°C</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.condition}</span>
                        <div className="flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[10px] font-black text-emerald-500">{f.precip}%</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Operational Advisories & NOTAMs */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black tracking-[0.2em] uppercase text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Operational Advisories
                    </h3>
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest px-2 py-0.5 rounded bg-yellow-500/10">Active NTMS</span>
                  </div>
                  <div className="space-y-4">
                    {aiAdvisories.filter(a => a.type !== 'NOTAM').map((a, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className={cn(
                          "p-6 rounded-3xl bg-white/5 border border-white/5 border-l-4 relative overflow-hidden group shadow-2xl transition-all hover:bg-white/10",
                          a.type === 'WARNING' || a.type === 'CRITICAL' ? "border-l-red-500" : "border-l-cyan-500"
                        )}
                      >
                        <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                          {a.type === 'INFO' ? <Activity className="w-32 h-32" /> : <AlertTriangle className="w-32 h-32" />}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-xl border border-opacity-30",
                              a.type === 'WARNING' || a.type === 'CRITICAL' ? "bg-red-500/10 border-red-500 text-red-400" : "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                            )}>
                              {a.type === 'INFO' ? <Activity className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <span className={cn(
                              "text-xs font-black tracking-[0.2em] uppercase",
                              a.type === 'WARNING' || a.type === 'CRITICAL' ? "text-red-400" : "text-cyan-400"
                            )}>{a.type}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{a.time}</span>
                        </div>
                        
                        <p className="text-sm font-bold text-white leading-relaxed mb-4 font-mono">
                          {a.msg}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div>
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Origin Source</span>
                            <span className="block text-[10px] font-black text-slate-300 uppercase">{a.source}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Flight Impact</span>
                            <span className="block text-[10px] font-black text-cyan-500 uppercase leading-snug">{a.impact}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Separate NOTAMs Section */}
                <div className="space-y-4">
                  <button 
                    onClick={() => setIsNotamsOpen(!isNotamsOpen)}
                    className="w-full flex items-center justify-between p-6 rounded-3xl bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
                        <Radio className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-black tracking-[0.2em] uppercase text-yellow-500 flex items-center gap-2">
                        Official NOTAMs
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/20 text-[10px] lowercase font-black tracking-normal">
                          {aiAdvisories.filter(a => a.type === 'NOTAM').length} active
                        </span>
                      </h3>
                    </div>
                    <ChevronDown className={cn("w-5 h-5 text-yellow-500 transition-transform duration-300", isNotamsOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isNotamsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                      >
                        {aiAdvisories.filter(a => a.type === 'NOTAM').length > 0 ? (
                          aiAdvisories.filter(a => a.type === 'NOTAM').map((a, i) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-6 rounded-3xl bg-black/40 border border-yellow-500/10 border-l-4 border-l-yellow-600 relative overflow-hidden group shadow-xl"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded tracking-widest uppercase">NOTAM {i+1}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono italic">{a.source}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-slate-600" />
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{a.time}</span>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-slate-200 leading-relaxed mb-4 font-mono select-all">
                                {a.msg}
                              </p>
                              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <div className="p-1 rounded bg-red-500/10">
                                  <AlertTriangle className="w-3 h-3 text-red-500/70" />
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Impact: </span>
                                <span className="text-[10px] font-black text-yellow-500 uppercase">{a.impact}</span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-3" />
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No restricted NOTAM airspace detected</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                  <div className="p-8 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent border border-cyan-500/20 mt-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-white mb-4">Tactical AI Analysis</h4>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest mb-6">
                      {currentData.recommendation || "Atmospheric stability verified. No microburst threats detected for the flight window. Operational risk is minimal."}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: '92%' }} 
                          className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee]" 
                        />
                      </div>
                      <span className="text-[10px] font-black text-cyan-400">92% CONFIDENCE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
          {/* Footer */}
          <div className="p-8 border-t border-white/5 bg-navy-950/80 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <Radio className="w-5 h-5 text-cyan-500 animate-pulse" />
              </div>
              <div>
                <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1">Telemetry Status</span>
                <span className="block text-xs font-black text-cyan-400 uppercase tracking-widest">Real-Time Sync Active</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="px-12 py-4 rounded-2xl bg-cyan-500 text-white text-xs font-black uppercase tracking-[0.4em] hover:bg-cyan-400 transition-all shadow-[0_10px_40px_rgba(34,211,238,0.4)] hover:-translate-y-1 active:scale-95"
            >
              Acknowledge Briefing
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MapView = ({ airports, selectedAirport, onSelect, currentData, forecast, onGeneratePlan, isGeneratingPlan, generatedPlan, setGeneratedPlan, corridorStart, setCorridorStart }: { 
  airports: typeof AIRPORTS, 
  selectedAirport: typeof AIRPORTS[0], 
  onSelect: (a: typeof AIRPORTS[0]) => void, 
  currentData: WeatherData,
  forecast: ForecastData[],
  onGeneratePlan: (origin: typeof AIRPORTS[0], destination: typeof AIRPORTS[0]) => void,
  isGeneratingPlan: boolean,
  generatedPlan: string | null,
  setGeneratedPlan: (plan: string | null) => void,
  corridorStart: typeof AIRPORTS[0] | null,
  setCorridorStart: (a: typeof AIRPORTS[0] | null) => void
}) => {
  const [viewMode, setViewMode] = useState<'weather' | 'paths'>('weather');
  const [selectedFL, setSelectedFL] = useState<'FL100' | 'FL250' | 'FL400' | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [customPath, setCustomPath] = useState<{x: number, y: number}[]>([]);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{x: number, y: number} | null>(null);
  const [selectionBounds, setSelectionBounds] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hoveredPathId, setHoveredPathId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Northern Nigeria Bounding Box (approx)
  const minLat = 8.5;
  const maxLat = 13.5;
  const minLon = 4.5;
  const maxLon = 11.5;

  const project = (lat: number, lon: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return airports.filter(a => 
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [airports, searchQuery]);

  const handleSelectAirport = (airport: typeof AIRPORTS[0]) => {
    if (viewMode === 'paths' && !selectionBounds) {
      if (!corridorStart) {
        setCorridorStart(airport);
      } else if (corridorStart.id !== airport.id) {
        // Sequential selection defined: Auto-generate Flight Plan
        onSelect(airport); // Update selectedAirport to destination
        onGeneratePlan(corridorStart, airport);
        return; // Skip standard weather modal in path mode
      } else {
        setCorridorStart(null);
      }
    }
    
    // Standard behavior: Select and show details
    onSelect(airport);
    setIsModalOpen(true);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (viewMode !== 'paths') return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const cursorPT = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    setCustomPath(prev => [...prev, { x: cursorPT.x, y: cursorPT.y }]);
  };

  const clearCustomPath = () => setCustomPath([]);

  const getSVGPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    if ('clientX' in e) {
      pt.x = e.clientX;
      pt.y = e.clientY;
    }
    const cursorPT = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: cursorPT.x, y: cursorPT.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === 'paths') return;
    const pt = getSVGPoint(e);
    setDragStart(pt);
    setCurrentDrag(pt);
    setSelectionBounds(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    setCurrentDrag(getSVGPoint(e));
  };

  const handleMouseUp = () => {
    if (dragStart && currentDrag) {
      const dist = Math.sqrt(Math.pow(currentDrag.x - dragStart.x, 2) + Math.pow(currentDrag.y - dragStart.y, 2));
      if (dist > 2) {
        setSelectionBounds({ x1: dragStart.x, y1: dragStart.y, x2: currentDrag.x, y2: currentDrag.y });
      }
    }
    setDragStart(null);
    setCurrentDrag(null);
  };

  const filteredAirports = useMemo(() => {
    if (!selectionBounds) return airports;
    const minX = Math.min(selectionBounds.x1, selectionBounds.x2);
    const maxX = Math.max(selectionBounds.x1, selectionBounds.x2);
    const minY = Math.min(selectionBounds.y1, selectionBounds.y2);
    const maxY = Math.max(selectionBounds.y1, selectionBounds.y2);

    return airports.filter(airport => {
      const { x, y } = project(airport.lat, airport.lon);
      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    });
  }, [airports, selectionBounds]);

  const resetSelection = () => setSelectionBounds(null);

  const selectedPos = useMemo(() => project(selectedAirport.lat, selectedAirport.lon), [selectedAirport, project]);

  const windStreaks = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => 
      Array.from({ length: 12 }).map((_, j) => ({
        x: (i / 11) * 100,
        y: (j / 11) * 100,
        speed: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 2,
        offset: Math.random() * 10
      }))
    ).flat();
  }, []);

  const corridorData = useMemo(() => {
    if (!corridorStart || corridorStart.id === selectedAirport.id) return null;
    const dist = Math.sqrt(Math.pow(selectedAirport.lat - corridorStart.lat, 2) + Math.pow(selectedAirport.lon - corridorStart.lon, 2)) * 60; // nautical miles approx
    const safetyScore = Math.max(20, 100 - (currentData.windSpeed / 2) - (currentData.visibility < 10 ? 20 : 0));
    return { dist, safetyScore };
  }, [corridorStart, selectedAirport, currentData]);

  return (
    <div className="glass-card p-6 relative h-[450px] overflow-hidden group">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Regional Radar Track</h3>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 focus-within:border-cyan-500/50 transition-all w-48">
              <Search className="w-3 h-3 text-slate-500 mr-2" />
              <input 
                type="text" 
                placeholder="FIND AIRPORT (ID/NAME)..."
                className="bg-transparent border-none outline-none text-[9px] text-white w-full placeholder:text-slate-600 font-black uppercase tracking-wider"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)}
              />
            </div>
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-navy-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg z-[100] overflow-hidden shadow-2xl">
                {searchResults.map(a => (
                  <button
                    key={a.id}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[10px] font-bold transition-colors border-b border-white/5 last:border-none flex items-center justify-between group",
                      selectedAirport.id === a.id ? "bg-cyan-500/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-cyan-400"
                    )}
                    onClick={() => {
                      handleSelectAirport(a);
                      setSearchQuery('');
                      setIsSearching(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-cyan-400 group-hover:text-cyan-300 tracking-widest">{a.id.toUpperCase()}</span>
                      <span className="text-[8px] opacity-60 uppercase">{a.name}</span>
                    </div>
                    {selectedAirport.id === a.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            {(['FL100', 'FL250', 'FL400'] as const).map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFL(selectedFL === fl ? null : fl)}
                className={cn(
                  "px-2 py-1 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all",
                  selectedFL === fl ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "text-slate-500 hover:text-amber-400"
                )}
              >
                {fl}
              </button>
            ))}
          </div>

          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setViewMode('weather')}
              className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all", viewMode === 'weather' ? "bg-cyan-500 text-white" : "text-slate-500 hover:text-slate-300")}
            >
              Weather
            </button>
            <button 
              onClick={() => {
                setViewMode('paths');
                setCorridorStart(null); // Reset when entering
              }}
              className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md transition-all", viewMode === 'paths' ? "bg-cyan-500 text-white" : "text-slate-500 hover:text-slate-300")}
            >
              Routes
            </button>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all", showHistory ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" : "border-white/10 text-slate-500")}
          >
            <Clock className="w-3 h-3" />
            History
          </button>
          {customPath.length > 0 && (
            <button 
              onClick={clearCustomPath}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear Path
            </button>
          )}
          {selectionBounds && (
            <button 
              onClick={resetSelection}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 transition-all font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Region
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-cyan-400">
              {viewMode === 'paths' && corridorStart ? `CORRIDOR: ${corridorStart.id} -> ${selectedAirport.id}` : `TRACKING: ${selectedAirport.name}`}
            </span>
            {viewMode === 'paths' && corridorStart && (
              <button 
                onClick={() => setCorridorStart(null)}
                className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                title="CLEAR CORRIDOR"
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full h-[320px] mt-4 overflow-hidden border border-white/5 rounded-xl">
        {/* Corridor Intelligence Overlay */}
        <AnimatePresence>
          {corridorData && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 z-50 glass-card p-3 border-cyan-500/30 bg-navy-950/80 w-48 backdrop-blur-md"
            >
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Corridor Intelligence</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Route</span>
                  <span className="text-[9px] font-black text-white">{corridorStart?.id} » {selectedAirport.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-bold text-slate-500 uppercase">Nautical Miles</span>
                  <span className="text-[9px] font-black text-cyan-400">{corridorData.dist.toFixed(0)} NM</span>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Safety Index</span>
                    <span className={cn("text-[9px] font-black", corridorData.safetyScore > 70 ? "text-green-400" : "text-yellow-400")}>
                      {corridorData.safetyScore}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${corridorData.safetyScore}%` }}
                      className={cn("h-full", corridorData.safetyScore > 70 ? "bg-green-500" : "bg-yellow-500")}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => corridorStart && onGeneratePlan(corridorStart, selectedAirport)}
                  disabled={isGeneratingPlan}
                  className="w-full mt-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:bg-yellow-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingPlan ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                  Generate Flight Plan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Radar HUD (Centered) */}
        {[1, 2, 3].map((r) => (
          <div 
            key={r}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-cyan-500/20 rounded-full pointer-events-none z-20"
            style={{ width: `${r * 30}%`, height: `${r * 30}%` }}
          />
        ))}

        {/* Moving Map Content */}
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            x: `${50 - selectedPos.x}%`, 
            y: `${50 - selectedPos.y}%` 
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        >
          {/* Grid Pattern Background (Moves with map) */}
          <div className="absolute inset-[-100%] opacity-10 pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />

          <svg 
            ref={svgRef}
            onClick={(e) => {
              if (viewMode === 'paths') handleMapClick(e);
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="w-full h-full relative z-10 select-none" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
          <defs>
            <pattern id="turbulencePattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <path 
                d="M 0 5 Q 2.5 0 5 5 T 10 5" 
                fill="none" 
                stroke="white" 
                strokeWidth="0.2" 
                className="opacity-20 translate-y-[-1px]"
              >
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  from="0 0" 
                  to="10 0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </path>
              <path 
                d="M 0 7 Q 2.5 2 5 7 T 10 7" 
                fill="none" 
                stroke="white" 
                strokeWidth="0.1" 
                className="opacity-10"
              >
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  from="10 0" 
                  to="0 0" 
                  dur="5s" 
                  repeatCount="indefinite" 
                />
              </path>
            </pattern>
          </defs>

          {/* Connection Lines (stylized) */}
          <path d="M 20,20 L 80,80" className="stroke-cyan-500/5 stroke-[0.1] fill-none" />
          <path d="M 20,80 L 80,20" className="stroke-cyan-500/5 stroke-[0.1] fill-none" />

          {/* Kinetic Wind Field */}
          <g className="pointer-events-none">
            {windStreaks.map((streak, idx) => {
              // Extract bearing from current data (e.g. "NE" -> angle)
              const getAngle = (dir: string) => {
                const dirs: Record<string, number> = { 'N': 0, 'NE': 45, 'E': 90, 'SE': 135, 'S': 180, 'SW': 225, 'W': 270, 'NW': 315 };
                return dirs[dir] ?? 45;
              };
              const angle = getAngle(currentData.windDir);

              return (
                <motion.line
                  key={`wind-${idx}`}
                  x1={streak.x}
                  y1={streak.y}
                  x2={streak.x + 1.2}
                  y2={streak.y}
                  className="stroke-cyan-400/20 stroke-[0.04]"
                  animate={{ 
                    x: [0, 2],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{ 
                    duration: 3 / (currentData.windSpeed / 10 || 1),
                    repeat: Infinity,
                    ease: "linear",
                    delay: streak.delay
                  }}
                  style={{ 
                    transformOrigin: `${streak.x}px ${streak.y}px`,
                    rotate: `${angle - 90}deg` 
                  }}
                />
              );
            })}
          </g>

          {/* Turbulence Zones */}
          {currentData.windSpeed > 10 && [
            { id: 1, x: 25, y: 30, r: 15 },
            { id: 2, x: 70, y: 55, r: 20 },
            { id: 3, x: 45, y: 75, r: 12 }
          ].map(zone => (
            <motion.circle
              key={`turb-${zone.id}`}
              cx={zone.x}
              cy={zone.y}
              r={zone.r}
              fill="url(#turbulencePattern)"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: Math.min(0.4, (currentData.windSpeed - 10) / 40),
                scale: [1, 1.05, 1],
              }}
              transition={{
                opacity: { duration: 1 },
                scale: { duration: 4 + zone.id, repeat: Infinity, ease: "linear" }
              }}
              className="pointer-events-none"
            />
          ))}

          {/* Altitude Level Overlays */}
          <AnimatePresence>
            {selectedFL && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none"
              >
                {/* Simulated Air Traffic Density */}
                {(() => {
                  const seed = selectedFL === 'FL100' ? 42 : selectedFL === 'FL250' ? 108 : 202;
                  const density = selectedFL === 'FL250' ? 40 : 20; // FL250 is busiest
                  return Array.from({ length: density }).map((_, i) => {
                    const x = (Math.sin(i * seed + seed) * 0.5 + 0.5) * 100;
                    const y = (Math.cos(i * seed * 1.5) * 0.5 + 0.5) * 100;
                    return (
                      <motion.g key={`traffic-${i}`}>
                        <circle cx={x} cy={y} r="0.3" className="fill-white/80" />
                        <circle cx={x} cy={y} r="1.5" className="fill-white/10" />
                        <text x={x + 1} y={y - 1} className="fill-white/50 text-[1.2px] font-bold">
                          TRFC {selectedFL}
                        </text>
                      </motion.g>
                    );
                  });
                })()}

                {/* Weather Phenomena Zones */}
                {(() => {
                  const zones = [
                    { fl: 'FL100', type: 'PRECIP', x: 20, y: 20, r: 15, color: '#22c55e' }, // Green
                    { fl: 'FL100', type: 'PRECIP', x: 25, y: 25, r: 10, color: '#ef4444' }, // Red heavy
                    { fl: 'FL250', type: 'ICE', x: 60, y: 40, r: 25, color: '#0ea5e9' },    // blue icing
                    { fl: 'FL400', type: 'TURB', x: 40, y: 70, r: 20, color: '#f59e0b' }    // amber turbulence
                  ].filter(z => z.fl === selectedFL);

                  return zones.map((zone, i) => (
                    <g key={`phenom-${i}`}>
                      <defs>
                        <radialGradient id={`grad-${i}`}>
                          <stop offset="0%" stopColor={zone.color} stopOpacity="0.4" />
                          <stop offset="100%" stopColor={zone.color} stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx={zone.x} cy={zone.y} r={zone.r} fill={`url(#grad-${i})`} />
                      <text x={zone.x} y={zone.y} textAnchor="middle" className="fill-white text-[2px] font-black uppercase tracking-tighter opacity-40">
                        {zone.type}
                      </text>
                    </g>
                  ));
                })()}

                {/* Legend Overlay on Map */}
                <foreignObject x="5" y="85" width="40" height="15">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                      <span className="text-[5px] text-white/60 font-black uppercase">Traffic Density: {selectedFL === 'FL250' ? 'HIGH' : 'MODERATE'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-60" />
                      <span className="text-[5px] text-white/60 font-black uppercase">{selectedFL}: PHENOMENA REPORTED</span>
                    </div>
                  </div>
                </foreignObject>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Flight Paths */}
          <AnimatePresence>
            {viewMode === 'paths' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {airports.map((airport, i) => {
                  if (airport.id === selectedAirport.id) return null;
                  const start = project(selectedAirport.lat, selectedAirport.lon);
                  const end = project(airport.lat, airport.lon);
                  
                  // Curved paths using quadratic bezier
                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2 - 5; // Offset for curve
                  
                  const isHovered = hoveredPathId === airport.id;
                  const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
                  const travelMinutes = Math.round(dist * 3.2); // ~3.2 mins per map unit for Cessna 172

                  const isCorridor = corridorStart && (airport.id === corridorStart.id || airport.id === selectedAirport.id);

                  return (
                    <g 
                      key={`path-${airport.id}`}
                      onMouseEnter={() => setHoveredPathId(airport.id)}
                      onMouseLeave={() => setHoveredPathId(null)}
                      className="cursor-crosshair"
                    >
                      {/* Invisible wider hit area for easier hovering */}
                      <path
                        d={`M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`}
                        className="stroke-transparent stroke-[6] fill-none"
                      />
                      
                      {/* Corridor Line if active */}
                      {corridorStart && airport.id === corridorStart.id && (
                        <motion.path
                          d={`M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`}
                          className="stroke-cyan-400 stroke-[6] opacity-20 fill-none blur-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                        />
                      )}
                      
                      {/* Base Path with Glow effect on hover */}
                      {isHovered && (
                        <motion.path
                          d={`M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`}
                          className="stroke-cyan-400 opacity-60 stroke-[5] fill-none blur-[2px]"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                      
                      <motion.path
                        d={`M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`}
                        className={cn(
                          "transition-all duration-300 fill-none",
                          isHovered ? "stroke-cyan-200 stroke-[1.8] opacity-100" : "stroke-cyan-500/20 stroke-[0.2]"
                        )}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                      />
                      
                      {/* Animated Signal */}
                      <motion.circle r={isHovered ? "1.2" : "0.4"} className={cn("transition-all duration-300", isHovered ? "fill-white" : "fill-cyan-400 shadow-[0_0_8px_white]")}>
                        <animateMotion 
                          path={`M ${start.x},${start.y} Q ${midX},${midY} ${end.x},${end.y}`} 
                          dur={isHovered ? "0.6s" : `${2 + Math.random()}s`} 
                          repeatCount="indefinite" 
                        />
                      </motion.circle>
                      
                      {/* Interactive Tooltip */}
                      {isHovered && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0.9, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="pointer-events-none"
                        >
                          <rect 
                            x={midX - 22} y={midY - 20} 
                            width="44" height="18" 
                            rx="2" 
                            className="fill-navy-950/98 stroke-cyan-400 stroke-[0.5] shadow-2xl" 
                          />
                          <text x={midX} y={midY - 15} textAnchor="middle" className="fill-cyan-300 text-[3.5px] font-black uppercase tracking-[0.2em]">
                            {selectedAirport.id.toUpperCase()} ✈ {airport.id.toUpperCase()}
                          </text>
                          <text x={midX} y={midY - 10} textAnchor="middle" className="fill-white text-[2.5px] font-bold">
                            EST. ETE: {Math.floor(travelMinutes / 60)}h {travelMinutes % 60}m
                          </text>
                          <text x={midX} y={midY - 6} textAnchor="middle" className="fill-emerald-400 text-[2px] font-black tracking-widest uppercase">
                            ● STATUS: ON TRACK
                          </text>
                        </motion.g>
                      )}
                      
                      {/* Historical ghost paths if enabled */}
                      {showHistory && (
                         <path
                          d={`M ${start.x},${start.y} Q ${midX-2},${midY+2} ${end.x},${end.y}`}
                          className="stroke-slate-500/10 stroke-[0.1] fill-none border-dashed"
                          strokeDasharray="0.5 0.5"
                        />
                      )}
                    </g>
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Custom Drawn Path */}
          {customPath.length > 0 && (
            <g>
              <motion.path
                d={`M ${customPath.map(p => `${p.x},${p.y}`).join(' L ')}`}
                className="stroke-orange-500 stroke-[0.3] fill-none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />
              {customPath.map((p, i) => (
                <g key={`custom-pt-${i}`}>
                   <circle cx={p.x} cy={p.y} r="0.6" className="fill-orange-400" />
                   {/* Weather simulation along path every 2nd point */}
                   {i % 2 === 0 && (
                      <g className="pointer-events-none">
                        <rect x={p.x + 1} y={p.y - 6} width="12" height="6" rx="0.5" className="fill-orange-950/80 stroke-orange-500/40 stroke-[0.1]" />
                        <text x={p.x + 2} y={p.y - 4} className="fill-orange-400 text-[1.5px] font-bold uppercase tracking-tight">
                          {(currentData.temp + (p.x / 10) - 5).toFixed(1)}°C
                        </text>
                        <text x={p.x + 2} y={p.y - 2.5} className="fill-slate-400 text-[1.2px] font-medium uppercase">
                          WIND: {Math.max(0, currentData.windSpeed + (p.y / 5) - 10).toFixed(0)}KN
                        </text>
                      </g>
                   )}
                </g>
              ))}
            </g>
          )}

          {/* Bounding Box Drawing */}
          {dragStart && currentDrag && (
            <rect 
              x={Math.min(dragStart.x, currentDrag.x)}
              y={Math.min(dragStart.y, currentDrag.y)}
              width={Math.abs(currentDrag.x - dragStart.x)}
              height={Math.abs(currentDrag.y - dragStart.y)}
              className="fill-cyan-500/10 stroke-cyan-500/50 stroke-[0.2] stroke-dasharray-[1,1]"
            />
          )}

          {/* Active Selection Bounds */}
          {selectionBounds && (
             <rect 
              x={Math.min(selectionBounds.x1, selectionBounds.x2)}
              y={Math.min(selectionBounds.y1, selectionBounds.y2)}
              width={Math.abs(selectionBounds.x2 - selectionBounds.x1)}
              height={Math.abs(selectionBounds.y2 - selectionBounds.y1)}
              className="fill-cyan-500/5 stroke-cyan-500/30 stroke-[0.3]"
            />
          )}

          {filteredAirports.map((airport) => {
            const { x, y } = project(airport.lat, airport.lon);
            const isSelected = airport.id === selectedAirport.id;

            return (
              <g key={airport.id} onClick={() => handleSelectAirport(airport)} className="cursor-pointer">
                {/* Marker Glow */}
                {(isSelected || (corridorStart && corridorStart.id === airport.id)) && (
                  <motion.circle
                    layoutId={isSelected ? "glow" : `corridor-glow-${airport.id}`}
                    cx={x}
                    cy={y}
                    r="4"
                    className={cn(isSelected ? "fill-cyan-400/20" : "fill-yellow-400/20")}
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                
                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected || (corridorStart && corridorStart.id === airport.id) ? "1.5" : "0.8"}
                  className={cn(
                    "transition-all duration-300",
                    isSelected ? "fill-cyan-400" : (corridorStart && corridorStart.id === airport.id) ? "fill-yellow-400" : "fill-slate-600 hover:fill-slate-400"
                  )}
                />

                {/* Data Label removed in favor of Modal */}
              </g>
            );
          })}
        </svg>

        {/* Scanning Line Animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent blur-sm animate-[scan_4s_linear_infinite]" />
      </motion.div>

      {/* Airport Details Modal */}
      <AirportDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        airport={selectedAirport}
        currentData={currentData}
        forecast={forecast}
      />
    </div>
  </div>
);
};

export default function App() {
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS[0]);
  const [history, setHistory] = useState<WeatherData[]>(generateMockHistory(12));
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [corridorStart, setCorridorStart] = useState<typeof AIRPORTS[0] | null>(null);
  
  const lastAlertRef = React.useRef<string | null>(null);
  const current = history[history.length - 1];

  // Simulation controls
  const triggerEmergency = () => {
    setHistory(prev => {
      const last = prev[prev.length - 1];
      
      // Simulate real-world Wind Shear / Microburst:
      // 1. Directional shift (180 degree flip)
      // 2. Severe velocity spike (>45kn)
      // 3. Pressure drop (Rapid atmospheric instability)
      
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const currentIndex = directions.indexOf(last.windDir) !== -1 ? directions.indexOf(last.windDir) : 0;
      const flippedDir = directions[(currentIndex + 4) % directions.length];
      
      const emergency: WeatherData = {
        ...last,
        windSpeed: 42.5, 
        windDir: flippedDir,
        visibility: 1.2,
        pressure: last.pressure - 12,
        description: 'SEVERE BRAKING ACTION / MICROBURST',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'mock'
      };
      return [...prev.slice(1), emergency];
    });
  };

  // Request Notification Permission
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const generateAudioBriefing = async () => {
    if (!aiRecommendation || isAudioLoading) return;
    
    setIsAudioLoading(true);
    try {
      const resp = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Provide a professional, clear, and reassuring audio briefing for airport operations based on this recommendation: ${aiRecommendation}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = resp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Convert Little Endian 16-bit PCM to Float32
        const int16Buffer = new Int16Array(bytes.buffer);
        const float32Buffer = new Float32Array(int16Buffer.length);
        for (let i = 0; i < int16Buffer.length; i++) {
          float32Buffer[i] = int16Buffer[i] / 32768.0;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, 24000);
        audioBuffer.getChannelData(0).set(float32Buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.error("Audio Briefing generation failed:", error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const generateFlightPlan = async (origin: typeof AIRPORTS[0] | null, dest: typeof AIRPORTS[0]) => {
    if (!origin) return;
    setIsGeneratingPlan(true);
    setGeneratedPlan(null);
    setIsPlanModalOpen(true);
    
    const currentDestWeather = current.source === 'live' ? current : history[history.length - 1];
    const destAdvisories = currentDestWeather.advisories?.map(a => `${a.type}: ${a.msg}`).join('; ') || 'None reported';
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As an Aviation Tactical Intelligence AI, generate a comprehensive Flight Plan Briefing for a cross-country corridor flight.
        
        CORRIDOR DATA:
        - ORIGIN: ${origin.name} (${origin.id})
        - DESTINATION: ${dest.name} (${dest.id})
        - DESTINATION WEATHER: ${JSON.stringify(currentDestWeather)}
        - ACTIVE ADVISORIES/NOTAMs: ${destAdvisories}
        
        CRITICAL REQUIREMENTS:
        Your response MUST be in structured Markdown and include the following sections exactly:
        1. # PILOT COMMAND SUMMARY (Brief overview of the mission)
        2. ## RECOMMENDED FLIGHT PARAMETERS
           - **Cruising Altitude**: (Specify FL based on wind and terrain)
           - **Route Bearing**: (Compass heading vector)
           - **Est. Fuel Requirement**: (Liters for a Cessna 172 Skyhawk)
        3. ## METEOROLOGICAL CORRIDOR ANALYSIS
           - **Weather Risk level**: (LOW/MEDIUM/HIGH) - Explain why.
           - Impact of destination conditions on landing.
        4. ## OPERATIONAL INTELLIGENCE BRIEFING
           - Tactical advice for the pilot.
           - Contingency plans for reported advisories.
        5. ## MISSION VERDICT
           - Final recommendation (GO / NO-GO / PROCEED WITH CAUTION)

        Use a technical, precise, and authoritative tone suitable for a professional aviation environment. 
        Focus on safety first. Return the result in clear markdown with headings and bold keys.`,
      });
      setGeneratedPlan(response.text || "Failed to synthesize operational intelligence.");
    } catch (error) {
      console.error("Flight plan generation failed:", error);
      setGeneratedPlan(null);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Fetch Live Weather using Gemini Search Grounding
  const fetchLiveIntelligence = useCallback(async () => {
    setIsLiveLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Get the current weather and 3 active NOTAMs/Advisories for ${selectedAirport.name} in ${selectedAirport.city}. Return the data in JSON format with fields: temp (Celsius), windSpeed (knots), windDir (Compass e.g. NE), pressure (hPa), description (Short string e.g. 'Partial Fog'), humidity (percentage), visibility (km), an array of 'advisories' (objects with: type [INFO/WARNING/NOTAM], msg, source [e.g. METAR, NAMA], time, impact), and a short 'recommendation' for aviation operations.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              windSpeed: { type: Type.NUMBER },
              windDir: { type: Type.STRING },
              pressure: { type: Type.NUMBER },
              description: { type: Type.STRING },
              humidity: { type: Type.NUMBER },
              visibility: { type: Type.NUMBER },
              advisories: { 
                type: Type.ARRAY,
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    msg: { type: Type.STRING },
                    source: { type: Type.STRING },
                    time: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  },
                  required: ["type", "msg", "source", "time", "impact"]
                }
              },
              recommendation: { type: Type.STRING }
            },
            required: ["temp", "windSpeed", "windDir", "pressure", "description", "humidity", "visibility", "advisories", "recommendation"]
          }
        }
      });

      const data = JSON.parse(response.text);
      
      const next: WeatherData = {
        temp: data.temp,
        windSpeed: data.windSpeed,
        windDir: data.windDir,
        pressure: data.pressure,
        description: data.description,
        humidity: data.humidity,
        visibility: data.visibility,
        advisories: data.advisories,
        recommendation: data.recommendation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'live'
      };

      setHistory(prev => [...prev.slice(1), next]);
      setAiRecommendation(data.recommendation);
    } catch (error) {
      console.error("Failed to fetch live intelligence:", error);
    } finally {
      setIsLiveLoading(false);
    }
  }, [selectedAirport]);

  // Trigger intelligence fetch when airport changes
  useEffect(() => {
    fetchLiveIntelligence();
  }, [selectedAirport.id, fetchLiveIntelligence]);

  // Simulate real-time updates (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (current.source === 'live') return; // Don't overwrite live data with mock
      
      setHistory(prev => {
        const last = prev[prev.length - 1];
        const next: WeatherData = {
          temp: Math.max(10, Math.min(35, last.temp + (Math.random() - 0.5) * 0.5)),
          windSpeed: Math.max(0, Math.min(40, last.windSpeed + (Math.random() - 0.5) * 2)),
          windDir: last.windDir,
          pressure: Math.max(1000, Math.min(1030, last.pressure + (Math.random() - 0.5) * 0.5)),
          description: last.description,
          humidity: Math.max(20, Math.min(95, last.humidity + (Math.random() - 0.5) * 5)),
          visibility: Math.max(2, Math.min(15, last.visibility + (Math.random() - 0.5) * 0.2)),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'mock'
        };
        return [...prev.slice(1), next];
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [current.source]);

  // Operational Score Logic
  const operationalScore = useMemo(() => {
    let score = 100;
    if (current.windSpeed > 20) score -= (current.windSpeed - 20) * 2;
    if (current.visibility < 10) score -= (10 - current.visibility) * 5;
    if (current.humidity > 80) score -= (current.humidity - 80) * 0.5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [current]);

  const riskStatus = useMemo(() => {
    const last = history[history.length - 2];
    
    // Detect Wind Shear through rapid velocity/directional delta
    const hasRapidSpike = last && (Math.abs(current.windSpeed - last.windSpeed) > 15);
    const hasDirectionShift = last && current.windDir !== last.windDir && current.windSpeed > 20;

    // Priority 1: Wind Shear (Emergency)
    if (current.windSpeed > 35 || hasRapidSpike || hasDirectionShift) return { 
      label: 'WIND SHEAR ALERT', 
      color: 'text-red-500', 
      glow: 'neon-glow-red', 
      bg: 'bg-red-600/20', 
      border: 'border-red-500',
      animate: 'animate-glow-red',
      iconClass: 'animate-icon-pulse-red',
      icon: AlertTriangle,
      message: "Critical wind shear detected. Intense turbulence likely. Rapid directional shifts in the low-level corridor. Holding patterns or alternate departure/approach routes mandatory."
    };

    // Priority 2: Low Visibility
    if (current.visibility < 5) return {
      label: 'LOW VISIBILITY',
      color: 'text-red-400',
      glow: 'neon-glow-red',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      animate: 'animate-glow-red',
      iconClass: 'animate-icon-pulse-red',
      icon: EyeOff,
      message: "Visibility below safety minimums (5km). Instrument Flight Rules (IFR) in effect. Expect significant approach delays."
    };

    // Priority 3: High Winds
    if (current.windSpeed > 25) return {
      label: 'HIGH WINDS',
      color: 'text-yellow-400',
      glow: 'neon-glow-yellow',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      animate: 'animate-glow-yellow',
      iconClass: '',
      icon: Wind,
      message: "Strong surface winds detected (>25kn). High-profile aircraft and light trainers should exercise caution during landing."
    };

    // Priority 4: High Humidity
    if (current.humidity > 90) return {
      label: 'HIGH HUMIDITY',
      color: 'text-cyan-400',
      glow: 'neon-glow-cyan',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      animate: '',
      iconClass: 'icon-glow-green',
      icon: CloudRain,
      message: "Relative humidity above 90%. Increased risk of rapid fog formation or engine performance variation. Monitor dew point spread."
    };

    // Fallback: General Scores
    if (operationalScore > 80) return { 
      label: 'NORMAL OPERATIONS', 
      color: 'text-green-400', 
      glow: 'glow-green-subtle', 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/20',
      animate: '',
      iconClass: 'icon-glow-green',
      icon: CheckCircle2,
      message: "Weather conditions are optimal for all standard flight operations."
    };

    if (operationalScore > 40) return { 
      label: 'RESTRICTED OPERATIONS', 
      color: 'text-yellow-400', 
      glow: 'neon-glow-yellow', 
      bg: 'bg-yellow-500/10', 
      border: 'border-yellow-500/20',
      animate: 'animate-glow-yellow',
      iconClass: '',
      icon: AlertTriangle,
      message: "Caution advised. Some regional flights may experience minor delays due to environmental factors."
    };

    return { 
      label: 'HIGH RISK – DELAY ADVISED', 
      color: 'text-red-400', 
      glow: 'neon-glow-red', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      animate: 'animate-glow-red',
      iconClass: 'animate-icon-pulse-red',
      icon: AlertTriangle,
      message: "Severe weather detected. Ground stop or significant delays highly likely for Northern operations."
    };
  }, [operationalScore, current.windSpeed, current.visibility, current.humidity]);

  // Monitor and fire notifications
  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window)) return;

    const isCritical = riskStatus.label.includes('ALERT') || 
                      riskStatus.label.includes('HIGH') || 
                      riskStatus.label.includes('LOW VISIBILITY');

    if (isCritical && lastAlertRef.current !== riskStatus.label) {
      new Notification(`SYSTEM ALERT: ${riskStatus.label}`, {
        body: riskStatus.message,
        icon: '/favicon.ico', // Fallback icon
        tag: 'weather-alert',
        silent: false,
      });
      lastAlertRef.current = riskStatus.label;
    } else if (!isCritical) {
      lastAlertRef.current = riskStatus.label;
    }
  }, [riskStatus, notificationsEnabled]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  const tempChartData = {
    labels: history.map(h => h.timestamp),
    datasets: [{
      label: 'Temperature',
      data: history.map(h => h.temp),
      borderColor: '#22d3ee',
      backgroundColor: 'rgba(34, 211, 238, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  const windChartData = {
    labels: history.map(h => h.timestamp),
    datasets: [{
      label: 'Wind Speed',
      data: history.map(h => h.windSpeed),
      borderColor: '#facc15',
      backgroundColor: 'rgba(250, 204, 21, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Plane className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">
              Airport Weather <span className="text-cyan-400">Intelligence</span> System
            </h1>
          </div>
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500 ml-11">
            Case Study: Northern Nigeria Aviation Operations
          </p>
          <div className="flex items-center gap-2 mt-3 ml-11">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black tracking-widest uppercase text-cyan-400">
              Region: Northern Nigeria
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={toggleNotifications}
            className={cn(
              "p-2.5 rounded-xl border transition-all flex items-center gap-2 px-4 py-2.5",
              notificationsEnabled 
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" 
                : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
            )}
            title={notificationsEnabled ? "Disable Alerts" : "Enable Alerts"}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="text-[10px] font-black tracking-widest uppercase truncate max-w-[80px]">
              {notificationsEnabled ? 'ALERTS ON' : 'ALERTS OFF'}
            </span>
          </button>

          <button 
            onClick={triggerEmergency}
            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-2 px-4 py-2.5"
            title="Simulate Critical Alert"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-widest uppercase truncate max-w-[80px]">
              TEST EMG
            </span>
          </button>

          <button 
            onClick={fetchLiveIntelligence}
            disabled={isLiveLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-black tracking-widest uppercase text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isLiveLoading && "animate-spin")} />
            {isLiveLoading ? 'Grounding...' : 'Fetch Live Intel'}
          </button>

          <div className="relative group">
            <select 
              value={selectedAirport.id}
              onChange={(e) => setSelectedAirport(AIRPORTS.find(a => a.id === e.target.value) || AIRPORTS[0])}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
            >
              {AIRPORTS.map(a => (
                <option key={a.id} value={a.id} className="bg-navy-900">{a.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-cyan-400 transition-colors" />
          </div>

          <div className="flex gap-2">
            <StatusIndicator label="API" status={current.source === 'live' ? "GROUNDED" : "LIVE"} colorClass={current.source === 'live' ? "bg-cyan-400" : "bg-green-500"} />
            <StatusIndicator label="ML" status="READY" colorClass="bg-blue-500" />
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {/* Row 1: Weather Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <WeatherCard 
            icon={Thermometer} 
            label="Temperature" 
            value={current.temp.toFixed(1)} 
            unit="°C" 
            trend="+1.2"
            subLabel="Pressure"
            subValue={`${current.pressure.toFixed(0)} hPa`}
          />
          <WeatherCard 
            icon={Wind} 
            label="Wind Speed" 
            value={current.windSpeed.toFixed(1)} 
            unit="kn" 
            trend="-2.4" 
            subLabel="Direction"
            subValue={current.windDir}
          />
          <WeatherCard 
            icon={Droplets} 
            label="Humidity" 
            value={current.humidity.toFixed(0)} 
            unit="%" 
            subLabel="Conditions"
            subValue={current.description}
          />
          <WeatherCard 
            icon={Eye} 
            label="Visibility" 
            value={current.visibility.toFixed(1)} 
            unit="km" 
            subLabel="Status"
            subValue={current.visibility > 10 ? 'VFR' : 'IFR'}
          />
          
          {/* Operational Score Card */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -4 }}
            className="glass-card p-6 flex flex-col justify-between min-h-[160px] border-cyan-500/30 bg-cyan-500/5"
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", riskStatus.bg, riskStatus.color)}>
                {operationalScore > 80 ? 'GOOD' : operationalScore > 40 ? 'WARNING' : 'CRITICAL'}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter text-white neon-glow-cyan">{operationalScore}%</span>
              </div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mt-1">Operational Score</p>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Map Component */}
        <MapView 
          airports={AIRPORTS}
          selectedAirport={selectedAirport}
          onSelect={setSelectedAirport}
          currentData={current}
          forecast={FORECAST}
          onGeneratePlan={generateFlightPlan}
          isGeneratingPlan={isGeneratingPlan}
          generatedPlan={generatedPlan}
          setGeneratedPlan={setGeneratedPlan}
          corridorStart={corridorStart}
          setCorridorStart={setCorridorStart}
        />

        <FlightPlanModal 
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          plan={generatedPlan}
          isLoading={isGeneratingPlan}
          origin={corridorStart}
          destination={selectedAirport}
          onGeneratePlan={generateFlightPlan}
        />

        {/* Row 2: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Temperature Trend</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500">LAST 12 HOURS</span>
            </div>
            <div className="h-[240px]">
              <Line data={tempChartData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Wind Speed Trend</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500">LAST 12 HOURS</span>
            </div>
            <div className="h-[240px]">
              <Line data={windChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Row 3: Alert Panel & Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Panel */}
          <div className={cn("lg:col-span-1 glass-card p-8 flex flex-col items-center justify-center text-center border-2", riskStatus.border, riskStatus.bg, riskStatus.animate)}>
            <div className={cn("p-4 rounded-full mb-6", riskStatus.bg, riskStatus.border)}>
              <riskStatus.icon className={cn("w-12 h-12 transition-all duration-500", riskStatus.color, riskStatus.iconClass)} />
            </div>
            <h2 className={cn("text-2xl font-black tracking-tighter mb-2 uppercase", riskStatus.color, riskStatus.glow)}>
              {riskStatus.label}
            </h2>
            <p className="text-sm font-medium text-slate-400 max-w-[240px]">
              {riskStatus.message}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <BrainCircuit className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">AI Recommendation</span>
              </div>
              {aiRecommendation ? (
                <div className="flex flex-col items-center gap-4">
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-medium text-cyan-400 leading-relaxed max-w-[280px]"
                  >
                    "{aiRecommendation}"
                  </motion.p>
                  <button 
                    onClick={generateAudioBriefing}
                    disabled={isAudioLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black tracking-widest uppercase text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {isAudioLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                    {isAudioLoading ? 'Synthesizing...' : 'Generate Audio Briefing'}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Awaiting Grounding Data...</p>
              )}
            </div>
          </div>

          {/* Forecast Table */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-6 border-bottom border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black tracking-widest uppercase text-slate-400">Operational Forecast</h3>
              </div>
              <button className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">View Full Report</button>
            </div>
            <div className="overflow-x-auto h-[400px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-20 bg-navy-900">
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Day / Time</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Condition</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Temp</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Wind</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Precip %</th>
                    <th className="px-6 py-4 text-[10px] font-black tracking-widest uppercase text-slate-500">Ops Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {FORECAST.map((item, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase">{item.day}</span>
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{item.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-400">{item.condition}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-white">{item.temp}°C</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-400">{item.wind} kn</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Droplets className="w-3 h-3 text-cyan-400" />
                          <span className={cn("text-sm font-bold", item.precip > 50 ? "text-cyan-400" : "text-slate-400")}>{item.precip}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.wind > 25 ? "bg-red-400" : item.wind > 15 ? "bg-yellow-400" : "bg-green-400")} />
                          <span className={cn("text-[10px] font-black tracking-widest uppercase", item.wind > 25 ? "text-red-400" : item.wind > 15 ? "text-yellow-400" : "text-green-400")}>
                            {item.wind > 25 ? 'HIGH' : item.wind > 15 ? 'MED' : 'LOW'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
          © 2026 Airport Weather Intelligence System | Secure Terminal Access
        </p>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Documentation</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Support</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">System Logs</span>
        </div>
      </footer>
    </div>
  );
}
