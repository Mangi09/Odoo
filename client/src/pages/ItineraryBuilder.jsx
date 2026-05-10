import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, DEMO_TRIP_ID } from '../lib/api'
import { currencyFormat, formatDate } from '../lib/format'
import { DEFAULT_CITY_IMAGE, getTripImage, handleImageError } from '../lib/images'

const emptySection = {
  sectionType: 'activity',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  budgetAmount: '',
  currency: 'USD',
}

export default function ItineraryBuilder() {
  const navigate = useNavigate()
  const tripIdFromUrl = new URLSearchParams(window.location.search).get('tripId') || DEMO_TRIP_ID
  const [tripId, setTripId] = useState(tripIdFromUrl)
  const [trip, setTrip] = useState(null)
  const [sections, setSections] = useState([])
  const [form, setForm] = useState(emptySection)
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const totalBudget = useMemo(
    () => sections.reduce((sum, section) => sum + Number(section.budgetAmount || 0), 0),
    [sections],
  )

  const loadSections = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [sectionData, tripData] = await Promise.all([
        apiRequest(`/trips/${tripId}/sections`),
        apiRequest(`/trips/${tripId}`),
      ])
      setSections(sectionData.sections || [])
      setTrip(tripData.trip || null)
      setMessage('Itinerary synced')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSections()
  }, [])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(emptySection)
    setEditingId(null)
    setIsFormOpen(false)
  }

  const startEdit = (section) => {
    setEditingId(section.id)
    setForm({
      sectionType: section.sectionType || 'activity',
      title: section.title || '',
      description: section.description || '',
      startDate: section.startDate ? section.startDate.slice(0, 10) : '',
      endDate: section.endDate ? section.endDate.slice(0, 10) : '',
      budgetAmount: section.budgetAmount || '',
      currency: section.currency || 'USD',
    })
    setIsFormOpen(true)
  }

  const saveSection = async (event) => {
    event.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const path = editingId ? `/trips/${tripId}/sections/${editingId}` : `/trips/${tripId}/sections`
      await apiRequest(path, {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...form, budgetAmount: form.budgetAmount || 0 }),
      })
      setMessage(editingId ? 'Section updated' : 'Section added')
      resetForm()
      await loadSections()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      await apiRequest(`/trips/${tripId}/sections/${sectionId}`, { method: 'DELETE' })
      setSections((current) => current.filter((section) => section.id !== sectionId))
      setMessage('Section removed')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="px-6 lg:px-12 py-10">
      <div className="max-w-7xl mx-auto">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-primary font-semibold">BUILD YOUR JOURNEY</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">Build Itinerary</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/my-trips')} className="bg-white border border-[#E5E5E5] px-6 py-3 rounded-2xl font-medium">
              My Trips
            </button>
            <button type="button" onClick={() => setIsFormOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-semibold">
              + Add Section
            </button>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_360px] gap-8 mt-10">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm">
            <label>
              <span className="text-sm font-semibold text-[#666]">Trip ID</span>
              <input
                value={tripId}
                onChange={(event) => setTripId(event.target.value)}
                onBlur={loadSections}
                className="w-full mt-2 p-4 border border-[#E5E5E5] rounded-2xl outline-none focus:border-primary"
              />
            </label>

            {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
            {message && !error && <p className="mt-5 rounded-2xl bg-green-50 p-4 text-green-700">{message}</p>}

            {isFormOpen && (
              <form onSubmit={saveSection} className="mt-6 rounded-3xl bg-[#FFF8F3] p-6 border border-orange-100">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Section Title" value={form.title} onChange={(v) => updateForm('title', v)} required />
                  <label>
                    <span className="text-sm font-semibold text-[#666]">Type</span>
                    <select value={form.sectionType} onChange={(event) => updateForm('sectionType', event.target.value)} className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5]">
                      <option value="travel">Travel</option>
                      <option value="hotel">Hotel</option>
                      <option value="activity">Activity</option>
                      <option value="note">Note</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <Field type="date" label="Start Date" value={form.startDate} onChange={(v) => updateForm('startDate', v)} />
                  <Field type="date" label="End Date" value={form.endDate} onChange={(v) => updateForm('endDate', v)} />
                  <Field type="number" label="Budget" value={form.budgetAmount} onChange={(v) => updateForm('budgetAmount', v)} />
                  <Field label="Currency" value={form.currency} onChange={(v) => updateForm('currency', v)} />
                </div>
                <label className="block mt-4">
                  <span className="text-sm font-semibold text-[#666]">Section Details</span>
                  <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} rows="4" className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5]" />
                </label>
                <div className="flex justify-end gap-3 mt-5">
                  <button type="button" onClick={resetForm} className="bg-white border border-[#E5E5E5] px-5 py-3 rounded-2xl">Cancel</button>
                  <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-3 rounded-2xl font-semibold">
                    {isSaving ? 'Saving...' : editingId ? 'Update Section' : 'Save Section'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 space-y-4">
              {isLoading ? (
                <p className="text-[#666]">Loading itinerary sections...</p>
              ) : sections.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-[#DDD] p-8 text-center text-[#666]">No sections yet.</p>
              ) : (
                sections.map((section, index) => (
                  <article key={section.id} className="rounded-3xl border border-[#E5E5E5] p-6">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-primary font-bold text-sm">Section {index + 1}</p>
                        <h2 className="text-2xl font-bold text-[#2D2D2D] mt-1">{section.title}</h2>
                      </div>
                      <span className="text-primary font-bold capitalize">{section.sectionType}</span>
                    </div>
                    <p className="text-[#666] mt-3">{section.description}</p>
                    <div className="flex flex-wrap gap-3 mt-5 text-sm font-semibold text-[#555]">
                      <span className="rounded-2xl border border-[#EEE] px-4 py-3">
                        Date Range: {formatDate(section.startDate)} to {formatDate(section.endDate)}
                      </span>
                      <span className="rounded-2xl border border-[#EEE] px-4 py-3">
                        {currencyFormat(section.budgetAmount, section.currency)}
                      </span>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                      <button type="button" onClick={() => startEdit(section)} className="rounded-2xl bg-[#F8F7F4] px-4 py-3 font-semibold">Edit</button>
                      <button type="button" onClick={() => deleteSection(section.id)} className="rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-700">Delete</button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="bg-white rounded-[2rem] p-6 shadow-sm h-fit">
            <p className="text-primary font-semibold">Trip Preview</p>
            <h2 className="text-3xl font-bold text-[#2D2D2D] mt-3">{trip?.title || 'Japan Spring Trip'}</h2>
            <img src={getTripImage(trip)} alt="" onError={(event) => handleImageError(event, DEFAULT_CITY_IMAGE)} className="w-full h-52 object-cover rounded-3xl mt-6" />
            <div className="mt-6 space-y-4 text-[#555] font-semibold">
              <p>Total Sections: {sections.length}</p>
              <p>Planned Budget: {currencyFormat(totalBudget)}</p>
              <p>{formatDate(trip?.startDate)} to {formatDate(trip?.endDate)}</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label>
      <span className="text-sm font-semibold text-[#666]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-2 p-4 rounded-2xl border border-[#E5E5E5]"
      />
    </label>
  )
}
