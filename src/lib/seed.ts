import { TIMETABLE, AIRPORTS, AIRCRAFT } from './schedule'

// Convert a local time like "06:30" on a given date string "2026-06-02" in a given
// IANA timezone to a UTC Date. This was tricky to figure out!
// The trick is to probe what the UTC offset is at that moment using Intl.
function localToUTC(dateStr: string, timeStr: string, tz: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)

  // Start with a rough UTC guess assuming the time is UTC
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute))

  // See what time that actually is in the target timezone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(probe)

  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
  const tzHour = get('hour')
  const tzMin = get('minute')
  const tzDay = get('day')
  const tzMonth = get('month')
  const tzYear = get('year')

  // Work out the offset
  const wantMins = hour * 60 + minute
  const gotMins = tzHour * 60 + tzMin
  const dayDiff = (year * 10000 + month * 100 + day) - (tzYear * 10000 + tzMonth * 100 + tzDay)
  const offsetMins = wantMins - gotMins - dayDiff * 24 * 60

  return new Date(probe.getTime() - offsetMins * 60 * 1000)
}

// Format a UTC date as HH:MM in a given timezone
function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)
}

// Format a UTC date as YYYY-MM-DD in a given timezone
function formatDate(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

// Generate all schedule documents for weeksAhead weeks starting from this week
export function generateSchedules(weeksAhead = 8) {
  const schedules = []

  // Find Monday of the current week
  const now = new Date()
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const currentDay = startDate.getUTCDay()
  const daysToMonday = (currentDay + 6) % 7
  startDate.setUTCDate(startDate.getUTCDate() - daysToMonday)

  for (let week = 0; week < weeksAhead; week++) {
    for (const route of TIMETABLE) {
      const originTz = AIRPORTS[route.origin].tz
      const destTz = AIRPORTS[route.dest].tz

      for (const dow of route.days) {
        // Get the date of this day-of-week in this week
        const daysFromMonday = (dow + 6) % 7  // Mon=0 offset
        const flightDateUTC = new Date(startDate.getTime() + (week * 7 + daysFromMonday) * 86400000)
        const dateStr = flightDateUTC.toISOString().slice(0, 10)

        const depUTC = localToUTC(dateStr, route.depTime, originTz)
        const arrUTC = new Date(depUTC.getTime() + route.durationMins * 60 * 1000)

        const aircraft = AIRCRAFT[route.aircraft]

        // This is the schedule document - bookings array is embedded as per the tips
        schedules.push({
          flightNo: route.flightNo,
          origin: route.origin,
          dest: route.dest,
          aircraft: route.aircraft,
          aircraftName: aircraft.name,
          totalSeats: aircraft.seats,
          price: route.price,
          departureUTC: depUTC,
          arrivalUTC: arrUTC,
          // Store pre-formatted local times so we don't have to recompute them
          depDateLocal: formatDate(depUTC, originTz),
          depTimeLocal: formatTime(depUTC, originTz),
          arrDateLocal: formatDate(arrUTC, destTz),
          arrTimeLocal: formatTime(arrUTC, destTz),
          // Bookings embedded in the schedule document (one-to-few relationship)
          bookings: [],
        })
      }
    }
  }

  return schedules
}
