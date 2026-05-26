import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Dairy Flat Air</h1>
      <p className="text-gray-600 mb-6">
        Book flights from Dairy Flat Airport (NZNE) to destinations across New Zealand and Sydney.
      </p>

      <div className="flex gap-3 mb-10">
        <Link href="/search" className="btn">Search for Flights</Link>
        <Link href="/my-bookings" className="btn-outline">View My Bookings</Link>
      </div>

      <h2 className="text-xl font-semibold mb-3">Our Routes</h2>
      <div className="card mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 pr-4">Route</th>
              <th className="pb-2 pr-4">Schedule</th>
              <th className="pb-2 pr-4">Aircraft</th>
              <th className="pb-2">From (NZD)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 pr-4">Dairy Flat → Sydney (return)</td>
              <td className="py-2 pr-4">Weekly (Fri out, Sun return)</td>
              <td className="py-2 pr-4">SyberJet SJ30i (6 seats)</td>
              <td className="py-2">$2,800</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Dairy Flat → Rotorua (return)</td>
              <td className="py-2 pr-4">Twice daily Mon–Fri</td>
              <td className="py-2 pr-4">Cirrus SF50 (4 seats)</td>
              <td className="py-2">$280</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Dairy Flat → Great Barrier (return)</td>
              <td className="py-2 pr-4">3× weekly (Mon/Wed/Fri out)</td>
              <td className="py-2 pr-4">Cirrus SF50 (4 seats)</td>
              <td className="py-2">$220</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Dairy Flat → Chatham Islands (return)</td>
              <td className="py-2 pr-4">2× weekly (Tue/Fri out)</td>
              <td className="py-2 pr-4">HondaJet Elite (5 seats)</td>
              <td className="py-2">$950</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Dairy Flat → Lake Tekapo (return)</td>
              <td className="py-2 pr-4">Weekly (Mon out, Tue return)</td>
              <td className="py-2 pr-4">HondaJet Elite (5 seats)</td>
              <td className="py-2">$680</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-2">About Dairy Flat Airport</h2>
        <p className="text-sm text-gray-600">
          Dairy Flat Airport (ICAO: NZNE) is located just north of Albany, Auckland.
          All routes operate on a weekly rolling timetable. Flights operate year-round.
          Prices shown are per passenger one-way.
        </p>
      </div>
    </div>
  )
}
