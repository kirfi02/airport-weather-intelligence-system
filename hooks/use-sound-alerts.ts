"use client"

import { useCallback, useRef, useState } from "react"

type RiskLevelType = "normal" | "restricted" | "high"

export function useSoundAlerts() {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const previousRiskRef = useRef<RiskLevelType | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize and unlock the audio context from a user gesture.
  const initializeAudio = useCallback(() => {
    if (typeof window === "undefined") return

    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!AudioContextConstructor) return
      audioContextRef.current = new AudioContextConstructor()
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume()
    }
    setHasInteracted(true)
  }, [])

  // Generate a beep sound using Web Audio API.
  // `force` is used for the button confirmation tone before soundEnabled updates.
  const playBeep = useCallback(
    (frequency: number, duration: number, volume = 0.3, force = false) => {
      const ctx = audioContextRef.current
      if ((!soundEnabled && !force) || !ctx) return

      const play = () => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        oscillator.frequency.value = frequency
        oscillator.type = "sine"

        const startTime = ctx.currentTime
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      if (ctx.state === "suspended") {
        void ctx.resume().then(play)
      } else {
        play()
      }
    },
    [soundEnabled]
  )

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

  // Toggle sound on/off and confirm activation with an audible tone.
  const toggleSound = useCallback(() => {
    initializeAudio()
    setSoundEnabled((previouslyEnabled) => {
      const nextEnabled = !previouslyEnabled
      if (nextEnabled) {
        window.setTimeout(() => playBeep(800, 0.12, 0.18, true), 0)
      }
      return nextEnabled
    })
  }, [initializeAudio, playBeep])

  return {
    soundEnabled,
    toggleSound,
    checkRiskChange,
    hasInteracted,
    initializeAudio,
  }
}
