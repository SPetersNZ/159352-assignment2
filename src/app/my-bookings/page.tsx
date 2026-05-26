'use client'
import { useState } from 'react'
import Link from 'next/link'

const AIRPORT_NAMES: Record<string, string> = {
  NZNE: 'Dairy Flat', YSSY: 'Sydney',
  NZRO: 'Rotorua', NZGB: 'Great Barrier Island',
  NZCI: 'Chatham Islands', NZTL: 'Lake Tekapo',
}

const TZ_LABEL: Record<string, string> = {
  NZNE: 'NZT', NZRO: 'NZT', NZGB: 'NZT', NZTL: 'NZT', NZCI: 'CHAST', YSSY: 'AEST',
}

interface ScheduleWithBooking {
  _id: string
  flightNo: string
  origin: string
  dest: string
  aircraftName: string
  price: number
  depDateLocal: string
  depTimeLocal: string
  arrDateLocal: string
  arrTimeLocal: string
  departureUTC: string
  bookings: {
    bookingRef: string
    firstName: string
    lastName: string
    email: string
    bookedAt: string
  }[]
}

export default function MyBookingsPage() {
  const [searchMode, setSearchMode] = useState<'email' | 'ref'>('email')
  const [emailInput, setEmailInput] = useState('')
  const [refInput, setRefInput]     = useState('')
  const [results, setResults]       = useState<ScheduleWithBooking[]>([])
  const [loading, setLoading]       = useState(false)
  const [searched, setSearched]     = useState(false)
  const [error, setError]           = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResults([])
    setLoading(true)
    setSearched(true)

    const params = new URLSearchParams()
    if (searchMode === 'email') {
      params.set('email', emailInput)
    } else {
      params.set('ref', refInput.toUpperCase())
    }

    const res = await fetch(`/api/bookings?${params.toString()}`)
    const data = await res.json()

    // console.log(data)

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  // Split results into upcoming and past
  const now = new Date()
  const upcoming = results.filter(r => new Date(r.departureUTC) > now)
  const past = results.filter(r => new Date(r.departureUTC) <= now)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <p className="text-sm text-gray-600 mb-6">
        Look up your bookings by email address or booking reference.
      </p>

      <div className="card mb-6">
        {/* Toggle between email and ref search */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => { setSearchMode('email'); setSearched(false); setResults([]) }}
            className={`text-sm px-3 py-1 rounded border ${searchMode === 'email' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            Search by email
          </button>
          <button
            onClick={() => { setSearchMode('ref'); setSearched(false); setResults([]) }}
            className={`text-sm px-3 py-1 rounded border ${searchMode === 'ref' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            Search by booking ref
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          {searchMode === 'email' ? (
            <input
              className="field flex-1"
              type="email"
              placeholder="Enter your email address"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              required
            />
          ) : (
            <input
              className="field flex-1 uppercase"
              type="text"
              placeholder="e.g. DF-AB1234"
              value={refInput}
              onChange={e => setRefInput(e.target.value)}
              required
              maxLength={9}
            />
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {searched && !loading && results.length === 0 && !error && (
        <div className="card text-center text-gray-500">
          No bookings found. Make sure you use the same email address you booked with.
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-3">Upcoming Flights</h2>
          <div className="space-y-3">
            {upcoming.map(s => <BookingCard key={s._id} schedule={s} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-3 text-gray-500">Past Flights</h2>
          <div className="space-y-3 opacity-70">
            {past.map(s => <BookingCard key={s._id} schedule={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({ schedule: s }: { schedule: ScheduleWithBooking }) {
  const booking = s.bookings[0]
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">{s.flightNo} &middot; {s.aircraftName}</div>
          <div className="font-semibold">
            {AIRPORT_NAMES[s.origin]} → {AIRPORT_NAMES[s.dest]}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {formatDate(s.depDateLocal)} &nbsp;
            {s.depTimeLocal} {TZ_LABEL[s.origin]} &rarr; {s.arrTimeLocal} {TZ_LABEL[s.dest]}
            {s.arrDateLocal !== s.depDateLocal && ' (+1 day)'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Booked: {new Date(booking.bookedAt).toLocaleDateString('en-NZ')}
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="font-mono font-semibold text-sm">{booking.bookingRef}</div>
          <div className="text-sm font-medium mt-1">NZD {s.price}</div>
          <Link
            href={`/confirmation?ref=${booking.bookingRef}`}
            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
          >
            View / Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
