'use client'
import { useState } from 'react'
import Link from 'next/link'

const AIRPORT_OPTIONS = [
  { code: 'NZNE', label: 'Dairy Flat (NZNE)' },
  { code: 'YSSY', label: 'Sydney (YSSY)' },
  { code: 'NZRO', label: 'Rotorua (NZRO)' },
  { code: 'NZGB', label: 'Great Barrier Island (NZGB)' },
  { code: 'NZCI', label: 'Chatham Islands (NZCI)' },
  { code: 'NZTL', label: 'Lake Tekapo (NZTL)' },
]

const AIRPORT_NAMES: Record<string, string> = {
  NZNE: 'Dairy Flat', YSSY: 'Sydney', NZRO: 'Rotorua',
  NZGB: 'Great Barrier Island', NZCI: 'Chatham Islands', NZTL: 'Lake Tekapo',
}

interface Schedule {
  _id: string
  flightNo: string
  origin: string
  dest: string
  aircraftName: string
  totalSeats: number
  price: number
  depDateLocal: string
  depTimeLocal: string
  arrDateLocal: string
  arrTimeLocal: string
  bookings: any[]
}

export default function SearchPage() {
  const [orig, setOrig]   = useState('NZNE')
  const [dest, setDest]   = useState('')
  const [date1, setDate1] = useState('')
  const [date2, setDate2] = useState('')
  const [results, setResults]   = useState<Schedule[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState('')

  const today = new Date().toISOString().slice(0, 10)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSearched(true)

    // Build the query string - matches what the tips pdf suggests
    const params = new URLSearchParams()
    if (orig)  params.set('orig', orig)
    if (dest)  params.set('dest', dest)
    if (date1) params.set('date1', date1)
    if (date2) params.set('date2', date2)

    const res = await fetch(`/api/schedules?${params.toString()}`)
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    setResults(data)
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Flights</h1>

      {/* Search form */}
      <div className="card mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">From</label>
              <select className="field" value={orig} onChange={e => setOrig(e.target.value)}>
                {AIRPORT_OPTIONS.map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">To</label>
              <select className="field" value={dest} onChange={e => setDest(e.target.value)}>
                <option value="">Any destination</option>
                {AIRPORT_OPTIONS.filter(a => a.code !== orig).map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">From date (optional)</label>
              <input
                type="date"
                className="field"
                value={date1}
                min={today}
                onChange={e => setDate1(e.target.value)}
              />
            </div>
            <div>
              <label className="label">To date (optional)</label>
              <input
                type="date"
                className="field"
                value={date2}
                min={date1 || today}
                onChange={e => setDate2(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Tip: Leave dates blank to see all upcoming flights. Some routes (e.g. Sydney, Chatham Islands) only operate on specific days of the week.
          </p>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* No results */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="card text-center text-gray-500">
          No flights found. Try widening your date range or leaving the dates blank.
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">{results.length} flight(s) found</p>
          <div className="space-y-3">
            {results.map(s => {
              const seatsLeft = s.totalSeats - (s.bookings?.length || 0)
              const isFull = seatsLeft <= 0
              return (
                <div key={s._id} className="card flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-gray-500 mb-1">
                      {s.flightNo} &middot; {s.aircraftName}
                    </div>
                    <div className="font-semibold">
                      {AIRPORT_NAMES[s.origin]} → {AIRPORT_NAMES[s.dest]}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDisplayDate(s.depDateLocal)} &nbsp;
                      Departs {s.depTimeLocal} &rarr; Arrives {s.arrTimeLocal}
                      {s.arrDateLocal !== s.depDateLocal && ' (+1 day)'}
                    </div>
                    <div className="text-sm mt-1">
                      {isFull
                        ? <span className="text-red-600">Fully booked</span>
                        : <span className="text-green-700">{seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} available</span>
                      }
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-lg mb-2">NZD {s.price}</div>
                    {!isFull ? (
                      <Link href={`/book?id=${s._id}`} className="btn">Book</Link>
                    ) : (
                      <button disabled className="btn">Full</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}
