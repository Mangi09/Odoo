import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function nextWeekIso() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().slice(0, 10)
}

export default function PlanTrip() {
  const navigate = useNavigate()
  const userId = useMemo(() => getCurrentUserId(), [])

  const [form, setForm] = useState({
    title: '',
    place: '',
    startDate: todayIso(),
    endDate: nextWeekIso(),
    description: '',
    totalBudget: ''
  })
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadSuggestions() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const result = await apiFetch(`/recommendations/places?userId=${userId}&limit=6`)
        if (!ignore) {
          setSuggestions(result.places || [])
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Unable to fetch suggestions')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadSuggestions()

    return () => {
      ignore = true
    }
  }, [userId])

  const canSave = form.title.trim() && form.startDate && form.endDate

  async function handleSaveTrip(event) {
    event.preventDefault()
    if (!canSave) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      const payload = {
        ownerId: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        totalBudget: form.totalBudget || undefined,
        visibility: 'private'
      }

      const result = await apiFetch('/trips', { method: 'POST', body: payload })
      navigate(`/trips/${result.trip.id}`)
    } catch (error) {
      setErrorMessage(error.message || 'Trip creation failed')
    } finally {
      setIsSaving(false)
    }
  }

  function applySuggestion(place) {
    setForm((prev) => ({
      ...prev,
      place: `${place.name}, ${place.country}`,
      title: prev.title || `${place.name} trip`
    }))
  }

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <section className="tl-section">
          <div className="tl-inline-actions tl-page-actions">
            <Link className="tl-pill" to="/trips">Back to trips</Link>
            <Link className="tl-pill" to="/">Home</Link>
          </div>
          <h1 className="tl-title">Plan a new trip</h1>
          <form className="tl-form" onSubmit={handleSaveTrip}>
            <label>
              Trip name
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Japan spring loop"
                required
              />
            </label>

            <label>
              Select a place
              <input
                value={form.place}
                onChange={(event) => setForm((prev) => ({ ...prev, place: event.target.value }))}
                placeholder="City or country"
              />
            </label>

            <div className="tl-grid-2">
              <label>
                Start date
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  required
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="tl-grid-2">
              <label>
                Budget (optional)
                <input
                  type="number"
                  min="0"
                  value={form.totalBudget}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalBudget: event.target.value }))}
                  placeholder="2500"
                />
              </label>

              <label>
                Notes
                <input
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Food-focused trip"
                />
              </label>
            </div>

            <button className="tl-btn tl-btn-primary" type="submit" disabled={!canSave || isSaving}>
              {isSaving ? 'Saving...' : 'Save trip'}
            </button>
          </form>
          {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}
        </section>

        <section className="tl-section">
          <h2 className="tl-subtitle">Suggestions for places to visit</h2>
          {isLoading ? <p className="tl-muted">Loading suggestions...</p> : null}
          <div className="tl-card-grid tl-card-grid-3">
            {suggestions.map((place) => (
              <button type="button" className="tl-city-card" key={place.id} onClick={() => applySuggestion(place)}>
                <h3>{place.name}</h3>
                <p>{place.country}</p>
                <small>Cost index: {place.costIndex}</small>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
