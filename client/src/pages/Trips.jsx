import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

function toDate(value) {
  return value ? new Date(value) : null
}

function groupTrips(trips) {
  const now = new Date()
  const groups = { ongoing: [], upcoming: [], completed: [] }

  for (const trip of trips) {
    const start = toDate(trip.startDate)
    const end = toDate(trip.endDate)

    if (start && end && start <= now && end >= now) {
      groups.ongoing.push(trip)
    } else if (start && start > now) {
      groups.upcoming.push(trip)
    } else {
      groups.completed.push(trip)
    }
  }

  return groups
}

export default function Trips() {
  const userId = useMemo(() => getCurrentUserId(), [])
  const [searchText, setSearchText] = useState('')
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadTrips() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const result = await apiFetch(`/trips?ownerId=${userId}`)
        if (!ignore) {
          setTrips(result.trips || [])
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Unable to load trips')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTrips()

    return () => {
      ignore = true
    }
  }, [userId])

  const filteredTrips = trips.filter((trip) => {
    const text = `${trip.title} ${trip.description || ''}`.toLowerCase()
    return text.includes(searchText.toLowerCase())
  })

  const grouped = groupTrips(filteredTrips)

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <header className="tl-bar">
          <div className="tl-brand">Traveloop</div>
          <div className="tl-inline-actions">
            <Link className="tl-pill" to="/profile">Profile</Link>
            <Link className="tl-pill" to="/plan">Plan new trip</Link>
          </div>
        </header>

        <section className="tl-section">
          <div className="tl-toolbar">
            <input
              placeholder="Search trips"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Link className="tl-btn" to="/">Go home</Link>
          </div>
        </section>

        {isLoading ? <p className="tl-muted">Loading trips...</p> : null}
        {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}

        <section className="tl-section">
          <h2 className="tl-subtitle">Ongoing</h2>
          <div className="tl-trip-list">
            {grouped.ongoing.map((trip) => (
              <Link className="tl-trip-card" key={trip.id} to={`/trips/${trip.id}`}>
                <strong>{trip.title}</strong>
                <p>{trip.description || 'No description added'}</p>
              </Link>
            ))}
            {!grouped.ongoing.length ? <p className="tl-muted">No ongoing trips</p> : null}
          </div>
        </section>

        <section className="tl-section">
          <h2 className="tl-subtitle">Upcoming</h2>
          <div className="tl-trip-list">
            {grouped.upcoming.map((trip) => (
              <Link className="tl-trip-card" key={trip.id} to={`/trips/${trip.id}`}>
                <strong>{trip.title}</strong>
                <p>{trip.description || 'No description added'}</p>
              </Link>
            ))}
            {!grouped.upcoming.length ? <p className="tl-muted">No upcoming trips</p> : null}
          </div>
        </section>

        <section className="tl-section">
          <h2 className="tl-subtitle">Completed</h2>
          <div className="tl-trip-list">
            {grouped.completed.map((trip) => (
              <Link className="tl-trip-card" key={trip.id} to={`/trips/${trip.id}`}>
                <strong>{trip.title}</strong>
                <p>{trip.description || 'No description added'}</p>
              </Link>
            ))}
            {!grouped.completed.length ? <p className="tl-muted">No completed trips</p> : null}
          </div>
        </section>
      </main>
    </div>
  )
}
