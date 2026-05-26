import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Simple random booking reference generator
function makeBookingRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'DF-'
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

// POST /api/bookings
// Body: { scheduleId, firstName, lastName, email, phone }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { scheduleId, firstName, lastName, email, phone } = body

    if (!scheduleId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' })
    }

    const client = await clientPromise
    const db = client.db('dairy-flat-air')
    const schedulesColl = db.collection('schedules')
    const passengersColl = db.collection('passengers')

    // Find the schedule
    const schedule = await schedulesColl.findOne({ _id: new ObjectId(scheduleId) })
    if (!schedule) {
      return NextResponse.json({ error: 'Flight not found' })
    }

    // Check the flight hasn't already departed
    if (new Date(schedule.departureUTC) <= new Date()) {
      return NextResponse.json({ error: 'This flight has already departed' })
    }

    // Check there are seats available
    const bookedCount = schedule.bookings ? schedule.bookings.length : 0
    if (bookedCount >= schedule.totalSeats) {
      return NextResponse.json({ error: 'Sorry, this flight is fully booked' })
    }

    // Generate a unique booking ref
    let bookingRef = makeBookingRef()
    // Very unlikely to clash but check anyway
    let existing = await schedulesColl.findOne({ 'bookings.bookingRef': bookingRef })
    let attempts = 0
    while (existing && attempts < 10) {
      bookingRef = makeBookingRef()
      existing = await schedulesColl.findOne({ 'bookings.bookingRef': bookingRef })
      attempts++
    }

    // Create the booking object to embed in the schedule
    const booking = {
      bookingRef,
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      bookedAt: new Date(),
    }

    // Embed the booking in the schedule document
    await schedulesColl.updateOne(
      { _id: new ObjectId(scheduleId) },
      { $push: { bookings: booking } } as any
    )

    // Also upsert the passenger into the passengers collection
    // (upsert so we don't get duplicates for the same email)
    await passengersColl.updateOne(
      { email: email.toLowerCase().trim() },
      {
        $set: { firstName, lastName, email: email.toLowerCase().trim(), phone: phone || '' },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    )

    // Return enough info for the confirmation page
    return NextResponse.json({
      bookingRef,
      firstName,
      lastName,
      email,
      flightNo: schedule.flightNo,
      origin: schedule.origin,
      dest: schedule.dest,
      depDateLocal: schedule.depDateLocal,
      depTimeLocal: schedule.depTimeLocal,
      arrDateLocal: schedule.arrDateLocal,
      arrTimeLocal: schedule.arrTimeLocal,
      price: schedule.price,
      aircraftName: schedule.aircraftName,
    }, { status: 201 })

  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message })
  }
}

// GET /api/bookings?email=... - fetch all schedules a passenger is booked on
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('dairy-flat-air')
    const schedulesColl = db.collection('schedules')

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const ref   = searchParams.get('ref')

    if (!email && !ref) {
      return NextResponse.json({ error: 'Provide email or ref' })
    }

    let results
    if (email) {
      // Find all schedules that have a booking for this email
      results = await schedulesColl
        .find({ 'bookings.email': email.toLowerCase().trim() })
        .sort({ departureUTC: 1 })
        .toArray()

      // Filter the bookings array to only include this passenger's bookings
      results = results.map(s => ({
        ...s,
        bookings: s.bookings.filter((b: any) => b.email === email.toLowerCase().trim()),
      }))
    } else {
      // Lookup by booking ref
      results = await schedulesColl
        .find({ 'bookings.bookingRef': ref!.toUpperCase() })
        .toArray()

      results = results.map(s => ({
        ...s,
        bookings: s.bookings.filter((b: any) => b.bookingRef === ref!.toUpperCase()),
      }))
    }

    return NextResponse.json(results)
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}

// DELETE /api/bookings?ref=DF-XXXXXX
export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('dairy-flat-air')
    const schedulesColl = db.collection('schedules')

    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json({ error: 'Provide a booking ref' })
    }

    // Find the schedule containing this booking
    const schedule = await schedulesColl.findOne({ 'bookings.bookingRef': ref.toUpperCase() })
    if (!schedule) {
      return NextResponse.json({ error: 'Booking not found' })
    }

    // Don't allow cancelling past flights
    if (new Date(schedule.departureUTC) <= new Date()) {
      return NextResponse.json({ error: 'Cannot cancel a flight that has already departed' })
    }

    // Remove the booking from the embedded array
    await schedulesColl.updateOne(
      { _id: schedule._id },
      { $pull: { bookings: { bookingRef: ref.toUpperCase() } } } as any
    )

    return NextResponse.json({ ok: true, message: `Booking ${ref} has been cancelled` })
  } catch (err: any) {
    return NextResponse.json({ error: err.message })
  }
}
