export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { generateSchedules } from '@/lib/seed'

// GET or POST /api/seed - wipes and re-seeds the database
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('dairy-flat-air')

    // Drop the old schedules collection and re-insert
    const schedules = generateSchedules(8)
    const coll = db.collection('schedules')
    await coll.deleteMany({})
    const result = await coll.insertMany(schedules as any[])

    // passengers collection - just needs an index on email
    const passengersColl = db.collection('passengers')

    return NextResponse.json({
      ok: true,
      message: `Added ${result.insertedCount} flights over 8 weeks`,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message })
  }
}

export async function POST() {
  return GET()
}
