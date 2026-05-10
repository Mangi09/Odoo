import React, { useEffect, useState } from 'react'
import { apiRequest, getActiveUserId, getStoredUser, setStoredUser } from '../lib/api'

export default function Profile() {
  const userId = getActiveUserId()
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    city: '',
    country: '',
    additionalInfo: '',
    avatarUrl: '',
  })
  const [savedCities, setSavedCities] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profileData, savedData] = await Promise.all([
          apiRequest(`/users/${userId}`),
          apiRequest(`/users/${userId}/saved-cities`),
        ])
        const user = profileData.user
        setForm({
          fullName: user.fullName || '',
          username: user.username || '',
          phoneNumber: user.phoneNumber || '',
          city: user.city || '',
          country: user.country || '',
          additionalInfo: user.additionalInfo || '',
          avatarUrl: user.avatarUrl || '',
        })
        setStoredUser({ ...getStoredUser(), ...user })
        setSavedCities(savedData.cities || [])
      } catch (err) {
        setError(err.message)
      }
    }

    loadProfile()
  }, [userId])

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsSaving(true)

    try {
      const data = await apiRequest(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      })
      setStoredUser(data.user)
      setMessage('Profile updated from backend')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="px-6 lg:px-12 py-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-primary font-semibold">USER PROFILE</p>
        <h1 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mt-3">Profile Settings</h1>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 shadow-sm">
            {error && <p className="mb-5 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>}
            {message && <p className="mb-5 rounded-2xl bg-green-50 p-4 text-green-700">{message}</p>}

            <div className="grid md:grid-cols-2 gap-5">
              <ProfileInput label="Full Name" value={form.fullName} onChange={(v) => updateForm('fullName', v)} />
              <ProfileInput label="Username" value={form.username} onChange={(v) => updateForm('username', v)} />
              <ProfileInput label="Phone" value={form.phoneNumber} onChange={(v) => updateForm('phoneNumber', v)} />
              <ProfileInput label="Avatar URL" value={form.avatarUrl} onChange={(v) => updateForm('avatarUrl', v)} />
              <ProfileInput label="City" value={form.city} onChange={(v) => updateForm('city', v)} />
              <ProfileInput label="Country" value={form.country} onChange={(v) => updateForm('country', v)} />
              <label className="md:col-span-2">
                <span className="text-sm font-semibold text-[#666]">Additional Information</span>
                <textarea
                  rows="5"
                  value={form.additionalInfo}
                  onChange={(event) => updateForm('additionalInfo', event.target.value)}
                  className="w-full mt-2 p-4 border border-[#E5E5E5] rounded-2xl outline-none focus:border-primary"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-8 bg-primary text-white px-7 py-4 rounded-2xl font-semibold disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <aside className="bg-white rounded-[2rem] p-8 shadow-sm">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#FFF3E9] text-primary flex items-center justify-center text-4xl font-bold">
              {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="w-full h-full object-cover" /> : form.fullName?.slice(0, 1) || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-[#2D2D2D] mt-6">{form.fullName || 'Traveler'}</h2>
            <p className="text-[#666] mt-2">{form.city || 'City'}, {form.country || 'Country'}</p>

            <h3 className="font-bold text-[#2D2D2D] mt-8">Saved Destinations</h3>
            <div className="mt-4 space-y-3">
              {savedCities.length === 0 ? (
                <p className="text-sm text-[#666]">No saved cities yet.</p>
              ) : (
                savedCities.map((city) => (
                  <div key={city.id} className="rounded-2xl bg-[#F8F7F4] p-4">
                    <p className="font-semibold">{city.name}</p>
                    <p className="text-sm text-[#666]">{city.country}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function ProfileInput({ label, value, onChange }) {
  return (
    <label>
      <span className="text-sm font-semibold text-[#666]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-2 p-4 border border-[#E5E5E5] rounded-2xl outline-none focus:border-primary"
      />
    </label>
  )
}
