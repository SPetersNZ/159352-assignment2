'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const AIRPORT_NAMES: Record<string, string> = {
  NZNE: 'Dairy Flat Airport', YSSY: 'Sydney Airport',
  NZRO: 'Rotorua Airport', NZGB: 'Claris Airport (Great Barrier Island)',
  NZCI: 'Tuuta Airport (Chatham Islands)', NZTL: 'Lake Tekapo Airport',
}

const TZ_LABEL: Record<string, string> = {
  NZNE: 'NZT', NZRO: 'NZT', NZGB: 'NZT', NZTL: 'NZT', NZCI: 'CHAST', YSSY: 'AEST',
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

export default function BookPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return }
    fetch(`/api/schedules?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setNotFound(true)
        else setSchedule(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!firstName || !lastName || !email) {
      setFormError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId: id, firstName, lastName, email, phone }),
    })
    const data = await res.json()
    if (!res.ok) {
      setFormError(data.error || 'Booking failed, please try again.')
      setSubmitting(false)
      return
    }
    router.push(`/confirmation?ref=${data.bookingRef}`)
  }

  if (loading) return <p className="text-gray-500">Loading flight details...</p>
  if (notFound) {
    return (
      <div>
        <p className="text-red-600 mb-4">Flight not found.</p>
        <Link href="/search" className="btn-outline">Back to search</Link>
      </div>
    )
  }
  if (!schedule) return null

  const seatsLeft = schedule.totalSeats - (schedule.bookings?.length || 0)
  const isFull = seatsLeft <= 0

  return (
    <div>
      <Link href="/search" className="text-sm text-blue-600 hover:underline">&larr; Back to search</Link>

      <h1 className="text-2xl font-bold mt-4 mb-4">Book Flight</h1>

      <div className="card mb-6">
        <h2 className="font-semibold text-lg mb-3">Flight Details</h2>
        <table className="text-sm w-full">
          <tbody>
            <tr><td className="text-gray-500 pr-4 py-1">Flight</td><td>{schedule.flightNo}</td></tr>
            <tr><td className="text-gray-500 pr-4 py-1">Aircraft</td><td>{schedule.aircraftName}</td></tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">From</td>
              <td>{AIRPORT_NAMES[schedule.origin]} ({schedule.origin})</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">To</td>
              <td>{AIRPORT_NAMES[schedule.dest]} ({schedule.dest})</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">Departure</td>
              <td>{formatDate(schedule.depDateLocal)} at {schedule.depTimeLocal} {TZ_LABEL[schedule.origin]}</td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">Arrival</td>
              <td>
                {formatDate(schedule.arrDateLocal)} at {schedule.arrTimeLocal} {TZ_LABEL[schedule.dest]}
                {schedule.arrDateLocal !== schedule.depDateLocal && ' (next day)'}
              </td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">Seats available</td>
              <td className={isFull ? 'text-red-600' : 'text-green-700'}>
                {isFull ? 'Fully booked' : `${seatsLeft} of ${schedule.totalSeats}`}
              </td>
            </tr>
            <tr>
              <td className="text-gray-500 pr-4 py-1">Price</td>
              <td className="font-semibold">NZD {schedule.price}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isFull ? (
        <div className="card text-center">
          <p className="text-red-600 mb-3">This flight is fully booked.</p>
          <Link href="/search" className="btn">Find another flight</Link>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-semibold text-lg mb-4">Passenger Details</h2>
          <form onSubmit={handleBook}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">First name *</label>
                <input className="field" type="text" value={firstName}
                  onChange={e => setFirstName(e.target.value)} placeholder="Jane" required />
              </div>
              <div>
                <label className="label">Last name *</label>
                <input className="field" type="text" value={lastName}
                  onChange={e => setLastName(e.target.value)} placeholder="Smith" required />
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Email address *</label>
              <input className="field" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
              <p className="text-xs text-gray-500 mt-1">
                Your booking reference will be linked to this email. Use the same email to look up your bookings later.
              </p>
            </div>
            <div className="mb-4">
              <label className="label">Phone number (optional)</label>
              <input className="field" type="tel" value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="+64 21 000 0000" />
            </div>

            {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-semibold">Total: NZD {schedule.price}</span>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function Page() {
  return (
      <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
        <BookPage />
      </Suspense>
  )
}
