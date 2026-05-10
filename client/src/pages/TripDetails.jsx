import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { apiFetch } from '../lib/api'

export default function TripDetails() {
  const { tripId } = useParams()
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadTrip() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const result = await apiFetch(`/trips/${tripId}`)
        if (!ignore) {
          setTrip(result.trip)
          setStops(result.stops || [])
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Unable to load trip details')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTrip()

    return () => {
      ignore = true
    }
  }, [tripId])

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <Navbar />

        <section className="tl-section">
          <div className="tl-inline-actions tl-page-actions">
            <Link className="tl-pill" to="/trips">Back to trips</Link>
          </div>
        </section>

        {isLoading ? <p className="tl-muted">Loading itinerary...</p> : null}
        {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}

        {trip ? (
          <section className="tl-section">
            <h1 className="tl-title">{trip.title}</h1>
            <p className="tl-muted">{trip.description || 'No description'}</p>
            <p className="tl-muted">{trip.startDate} to {trip.endDate}</p>
          </section>
        ) : null}

        <section className="tl-section">
          <h2 className="tl-subtitle">Itinerary</h2>
          <div className="tl-itinerary-list">
            {stops.map((stop, index) => (
              <article className="tl-itinerary-stop" key={stop.id}>
                <div className="tl-day">Day {index + 1}</div>
                <div>
                  <h3>{stop.cityName}, {stop.country}</h3>
                  <p>{stop.arrivalDate} to {stop.departureDate}</p>
                  <ul>
                    {(stop.activities || []).map((activity) => (
                      <li key={activity.id}>{activity.title} ({activity.startTime || 'Any time'})</li>
                    ))}
                    {!stop.activities?.length ? <li>No activities yet</li> : null}
                  </ul>
                </div>
              </article>
            ))}
            {!stops.length ? <p className="tl-muted">No stops added yet</p> : null}
          </div>
        </section>
      </main>
    </div>
  )
}
