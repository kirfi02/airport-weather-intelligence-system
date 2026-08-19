export interface Airport {
  code: string
  name: string
  city: string
  latitude: number
  longitude: number
}

export const airports: Airport[] = [
  {
    code: "ABV",
    name: "Nnamdi Azikiwe International Airport",
    city: "Abuja",
    latitude: 9.0065,
    longitude: 7.2632,
  },
  {
    code: "KAN",
    name: "Mallam Aminu Kano International Airport",
    city: "Kano",
    latitude: 12.0476,
    longitude: 8.5246,
  },
  {
    code: "JOS",
    name: "Yakubu Gowon Airport",
    city: "Jos",
    latitude: 9.6398,
    longitude: 8.8691,
  },
  {
    code: "BCU",
    name: "Sir Abubakar Tafawa Balewa Airport",
    city: "Bauchi",
    latitude: 10.4828,
    longitude: 9.7440,
  },
]

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find((airport) => airport.code === code)
}
