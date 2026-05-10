import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, getActiveUserId } from '../lib/api'
import { currencyFormat, formatDate, getTripPhase } from '../lib/format'

export default function MyTrips() {
  const navigate = useNavigate()
  const userId = getActiveUserId()
  const [trips, setTrips] = useState([])
  const [search, setSearch] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [sortBy, setSortBy] = useState('startDate')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const data = await apiRequest(`/trips?ownerId=${userId}`)
        setTrips(data.trips || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrips()
  }, [userId])

  const groupedTrips = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = trips
      .filter((trip) => {
        const phase = getTripPhase(trip)
        return (
          (phaseFilter === 'all' || phaseFilter === phase) &&
          (!q || trip.title.toLowerCase().includes(q) || (trip.description || '').toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'budget') return Number(b.totalBudget) - Number(a.totalBudget)
        if (sortBy === 'destinations') return b.destinationCount - a.destinationCount
        return new Date(a.startDate) - new Date(b.startDate)
      })

    return {
      ongoing: filtered.filter((trip) => getTripPhase(trip) === 'ongoing'),
      upcoming: filtered.filter((trip) => getTripPhase(trip) === 'upcoming'),
      completed: filtered.filter((trip) => getTripPhase(trip) === 'completed'),
    }
  }, [trips, search, phaseFilter, sortBy])

  return (
    <main className="px-6 lg:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-primary font-semibold">TRIP LIBRARY</p>
        <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">User Trip Listing</h1>

        <section className="bg-white rounded-[2rem] p-6 shadow-sm mt-8">
          <div className="grid lg:grid-cols-[1fr_150px_150px_150px] gap-4">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bar..."
              className="p-4 rounded-2xl border border-[#E5E5E5]"
            />
            <select className="p-4 rounded-2xl border border-[#E5E5E5]" disabled>
              <option>Group by phase</option>
            </select>
            <select
              value={phaseFilter}
              onChange={(event) => setPhaseFilter(event.target.value)}
              className="p-4 rounded-2xl border border-[#E5E5E5]"
            >
              <option value="all">Filter</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="p-4 rounded-2xl border border-[#E5E5E5]"
            >
              <option value="startDate">Sort by date</option>
              <option value="budget">Sort by budget</option>
              <option value="destinations">Sort by destinations</option>
            </select>
          </div>

          {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
          {isLoading ? (
            <p className="mt-8 text-[#666]">Loading trips from backend...</p>
          ) : (
            <div className="mt-8 space-y-8">
              <TripGroup title="Ongoing" trips={groupedTrips.ongoing} navigate={navigate} />
              <TripGroup title="Up-coming" trips={groupedTrips.upcoming} navigate={navigate} />
              <TripGroup title="Completed" trips={groupedTrips.completed} navigate={navigate} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function TripGroup({ title, trips, navigate }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[#2D2D2D]">{title}</h2>
      <div className="mt-4 space-y-4">
        {trips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DDD] p-8 text-center text-[#666]">
            No trips in this section.
          </div>
        ) : (
          trips.map((trip) => (
            <button
              type="button"
              key={trip.id}
              onClick={() => navigate(`/itinerary-builder?tripId=${trip.id}`)}
              className="w-full text-left rounded-3xl border border-[#E5E5E5] p-6 hover:border-primary hover:bg-orange-50 transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#2D2D2D]">{trip.title}</h3>
                  <p className="text-[#666] mt-2">{trip.description || 'Short overview of the trip.'}</p>
                </div>
                <div className="text-sm font-semibold text-[#555]">
                  <p>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</p>
                  <p>{trip.destinationCount} destinations</p>
                  <p>{currencyFormat(trip.estimatedTotal, trip.baseCurrency)} planned</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  )
}
