'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const AIRPORT_NAMES: Record<string, string> = {
  NZNE: 'Dairy Flat Airport', YSSY: 'Sydney Airport',
  NZRO: 'Rotorua Airport', NZGB: 'Claris Airport (Great Barrier Island)',
  NZCI: 'Tuuta Airport (Chatham Islands)', NZTL: 'Lake Tekapo Airport',
}

const TZ_LABEL: Record<string, string> = {
  NZNE: 'NZT', NZRO: 'NZT', NZGB: 'NZT', NZTL: 'NZT', NZCI: 'CHAST', YSSY: 'AEST',
}

interface BookingInfo {
  bookingRef: string
  firstName: string
  lastName: string
  email: string
  flightNo: string
  origin: string
  dest: string
  depDateLocal: string
  depTimeLocal: string
  arrDateLocal: string
  arrTimeLocal: string
  price: number
  aircraftName: string
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')

  const [info, setInfo]               = useState<BookingInfo | null>(null)
  const [loading, setLoading]         = useState(true)
  const [notFound, setNotFound]       = useState(false)
  const [cancelling, setCancelling]   = useState(false)
  const [cancelled, setCancelled]     = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!ref) { setNotFound(true); setLoading(false); return }
    fetch(`/api/bookings?ref=${ref}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const schedule = data[0]
        const booking = schedule.bookings[0]
        setInfo({
          bookingRef: booking.bookingRef,
          firstName: booking.firstName,
          lastName: booking.lastName,
          email: booking.email,
          flightNo: schedule.flightNo,
          origin: schedule.origin,
          dest: schedule.dest,
          depDateLocal: schedule.depDateLocal,
          depTimeLocal: schedule.depTimeLocal,
          arrDateLocal: schedule.arrDateLocal,
          arrTimeLocal: schedule.arrTimeLocal,
          price: schedule.price,
          aircraftName: schedule.aircraftName,
        })
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [ref])

  async function handleCancel() {
    setCancelling(true)
    setCancelError('')
    const res = await fetch(`/api/bookings?ref=${ref}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      setCancelError(data.error || 'Cancellation failed')
      setCancelling(false)
      return
    }
    setCancelled(true)
    setShowConfirm(false)
    setCancelling(false)
  }

  if (loading) return <p className="text-gray-500">Loading booking...</p>
  if (notFound) {
    return (
      <div>
        <p className="text-red-600 mb-4">Booking not found.</p>
        <Link href="/my-bookings" className="btn-outline">Look up my bookings</Link>
      </div>
    )
  }
  if (!info) return null

  return (
    <div>
      {cancelled ? (
        <div className="card mb-6 border-red-200 bg-red-50">
          <p className="font-semibold text-red-700">Booking {info.bookingRef} has been cancelled.</p>
          <Link href="/search" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Search for another flight
          </Link>
        </div>
      ) : (
        <div className="card mb-6 border-green-200 bg-green-50">
          <p className="font-semibold text-green-700">Booking confirmed!</p>
          <p className="text-sm text-gray-600 mt-1">
            Your booking reference is <strong>{info.bookingRef}</strong>. Please keep this for your records.
          </p>
        </div>
      )}

      <div className="card mb-6">
        <h2 className="font-semibold text-lg mb-3 pb-2 border-b">Booking Invoice</h2>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Booking Reference</h3>
          <p className="font-mono font-bold text-xl">{info.bookingRef}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Passenger</h3>
          <p>{info.firstName} {info.lastName}</p>
          <p className="text-sm text-gray-600">{info.email}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Flight Details</h3>
          <table className="text-sm w-full">
            <tbody>
              <tr>
                <td className="text-gray-500 pr-4 py-1">Flight</td>
                <td>{info.flightNo} ({info.aircraftName})</td>
              </tr>
              <tr>
                <td className="text-gray-500 pr-4 py-1">From</td>
                <td>{AIRPORT_NAMES[info.origin]} ({info.origin})</td>
              </tr>
              <tr>
                <td className="text-gray-500 pr-4 py-1">To</td>
                <td>{AIRPORT_NAMES[info.dest]} ({info.dest})</td>
              </tr>
              <tr>
                <td className="text-gray-500 pr-4 py-1">Departure</td>
                <td>{formatDate(info.depDateLocal)} at {info.depTimeLocal} {TZ_LABEL[info.origin]}</td>
              </tr>
              <tr>
                <td className="text-gray-500 pr-4 py-1">Arrival</td>
                <td>
                  {formatDate(info.arrDateLocal)} at {info.arrTimeLocal} {TZ_LABEL[info.dest]}
                  {info.arrDateLocal !== info.depDateLocal && ' (next day)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t flex justify-between items-center">
          <span className="text-gray-500 text-sm">Amount paid</span>
          <span className="font-bold text-lg">NZD {info.price}</span>
        </div>
      </div>

      {!cancelled && (
        <div>
          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="btn-outline text-sm">
              Cancel this booking
            </button>
          ) : (
            <div className="card border-red-200">
              <p className="text-sm font-medium mb-3">
                Are you sure you want to cancel booking {info.bookingRef}? This cannot be undone.
              </p>
              {cancelError && <p className="text-red-600 text-sm mb-2">{cancelError}</p>}
              <div className="flex gap-2">
                <button onClick={handleCancel} disabled={cancelling} className="btn-red">
                  {cancelling ? 'Cancelling...' : 'Yes, cancel booking'}
                </button>
                <button onClick={() => setShowConfirm(false)} className="btn-outline">
                  Keep booking
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <Link href="/my-bookings" className="text-sm text-blue-600 hover:underline">
          View all my bookings
        </Link>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}
