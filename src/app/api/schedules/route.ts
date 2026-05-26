export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/schedules?orig=NZNE&dest=YSSY&date1=2026-06-10&date2=2026-06-30
// GET /api/schedules?id=<objectId>   (single schedule for the booking page)
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('dairy-flat-air')
    const coll = db.collection('schedules')

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // If an id is provided just return that one schedule
    if (id) {
      const schedule = await coll.findOne({ _id: new ObjectId(id) })
      if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' })
      }
      return NextResponse.json(schedule)
    }

    const orig  = searchParams.get('orig')?.toUpperCase()
    const dest  = searchParams.get('dest')?.toUpperCase()
    const date1 = searchParams.get('date1')
    const date2 = searchParams.get('date2')

    // Build the query
    const query: any = {}

    if (orig) query.origin = orig
    if (dest)  query.dest = dest

    // Filter by date range using the stored depDateLocal field
    if (date1 || date2) {
      query.depDateLocal = {}
      if (date1) query.depDateLocal.$gte = date1
      if (date2) query.depDateLocal.$lte = date2
    }

    // Only show future flights (don't show ones that have already departed)
    query.departureUTC = { $gt: new Date() }

    const results = await coll
      .find(query)
      .sort({ departureUTC: 1 })
      .limit(100)
      .toArray()

    return NextResponse.json(results)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message })
  }
}
