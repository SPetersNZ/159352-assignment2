import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dairy Flat Air',
  description: 'Online booking for Dairy Flat Airport flights',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-700 text-white px-6 py-3 flex items-center gap-6">
          <Link href="/" className="font-bold text-lg">Dairy Flat Air</Link>
          <Link href="/search" className="text-sm hover:underline">Search Flights</Link>
          <Link href="/my-bookings" className="text-sm hover:underline">My Bookings</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
        <footer className="text-center text-sm text-gray-400 py-6 border-t mt-12">
          159.352 Assignment 2 - Steven Peters
        </footer>
      </body>
    </html>
  )
}
