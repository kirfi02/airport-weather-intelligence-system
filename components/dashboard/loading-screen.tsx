"use client"

import { useEffect, useState } from "react"
import { AirportWeatherLogo } from "./airport-weather-logo"

interface LoadingScreenProps {
  onComplete: () => void
}

const LOADING_STEPS = [
  { message: "Loading local weather data...", duration: 800 },
  { message: "Loading Northern Nigeria airport data...", duration: 600 },
  { message: "Initializing AI decision support...", duration: 700 },
  { message: "Rendering dashboard...", duration: 500 },
]

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    let stepIndex = 0
    let progressValue = 0

    const runLoadingSequence = () => {
      if (stepIndex >= LOADING_STEPS.length) {
        setIsFadingOut(true)
        setTimeout(onComplete, 500)
        return
      }

      setCurrentStep(stepIndex)
      const step = LOADING_STEPS[stepIndex]
      const targetProgress = ((stepIndex + 1) / LOADING_STEPS.length) * 100

      const progressInterval = setInterval(() => {
        progressValue += 2
        if (progressValue >= targetProgress) {
          progressValue = targetProgress
          clearInterval(progressInterval)
        }
        setProgress(progressValue)
      }, step.duration / 50)

      setTimeout(() => {
        stepIndex++
        runLoadingSequence()
      }, step.duration)
    }

    const startDelay = setTimeout(runLoadingSequence, 300)

    return () => clearTimeout(startDelay)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background ${
        isFadingOut ? "fade-out" : ""
      }`}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="relative">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary/30"
              style={{
                width: `${i * 150}px`,
                height: `${i * 150}px`,
                left: `${-i * 75}px`,
                top: `${-i * 75}px`,
              }}
            />
          ))}
          <div
            className="absolute w-[300px] h-[300px] radar-sweep"
            style={{ left: "-150px", top: "-150px" }}
          >
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
              style={{
                background:
                  "linear-gradient(90deg, rgba(56, 189, 248, 0.8), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="rounded-full bg-primary/10 p-4 neon-border">
              <AirportWeatherLogo className="h-20 w-20" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/50 radar-ping" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground neon-text font-mono tracking-wider">
          AIRPORT WEATHER INTELLIGENCE
        </h1>
        <p className="mb-8 text-sm text-primary/60 font-mono uppercase tracking-widest">
          System Initialization
        </p>

        <div className="mb-6">
          <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300 progress-glow"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-mono text-muted-foreground">
            <span>LOADING</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="h-8">
          {LOADING_STEPS.map((step, index) => (
            <p
              key={index}
              className={`text-sm font-mono transition-all duration-300 ${
                index === currentStep
                  ? "text-primary typing-effect"
                  : index < currentStep
                    ? "text-green-400 hidden"
                    : "text-muted-foreground/50 hidden"
              }`}
            >
              {index === currentStep && "> "}
              {step.message}
            </p>
          ))}
        </div>

        <div className="mt-4 space-y-1">
          {LOADING_STEPS.slice(0, currentStep).map((step, index) => (
            <p
              key={index}
              className="text-xs font-mono text-green-400/60 fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              [OK] {step.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
