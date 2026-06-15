"use client"

import { useCallback, useRef, useState } from "react"

type RiskLevelType = "normal" | "restricted" | "high"

export function useSoundAlerts() {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const previousRiskRef = useRef<RiskLevelType | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context on first user interaction
  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    setHasInteracted(true)
  }, [])

  // Generate a beep sound using Web Audio API
  const playBeep = useCallback((frequency: number, duration: number, volume: number = 0.3) => {
    if (!soundEnabled || !audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    // Envelope for smoother sound
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }, [soundEnabled])

  // Play different sounds based on risk level
  const playAlertSound = useCallback((riskLevel: RiskLevelType) => {
    if (!soundEnabled || !hasInteracted) return

    switch (riskLevel) {
      case "normal":
        // Soft confirmation tone (optional)
        playBeep(800, 0.1, 0.15)
        break
      case "restricted":
        // Warning beep - two short beeps
        playBeep(600, 0.15, 0.25)
        setTimeout(() => playBeep(600, 0.15, 0.25), 200)
        break
      case "high":
        // Alert beep - three urgent beeps
        playBeep(400, 0.2, 0.35)
        setTimeout(() => playBeep(500, 0.2, 0.35), 250)
        setTimeout(() => playBeep(400, 0.3, 0.35), 500)
        break
    }
  }, [soundEnabled, hasInteracted, playBeep])

  // Check if risk level changed and play appropriate sound
  const checkRiskChange = useCallback((currentRisk: RiskLevelType) => {
    if (previousRiskRef.current !== null && previousRiskRef.current !== currentRisk) {
      playAlertSound(currentRisk)
    }
    previousRiskRef.current = currentRisk
  }, [playAlertSound])

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    initializeAudio()
    setSoundEnabled(prev => !prev)
  }, [initializeAudio])

  return {
    soundEnabled,
    toggleSound,
    checkRiskChange,
    hasInteracted,
    initializeAudio,
  }
}
