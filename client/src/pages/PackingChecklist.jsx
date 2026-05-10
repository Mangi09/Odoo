import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

const CHECKLIST_STORAGE_KEY = 'traveloop-checklists'

const FALLBACK_TRIPS = [
  { id: 'paris-rome', title: 'Paris & Rome Adventure' },
  { id: 'japan-escape', title: 'Japan Highlights' },
  { id: 'island-hop', title: 'Island Escape' }
]

const DEFAULT_TEMPLATE = [
  {
    id: 'documents',
    title: 'Documents',
    items: [
      { id: 'passport', label: 'Passport', packed: true },
      { id: 'tickets', label: 'Flight tickets (printed)', packed: true },
      { id: 'insurance', label: 'Travel insurance', packed: true },
      { id: 'hotel', label: 'Hotel booking confirmation', packed: false }
    ]
  },
  {
    id: 'clothing',
    title: 'Clothing',
    items: [
      { id: 'shirts', label: 'Casual shirts', packed: true },
      { id: 'trousers', label: 'Trousers / jeans', packed: false },
      { id: 'shoes', label: 'Comfortable walking shoes', packed: false },
      { id: 'jacket', label: 'Light jacket / windbreaker', packed: false }
    ]
  },
  {
    id: 'electronics',
    title: 'Electronics',
    items: [
      { id: 'charger', label: 'Phone charger', packed: true },
      { id: 'adapter', label: 'Universal power adapter', packed: false },
      { id: 'headphones', label: 'Earphones / headphones', packed: false },
      { id: 'powerbank', label: 'Power bank', packed: false }
    ]
  }
]

function cloneTemplate(tripTitle = 'Your trip') {
  return DEFAULT_TEMPLATE.map((section) => ({
    ...section,
    tripTitle,
    items: section.items.map((item) => ({ ...item }))
  }))
}

function readSavedChecklists() {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function persistChecklists(nextState) {
  try {
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(nextState))
  } catch {
    // Ignore storage errors on restricted browsers.
  }
}

function buildChecklistState(tripId, tripTitle, savedState) {
  const stored = savedState?.[tripId]
  if (stored?.sections?.length) {
    return {
      tripTitle: stored.tripTitle || tripTitle,
      sections: stored.sections
    }
  }

  return {
    tripTitle,
    sections: cloneTemplate(tripTitle)
  }
}

function countPacked(sections) {
  let packed = 0
  let total = 0

  sections.forEach((section) => {
    section.items.forEach((item) => {
      total += 1
      if (item.packed) {
        packed += 1
      }
    })
  })

  return { packed, total }
}

function sortItems(items, sortBy) {
  const list = [...items]

  if (sortBy === 'label') {
    list.sort((a, b) => a.label.localeCompare(b.label))
  } else if (sortBy === 'packed') {
    list.sort((a, b) => Number(b.packed) - Number(a.packed) || a.label.localeCompare(b.label))
  }

  return list
}

export default function PackingChecklist() {
  const userId = useMemo(() => getCurrentUserId(), [])

  const [trips, setTrips] = useState(FALLBACK_TRIPS)
  const [selectedTripId, setSelectedTripId] = useState(FALLBACK_TRIPS[0].id)
  const [checklistsByTrip, setChecklistsByTrip] = useState(() => readSavedChecklists())
  const [searchText, setSearchText] = useState('')
  const [groupBy, setGroupBy] = useState('section')
  const [filterValue, setFilterValue] = useState('all')
  const [sortBy, setSortBy] = useState('packed')
  const [newItemSection, setNewItemSection] = useState(DEFAULT_TEMPLATE[0].id)
  const [newItemLabel, setNewItemLabel] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadTrips() {
      try {
        const result = await apiFetch(`/trips?ownerId=${userId}`)
        const apiTrips = (result.trips || []).map((trip) => ({
          id: trip.id,
          title: trip.title || 'Untitled trip'
        }))

        if (!ignore && apiTrips.length) {
          setTrips(apiTrips)
          setSelectedTripId((currentTripId) => apiTrips.some((trip) => trip.id === currentTripId) ? currentTripId : apiTrips[0].id)
        }
      } catch {
        if (!ignore) {
          setTrips(FALLBACK_TRIPS)
        }
      }
    }

    loadTrips()

    return () => {
      ignore = true
    }
  }, [userId])

  useEffect(() => {
    persistChecklists(checklistsByTrip)
  }, [checklistsByTrip])

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) || trips[0] || FALLBACK_TRIPS[0],
    [selectedTripId, trips]
  )

  const checklistState = useMemo(
    () => buildChecklistState(selectedTrip.id, selectedTrip.title, checklistsByTrip),
    [checklistsByTrip, selectedTrip.id, selectedTrip.title]
  )

  const progress = useMemo(() => countPacked(checklistState.sections), [checklistState.sections])

  const sectionTotals = useMemo(
    () => checklistState.sections.map((section) => {
      const packedCount = section.items.filter((item) => item.packed).length
      return {
        ...section,
        packedCount,
        totalCount: section.items.length,
        items: sortItems(section.items, sortBy).filter((item) => {
          if (filterValue === 'packed' && !item.packed) {
            return false
          }
          if (filterValue === 'remaining' && item.packed) {
            return false
          }
          if (!searchText.trim()) {
            return true
          }
          return `${item.label} ${section.title}`.toLowerCase().includes(searchText.toLowerCase())
        })
      }
    }).filter((section) => section.items.length > 0),
    [checklistState.sections, filterValue, searchText, sortBy]
  )

  const displayedSections = useMemo(() => {
    const list = [...sectionTotals]

    if (groupBy === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title))
    } else if (groupBy === 'status') {
      list.sort((a, b) => a.packedCount / a.totalCount - b.packedCount / b.totalCount)
    }

    return list
  }, [groupBy, sectionTotals])

  function updateItem(sectionId, itemId) {
    setChecklistsByTrip((currentState) => {
      const currentChecklist = buildChecklistState(selectedTrip.id, selectedTrip.title, currentState)

      return {
        ...currentState,
        [selectedTrip.id]: {
          ...currentChecklist,
          sections: currentChecklist.sections.map((section) => {
            if (section.id !== sectionId) {
              return section
            }

            return {
              ...section,
              items: section.items.map((item) => (
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ))
            }
          })
        }
      }
    })
  }

  function handleAddItem(event) {
    event.preventDefault()

    const label = newItemLabel.trim()
    if (!label) {
      setErrorMessage('Enter an item name before adding it.')
      return
    }

    setChecklistsByTrip((currentState) => {
      const currentChecklist = buildChecklistState(selectedTrip.id, selectedTrip.title, currentState)

      return {
        ...currentState,
        [selectedTrip.id]: {
          ...currentChecklist,
          sections: currentChecklist.sections.map((section) => {
            if (section.id !== newItemSection) {
              return section
            }

            return {
              ...section,
              items: [
                ...section.items,
                {
                  id: `${section.id}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                  label,
                  packed: false
                }
              ]
            }
          })
        }
      }
    })

    setNewItemLabel('')
    setErrorMessage('')
    setStatusMessage(`Added ${label} to ${checklistState.sections.find((section) => section.id === newItemSection)?.title || 'the checklist'}.`)
  }

  function handleResetAll() {
    const selected = selectedTrip || FALLBACK_TRIPS[0]
    setChecklistsByTrip((currentState) => ({
      ...currentState,
      [selected.id]: buildChecklistState(selected.id, selected.title, {})
    }))
    setStatusMessage('Checklist reset to the starting template.')
    setErrorMessage('')
  }

  async function handleShareChecklist() {
    const summary = `${checklistState.tripTitle}: ${progress.packed}/${progress.total} items packed.`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Traveloop packing checklist',
          text: summary
        })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary)
      }

      setStatusMessage('Checklist summary ready to share.')
      setErrorMessage('')
    } catch {
      setErrorMessage('Sharing is blocked by the browser right now.')
    }
  }

  return (
    <div className="tl-page tl-checklist-page">
      <main className="tl-board-large tl-checklist-shell">
        <section className="tl-checklist-hero tl-fade-card">
          <div>
            <p className="tl-kicker">Packing Checklist</p>
            <h1>Stay packed, calm, and ready for the next stop.</h1>
            <p className="tl-hero-copy">
              A responsive packing board for your trip, with fast search, clean progress tracking, and smooth motion that keeps the screen feeling alive.
            </p>
          </div>

          <div className="tl-checklist-hero-stats">
            <div className="tl-stat-card">
              <span>Packed</span>
              <strong>{progress.packed}/{progress.total}</strong>
            </div>
            <div className="tl-stat-card">
              <span>Trip</span>
              <strong>{selectedTrip?.title || checklistState.tripTitle}</strong>
            </div>
            <div className="tl-stat-card">
              <span>Focus</span>
              <strong>Documents first</strong>
            </div>
          </div>
        </section>

        <form className="tl-checklist-toolbar" onSubmit={(event) => event.preventDefault()}>
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search checklist items"
            aria-label="Search checklist items"
          />

          <select value={selectedTripId} onChange={(event) => setSelectedTripId(event.target.value)} aria-label="Trip selector">
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>{trip.title}</option>
            ))}
          </select>

          <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)} aria-label="Group checklist by">
            <option value="section">Group by section</option>
            <option value="status">Group by status</option>
            <option value="alphabetical">Group by alphabetically</option>
          </select>

          <select value={filterValue} onChange={(event) => setFilterValue(event.target.value)} aria-label="Filter checklist items">
            <option value="all">Filter all</option>
            <option value="packed">Packed only</option>
            <option value="remaining">Remaining only</option>
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort checklist items">
            <option value="packed">Sort by packed</option>
            <option value="label">Sort by name</option>
            <option value="manual">Sort by section order</option>
          </select>
        </form>

        <section className="tl-checklist-progress-card tl-fade-card">
          <div className="tl-progress-head">
            <div>
              <p className="tl-kicker">Packing checklist</p>
              <h2>{progress.packed}/{progress.total} items packed</h2>
            </div>
            <span className="tl-progress-badge">{Math.round((progress.packed / Math.max(progress.total, 1)) * 100)}%</span>
          </div>

          <div className="tl-progress-track" aria-hidden="true">
            <div className="tl-progress-fill" style={{ width: `${(progress.packed / Math.max(progress.total, 1)) * 100}%` }} />
          </div>

          <div className="tl-progress-caption">
            <span>Trip: {selectedTrip?.title || checklistState.tripTitle}</span>
            <span>{displayedSections.length} sections visible</span>
          </div>
        </section>

        <section className="tl-checklist-layout">
          <div className="tl-checklist-sections">
            {displayedSections.map((section, sectionIndex) => (
              <article className="tl-checklist-section tl-fade-card" key={section.id} style={{ animationDelay: `${0.08 + sectionIndex * 0.08}s` }}>
                <div className="tl-section-head">
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.packedCount}/{section.totalCount} packed</p>
                  </div>
                  <span className="tl-section-pill">{section.totalCount - section.packedCount} left</span>
                </div>

                <div className="tl-checklist-items">
                  {section.items.map((item, itemIndex) => (
                    <label
                      key={item.id}
                      className="tl-checklist-item"
                      style={{ animationDelay: `${0.16 + itemIndex * 0.05}s` }}
                    >
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => updateItem(section.id, item.id)}
                        aria-label={`Toggle ${item.label}`}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}

            {!displayedSections.length ? (
              <div className="tl-checklist-empty tl-fade-card">
                <h3>No items match your search.</h3>
                <p>Try clearing the filter or search text to bring the checklist back.</p>
              </div>
            ) : null}
          </div>

          <aside className="tl-checklist-aside">
            <section className="tl-checklist-panel tl-fade-card">
              <div className="tl-panel-head">
                <h3>Quick actions</h3>
                <p>Fast changes with gentle motion.</p>
              </div>

              <div className="tl-inline-actions tl-checklist-actions">
                <button className="tl-btn tl-btn-primary" type="button" onClick={handleAddItem}>
                  + add item to checklist
                </button>
                <button className="tl-btn" type="button" onClick={handleResetAll}>
                  Reset all
                </button>
                <button className="tl-btn" type="button" onClick={handleShareChecklist}>
                  Share checklist
                </button>
              </div>

              <form className="tl-checklist-add-form" onSubmit={handleAddItem}>
                <label>
                  <span>Section</span>
                  <select value={newItemSection} onChange={(event) => setNewItemSection(event.target.value)}>
                    {checklistState.sections.map((section) => (
                      <option key={section.id} value={section.id}>{section.title}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>New item</span>
                  <input
                    type="text"
                    value={newItemLabel}
                    onChange={(event) => setNewItemLabel(event.target.value)}
                    placeholder="Add a custom item"
                  />
                </label>

                <button className="tl-btn tl-btn-primary" type="submit">Add to list</button>
              </form>
            </section>

            <section className="tl-checklist-panel tl-fade-card tl-checklist-tip-card">
              <div className="tl-panel-head">
                <h3>Travel note</h3>
                <p>Small prompt, big clarity.</p>
              </div>
              <p>
                Start with documents, then clothes, then electronics. The checklist saves per trip so you can come back later without losing progress.
              </p>
            </section>
          </aside>
        </section>

        {statusMessage ? <p className="tl-success tl-checklist-message">{statusMessage}</p> : null}
        {errorMessage ? <p className="tl-error tl-checklist-message">{errorMessage}</p> : null}
      </main>
    </div>
  )
}