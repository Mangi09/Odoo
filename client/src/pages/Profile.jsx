import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

export default function Profile() {
  const userId = useMemo(() => getCurrentUserId(), [])
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const result = await apiFetch(`/users/${userId}`)
        if (!ignore) {
          setProfile(result.user)
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Unable to load profile')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [userId])

  async function handleSave(event) {
    event.preventDefault()
    if (!profile) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setMessage('')

    try {
      const payload = {
        fullName: profile.fullName,
        username: profile.username,
        phoneNumber: profile.phoneNumber,
        city: profile.city,
        country: profile.country,
        additionalInfo: profile.additionalInfo
      }
      const result = await apiFetch(`/users/${userId}`, { method: 'PATCH', body: payload })
      setProfile(result.user)
      setMessage('Profile updated successfully')
    } catch (error) {
      setErrorMessage(error.message || 'Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  function onChange(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <header className="tl-bar">
          <div className="tl-brand">Traveloop</div>
          <Link className="tl-pill" to="/">Back to home</Link>
        </header>

        <section className="tl-section">
          <h1 className="tl-title">User profile</h1>
          {isLoading ? <p className="tl-muted">Loading profile...</p> : null}

          {profile ? (
            <form className="tl-form" onSubmit={handleSave}>
              <label>
                Full name
                <input value={profile.fullName || ''} onChange={(event) => onChange('fullName', event.target.value)} />
              </label>

              <div className="tl-grid-2">
                <label>
                  Username
                  <input value={profile.username || ''} onChange={(event) => onChange('username', event.target.value)} />
                </label>
                <label>
                  Phone
                  <input value={profile.phoneNumber || ''} onChange={(event) => onChange('phoneNumber', event.target.value)} />
                </label>
              </div>

              <div className="tl-grid-2">
                <label>
                  City
                  <input value={profile.city || ''} onChange={(event) => onChange('city', event.target.value)} />
                </label>
                <label>
                  Country
                  <input value={profile.country || ''} onChange={(event) => onChange('country', event.target.value)} />
                </label>
              </div>

              <label>
                Additional info
                <textarea
                  value={profile.additionalInfo || ''}
                  onChange={(event) => onChange('additionalInfo', event.target.value)}
                  rows={4}
                />
              </label>

              <button className="tl-btn tl-btn-primary" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          ) : null}

          {message ? <p className="tl-success">{message}</p> : null}
          {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}
        </section>
      </main>
    </div>
  )
}
