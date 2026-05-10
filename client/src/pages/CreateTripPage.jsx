import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, getActiveUserId } from '../lib/api'
import { DEFAULT_CITY_IMAGE, getPlaceImage, handleImageError } from '../lib/images'

export default function CreateTripPage() {
  const navigate = useNavigate()
  const userId = getActiveUserId()
  const [cities, setCities] = useState([])
  const [activities, setActivities] = useState([])
  const [interest, setInterest] = useState('culture')
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    cityId: '',
    description: '',
    totalBudget: '',
  })
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === form.cityId) || cities[0],
    [cities, form.cityId],
  )

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await apiRequest(`/recommendations/places?userId=${userId}&limit=12`)
        const nextCities = data.places || []
        setCities(nextCities)
        setForm((current) => ({ ...current, cityId: current.cityId || nextCities[0]?.id || '' }))
      } catch (err) {
        setError(err.message)
      }
    }

    loadCities()
  }, [userId])

  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedCity?.id) return

      try {
        const data = await apiRequest(
          `/recommendations/activities?cityId=${selectedCity.id}&category=${interest}&limit=6`,
        )
        setActivities(data.activities || [])
      } catch {
        setActivities([])
      }
    }

    loadActivities()
  }, [selectedCity?.id, interest])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const data = await apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify({
          ownerId: userId,
          title: form.title,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
          totalBudget: form.totalBudget || 0,
          visibility: 'private',
        }),
      })

      if (form.cityId) {
        await apiRequest(`/trips/${data.trip.id}/stops`, {
          method: 'POST',
          body: JSON.stringify({
            cityId: form.cityId,
            arrivalDate: form.startDate,
            departureDate: form.endDate,
          }),
        })
      }

      navigate(`/itinerary-builder?tripId=${data.trip.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="px-6 lg:px-12 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-primary font-semibold">CREATE YOUR JOURNEY</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">
              Plan A New Trip
            </h1>
          </div>
        </div>

        {error && <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700 font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_420px] gap-10 mt-12">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm">
            <div className="grid md:grid-cols-2 gap-6">
              <label className="md:col-span-2">
                <span className="text-sm text-[#666666] font-medium">Trip Name</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="Summer Japan Adventure"
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                  required
                />
              </label>

              <label>
                <span className="text-sm text-[#666666] font-medium">Start Date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateForm('startDate', event.target.value)}
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                  required
                />
              </label>

              <label>
                <span className="text-sm text-[#666666] font-medium">End Date</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateForm('endDate', event.target.value)}
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                  required
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm text-[#666666] font-medium">Select Destination</span>
                <select
                  value={form.cityId}
                  onChange={(event) => updateForm('cityId', event.target.value)}
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm text-[#666666] font-medium">Budget</span>
                <input
                  type="number"
                  min="0"
                  value={form.totalBudget}
                  onChange={(event) => updateForm('totalBudget', event.target.value)}
                  placeholder="1800"
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                />
              </label>

              <label>
                <span className="text-sm text-[#666666] font-medium">Interest</span>
                <select
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none focus:border-primary"
                >
                  <option value="culture">Culture</option>
                  <option value="food">Food</option>
                  <option value="nature">Nature</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="adventure">Adventure</option>
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="text-sm text-[#666666] font-medium">Trip Description</span>
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  placeholder="Describe your travel plans..."
                  className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5] outline-none resize-none focus:border-primary"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-8 bg-primary text-white px-7 py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-70"
            >
              {isSaving ? 'Saving Trip...' : 'Save Trip'}
            </button>
          </div>

          <aside className="bg-white p-8 rounded-[2rem] shadow-sm">
            <h2 className="text-2xl font-bold text-[#2D2D2D]">Trip Preview</h2>
            <img
              src={getPlaceImage(selectedCity)}
              alt=""
              className="w-full h-56 object-cover rounded-3xl mt-8"
              onError={(event) => handleImageError(event, DEFAULT_CITY_IMAGE)}
            />
            <h3 className="text-3xl font-bold text-[#2D2D2D] mt-6">
              {form.title || `${selectedCity?.name || 'Your'} Escape`}
            </h3>
            <p className="text-[#666666] mt-3 leading-relaxed">
              {selectedCity
                ? `${selectedCity.name}, ${selectedCity.country} with ${interest} suggestions from the database.`
                : 'Choose a destination to see suggestions.'}
            </p>

            <div className="mt-8">
              <h4 className="font-bold text-[#2D2D2D]">Suggested activities</h4>
              <div className="mt-4 space-y-3">
                {activities.length === 0 ? (
                  <p className="text-[#666] text-sm">No matching activities yet.</p>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="rounded-2xl bg-[#F8F7F4] p-4">
                      <p className="font-semibold text-[#2D2D2D]">{activity.name}</p>
                      <p className="text-sm text-[#666] mt-1">{activity.category}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}
