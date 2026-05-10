import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, getActiveUserId, getStoredUser } from '../lib/api'
import { currencyFormat, formatDate, getTripPhase } from '../lib/format'
import { DEFAULT_CITY_IMAGE, getPlaceImage, handleImageError } from '../lib/images'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const userId = getActiveUserId()
  const [trips, setTrips] = useState([])
  const [topSelections, setTopSelections] = useState([])
  const [suggestedPlaces, setSuggestedPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setError('')

      try {
        const [tripData, regionalData, placeData] = await Promise.all([
          apiRequest(`/trips?ownerId=${userId}`),
          apiRequest('/recommendations/top-regional-selections?limit=6'),
          apiRequest(`/recommendations/places?userId=${userId}&limit=6`),
        ])

        setTrips(tripData.trips || [])
        setTopSelections(regionalData.selections || [])
        setSuggestedPlaces(placeData.places || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [userId])

  const recentTrips = useMemo(() => trips.slice(0, 3), [trips])

  return (
    <main className="px-6 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-primary font-bold uppercase text-sm">Traveloop dashboard</p>
            <h1 className="text-4xl lg:text-6xl font-bold text-[#2D2D2D] mt-3">
              Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-[#666] mt-4 max-w-2xl">
              Review previous trips, explore top regional selections, and start a new itinerary
              from live PostgreSQL data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/create-trip')}
            className="bg-primary text-white px-7 py-4 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Plan a Trip
          </button>
        </section>

        {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700 font-medium">{error}</p>}

        {isLoading ? (
          <div className="mt-10 rounded-[2rem] bg-white p-8 text-[#666] shadow-sm">
            Loading dashboard data...
          </div>
        ) : (
          <>
            <section className="grid lg:grid-cols-3 gap-6 mt-10">
              <DashboardStat label="Trips" value={trips.length} />
              <DashboardStat
                label="Ongoing"
                value={trips.filter((trip) => getTripPhase(trip) === 'ongoing').length}
              />
              <DashboardStat
                label="Upcoming"
                value={trips.filter((trip) => getTripPhase(trip) === 'upcoming').length}
              />
            </section>

            <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 mt-10">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-[#2D2D2D]">Previous Trips</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/my-trips')}
                    className="text-primary font-semibold"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {recentTrips.length === 0 ? (
                    <EmptyBox text="No trips yet. Create your first trip." />
                  ) : (
                    recentTrips.map((trip) => (
                      <button
                        type="button"
                        key={trip.id}
                        onClick={() => navigate(`/itinerary-builder?tripId=${trip.id}`)}
                        className="w-full text-left rounded-3xl border border-[#EEE] p-5 hover:border-primary hover:bg-orange-50 transition"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-[#2D2D2D]">{trip.title}</h3>
                            <p className="text-[#666] mt-2">{trip.description}</p>
                          </div>
                          <span className="text-sm font-bold text-primary capitalize">
                            {getTripPhase(trip)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4 text-sm text-[#555] font-medium">
                          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                          <span>{trip.destinationCount} destinations</span>
                          <span>{currencyFormat(trip.totalBudget, trip.baseCurrency)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#2D2D2D]">Top Regional Selections</h2>
                <div className="mt-6 grid gap-4">
                  {topSelections.map((city) => (
                    <CityMiniCard key={city.id} city={city} />
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-[#2D2D2D]">Suggested Places</h2>
                <button
                  type="button"
                  onClick={() => navigate('/create-trip')}
                  className="text-primary font-semibold"
                >
                  Plan from suggestions
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {suggestedPlaces.map((city) => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function DashboardStat({ label, value }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm">
      <p className="text-[#666] font-medium">{label}</p>
      <h2 className="text-4xl font-bold text-[#2D2D2D] mt-3">{value}</h2>
    </div>
  )
}

function CityCard({ city }) {
  return (
    <article className="bg-white rounded-[2rem] overflow-hidden shadow-sm">
      <img
        src={getPlaceImage(city)}
        alt=""
        className="h-48 w-full object-cover"
        onError={(event) => handleImageError(event, DEFAULT_CITY_IMAGE)}
      />
      <div className="p-6">
        <h3 className="text-2xl font-bold text-[#2D2D2D]">{city.name}</h3>
        <p className="text-[#666] mt-2">{city.country}</p>
        <p className="text-sm text-primary font-semibold mt-4">
          {city.matchingActivityCount || city.activityCount || 0} activities
        </p>
      </div>
    </article>
  )
}

function CityMiniCard({ city }) {
  return (
    <article className="flex gap-4 rounded-3xl border border-[#EEE] p-4">
      <img
        src={getPlaceImage(city)}
        alt=""
        className="w-20 h-20 rounded-2xl object-cover"
        onError={(event) => handleImageError(event, DEFAULT_CITY_IMAGE)}
      />
      <div>
        <h3 className="font-bold text-[#2D2D2D]">{city.name}</h3>
        <p className="text-sm text-[#666]">{city.country}</p>
        <p className="text-sm text-primary font-semibold mt-2">
          {city.tripCount || 0} trip saves
        </p>
      </div>
    </article>
  )
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#DDD] p-8 text-center text-[#666]">
      {text}
    </div>
  )
}
