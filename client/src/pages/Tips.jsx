import React, { useEffect, useMemo, useState } from 'react'
import { apiFetch, DEMO_TRIP_ID } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

const FALLBACK_TRIPS = [
  { id: DEMO_TRIP_ID, title: 'Demo Trip' }
]

const emptyDraft = {
  title: '',
  body: '',
  noteDate: '',
  stopId: ''
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article className="tl-fade-card tl-community-card">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="tl-subtitle mb-1">{note.title}</h3>
          <p className="tl-community-copy">{note.body}</p>
          <p className="tl-muted text-sm mt-3">{note.noteDate || 'No date set'}</p>
        </div>

        <span className={`tl-community-chip ${note.stopId ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
          {note.stopId ? 'By Stop' : 'By Day'}
        </span>
      </div>

      <div className="flex gap-3 mt-5 flex-wrap">
        <button type="button" className="tl-btn" onClick={() => onEdit(note)}>Edit</button>
        <button type="button" className="tl-btn" onClick={() => onDelete(note.id)}>Delete</button>
      </div>
    </article>
  )
}

function ComposerModal({ isOpen, draft, setDraft, onSave, onCancel, isEditing, tripTitle }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="tl-section w-full max-w-xl">
        <p className="tl-kicker">Trip notes</p>
        <h2 className="tl-subtitle mb-4">{isEditing ? 'Edit note' : 'Add note'} for {tripTitle}</h2>

        <div className="grid gap-3">
          <input
            className="tl-input"
            placeholder="Title"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
          />
          <textarea
            className="tl-input"
            placeholder="Note body"
            rows={5}
            value={draft.body}
            onChange={(event) => setDraft({ ...draft, body: event.target.value })}
          />
          <input
            className="tl-input"
            placeholder="Note date (optional)"
            value={draft.noteDate}
            onChange={(event) => setDraft({ ...draft, noteDate: event.target.value })}
          />
          <input
            className="tl-input"
            placeholder="Stop ID (optional)"
            value={draft.stopId}
            onChange={(event) => setDraft({ ...draft, stopId: event.target.value })}
          />

          <div className="flex gap-3 flex-wrap">
            <button type="button" className="tl-btn tl-btn-primary" onClick={onSave}>
              {isEditing ? 'Save Changes' : 'Post Note'}
            </button>
            <button type="button" className="tl-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Tips() {
  const userId = getCurrentUserId()
  const [trips, setTrips] = useState(FALLBACK_TRIPS)
  const [selectedTripId, setSelectedTripId] = useState(DEMO_TRIP_ID)
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [groupBy, setGroupBy] = useState('none')
  const [sortBy, setSortBy] = useState('default')
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [loadingNotes, setLoadingNotes] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [draft, setDraft] = useState(emptyDraft)

  useEffect(() => {
    let mounted = true

    async function loadTrips() {
      setLoadingTrips(true)
      try {
        const result = await apiFetch(`/trips?ownerId=${userId}`)
        const backendTrips = Array.isArray(result.trips) && result.trips.length
          ? result.trips.map((trip) => ({ id: trip.id, title: trip.title }))
          : []
        const nextTrips = [
          FALLBACK_TRIPS[0],
          ...backendTrips.filter((trip) => trip.id !== DEMO_TRIP_ID)
        ]

        if (mounted) {
          setTrips(nextTrips)
          setSelectedTripId((current) => (nextTrips.some((trip) => trip.id === current) ? current : nextTrips[0]?.id || DEMO_TRIP_ID))
        }
      } catch {
        if (mounted) {
          setTrips(FALLBACK_TRIPS)
          setSelectedTripId(DEMO_TRIP_ID)
        }
      } finally {
        if (mounted) {
          setLoadingTrips(false)
        }
      }
    }

    loadTrips()

    return () => {
      mounted = false
    }
  }, [userId])

  useEffect(() => {
    let mounted = true

    async function loadNotes() {
      setLoadingNotes(true)
      setErrorMessage('')

      try {
        const result = await apiFetch(`/trips/${selectedTripId}/notes`)
        if (mounted) {
          setNotes(Array.isArray(result.notes) ? result.notes : [])
        }
      } catch (error) {
        if (mounted) {
          setNotes([])
          setErrorMessage(error.message || 'Unable to load notes')
        }
      } finally {
        if (mounted) {
          setLoadingNotes(false)
        }
      }
    }

    if (selectedTripId) {
      loadNotes()
    }

    return () => {
      mounted = false
    }
  }, [selectedTripId])

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || trips[0] || FALLBACK_TRIPS[0]

  const openComposer = (note = null) => {
    if (note) {
      setEditingNoteId(note.id)
      setDraft({
        title: note.title || '',
        body: note.body || '',
        noteDate: note.noteDate || '',
        stopId: note.stopId || ''
      })
    } else {
      setEditingNoteId(null)
      setDraft(emptyDraft)
    }

    setComposerOpen(true)
  }

  const saveNote = async () => {
    if (!draft.title.trim() || !draft.body.trim()) {
      setErrorMessage('Title and note body are required')
      return
    }

    try {
      if (editingNoteId) {
        const result = await apiFetch(`/trips/${selectedTripId}/notes/${editingNoteId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: draft.title.trim(),
            body: draft.body.trim(),
            noteDate: draft.noteDate.trim() || null,
            stopId: draft.stopId.trim() || null
          })
        })

        setNotes((current) => current.map((note) => (note.id === editingNoteId ? result.note : note)))
      } else {
        const result = await apiFetch(`/trips/${selectedTripId}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            title: draft.title.trim(),
            body: draft.body.trim(),
            noteDate: draft.noteDate.trim() || null,
            stopId: draft.stopId.trim() || null,
            createdBy: userId
          })
        })

        setNotes((current) => [result.note, ...current])
      }

      setComposerOpen(false)
      setDraft(emptyDraft)
      setEditingNoteId(null)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save note')
    }
  }

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) {
      return
    }

    try {
      await apiFetch(`/trips/${selectedTripId}/notes/${noteId}`, {
        method: 'DELETE'
      })
      setNotes((current) => current.filter((note) => note.id !== noteId))
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete note')
    }
  }

  const processedNotes = useMemo(() => {
    let data = [...notes]

    data = data.filter((note) => {
      const text = `${note.title} ${note.body}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })

    if (filter !== 'All') {
      data = data.filter((note) => (filter === 'By Day' ? !note.stopId : Boolean(note.stopId)))
    }

    if (sortBy === 'title') {
      data.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'oldest') {
      data.sort((a, b) => new Date(a.createdAt || a.noteDate || 0) - new Date(b.createdAt || b.noteDate || 0))
    } else {
      data.sort((a, b) => new Date(b.createdAt || b.noteDate || 0) - new Date(a.createdAt || a.noteDate || 0))
    }

    return data
  }, [notes, search, filter, sortBy])

  const groupedNotes = useMemo(() => {
    if (groupBy === 'type') {
      return {
        'By Day': processedNotes.filter((note) => !note.stopId),
        'By Stop': processedNotes.filter((note) => Boolean(note.stopId))
      }
    }

    return { All: processedNotes }
  }, [processedNotes, groupBy])

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <section className="tl-section">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <p className="tl-kicker">Trip notes</p>
              <h1 className="tl-title mb-2">Your travel journal, itinerary and reminders.</h1>
              <p className="tl-muted">Write notes per trip and manage them against the backend instead of local demo storage.</p>
            </div>

            <button
              onClick={() => openComposer()}
              className="tl-btn tl-btn-primary"
              type="button"
              disabled={loadingTrips}
            >
              + Add Note
            </button>
          </div>
        </section>

        <section className="tl-section">
          <div className="tl-toolbar">
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="tl-input"
            />

            <select
              value={selectedTripId}
              onChange={(event) => setSelectedTripId(event.target.value)}
              className="tl-input"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.title}</option>
              ))}
            </select>

            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="tl-input">
              <option value="All">All</option>
              <option value="By Day">By Day</option>
              <option value="By Stop">By Stop</option>
            </select>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="tl-input">
              <option value="default">Sort By</option>
              <option value="title">Title A-Z</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </section>

        {loadingTrips || loadingNotes ? <p className="tl-muted mt-4">Loading notes...</p> : null}
        {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}

        <section className="space-y-8 mt-6">
          {Object.entries(groupedNotes).map(([group, items]) => (
            <div key={group}>
              {groupBy === 'type' ? <h2 className="tl-subtitle mb-4">{group}</h2> : null}

              {items.length ? (
                <div className="grid md:grid-cols-2 gap-5">
                  {items.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={openComposer}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              ) : (
                <p className="tl-muted">No notes found.</p>
              )}
            </div>
          ))}
        </section>

        <ComposerModal
          isOpen={composerOpen}
          draft={draft}
          setDraft={setDraft}
          onSave={saveNote}
          onCancel={() => {
            setComposerOpen(false)
            setEditingNoteId(null)
            setDraft(emptyDraft)
          }}
          isEditing={Boolean(editingNoteId)}
          tripTitle={selectedTrip?.title || 'Trip'}
        />
      </main>
    </div>
  )
}
