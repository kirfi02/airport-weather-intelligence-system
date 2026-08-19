interface AirportWeatherLogoProps {
  className?: string
}

export function AirportWeatherLogo({ className = "h-10 w-10" }: AirportWeatherLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="Airport Weather Intelligence logo"
    >
      <defs>
        <linearGradient id="airport-weather-logo" x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8D58A" />
          <stop offset="0.45" stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="#061A2B" stroke="#164E63" strokeWidth="2" />
      <circle cx="32" cy="32" r="23" stroke="url(#airport-weather-logo)" strokeWidth="1.5" strokeDasharray="1 4" />
      <path d="M14 38c5-5 10-5 15 0s10 5 15 0" stroke="#A5F3FC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 15v34M15 32h34" stroke="#38BDF8" strokeOpacity=".2" />
      <path d="M32 16l4.1 11.9L48 32l-11.9 4.1L32 48l-4.1-11.9L16 32l11.9-4.1L32 16Z" fill="url(#airport-weather-logo)" />
      <path d="M32 22v20M22 32h20" stroke="#061A2B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.5" fill="#F8D58A" />
    </svg>
  )
}
