import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import bannerImg from '../assets/banner.png'
import logo from '../assets/logo.png'
import parisImg from '../assets/city_paris.png'
import tokyoImg from '../assets/city_tokyo.png'
import baliImg from '../assets/city_bali.png'
import dubaiImg from '../assets/city_dubai.png'
import newyorkImg from '../assets/city_newyork.png'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

const PLACEHOLDER_CITIES = [
  { id: 'p1', name: 'Paris', country: 'France', region: 'Europe', popularityScore: 97, imageUrl: parisImg },
  { id: 'p2', name: 'Tokyo', country: 'Japan', region: 'Asia', popularityScore: 95, imageUrl: tokyoImg },
  { id: 'p3', name: 'Bali', country: 'Indonesia', region: 'Asia', popularityScore: 91, imageUrl: baliImg },
  { id: 'p4', name: 'Dubai', country: 'UAE', region: 'Middle East', popularityScore: 89, imageUrl: dubaiImg },
  { id: 'p5', name: 'New York', country: 'USA', region: 'North America', popularityScore: 93, imageUrl: newyorkImg }
]

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Dates not available'
  }
  const start = new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${start} - ${end}`
}

function sortCities(cities, sortBy) {
  const list = [...cities]
  list.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    if (sortBy === 'cost') {
      return Number(a.costIndex || 0) - Number(b.costIndex || 0)
    }
    if (sortBy === 'trips') {
      return Number(b.tripCount || 0) - Number(a.tripCount || 0)
    }
    return Number(b.popularityScore || 0) - Number(a.popularityScore || 0)
  })
  return list
}

export default function Home() {
  const userId = useMemo(() => getCurrentUserId(), [])

  const [searchText, setSearchText] = useState('')
  const [groupBy, setGroupBy] = useState('region')
  const [filterValue, setFilterValue] = useState('all')
  const [sortBy, setSortBy] = useState('popularity')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cities, setCities] = useState([])
  const [trips, setTrips] = useState([])

  useEffect(() => {
    let ignore = false

    async function loadHomeData() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const [cityResult, tripResult] = await Promise.all([
          apiFetch('/recommendations/top-regional-selections?limit=15'),
          apiFetch(`/trips?ownerId=${userId}`)
        ])

        if (!ignore) {
          setCities(cityResult.selections || [])
          setTrips(tripResult.trips || [])
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Unable to load homepage data')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadHomeData()

    return () => {
      ignore = true
    }
  }, [userId])

  const cityPool = useMemo(() => (cities.length ? cities : PLACEHOLDER_CITIES), [cities])

  const filterOptions = useMemo(() => {
    const key = groupBy === 'country' ? 'country' : 'region'
    const values = Array.from(new Set(cityPool.map((city) => city[key]).filter(Boolean)))
    return values.sort((a, b) => a.localeCompare(b))
  }, [cityPool, groupBy])

  const visibleCities = useMemo(() => {
    const key = groupBy === 'country' ? 'country' : 'region'

    const filtered = cityPool.filter((city) => {
      if (filterValue !== 'all' && city[key] !== filterValue) {
        return false
      }

      if (!searchText.trim()) {
        return true
      }

      const haystack = `${city.name} ${city.country} ${city.region}`.toLowerCase()
      return haystack.includes(searchText.toLowerCase())
    })

    return sortCities(filtered, sortBy).slice(0, 5)
  }, [cityPool, filterValue, groupBy, searchText, sortBy])

  async function handleSearch(event) {
    event.preventDefault()
    setErrorMessage('')

    try {
      const query = encodeURIComponent(searchText.trim())
      if (!query) {
        const fallback = await apiFetch('/recommendations/top-regional-selections?limit=15')
        setCities(fallback.selections || [])
        return
      }

      const result = await apiFetch(`/cities?search=${query}`)
      setCities(result.cities || [])
    } catch (error) {
      setErrorMessage(error.message || 'Search failed')
    }
  }

  return (
    <div className="tl-page">
      <main className="tl-board tl-home-board">
        <header className="tl-bar tl-home-bar">
          <div className="tl-brand-wrap">
            <img src={logo} alt="Traveloop logo" className="tl-logo" />
            <div className="tl-brand">Traveloop</div>
          </div>

          <Link className="tl-profile" to="/profile" aria-label="User profile">
            <span>U</span>
          </Link>
        </header>

        <div className="tl-home-content">


        <section className="tl-banner tl-banner-home">
          <img src={bannerImg} alt="Traveloop banner" />
          <div className="tl-banner-overlay tl-banner-content">
            <p className="tl-banner-kicker">Blue Mountain Country Club and Resort</p>
            <h1>Treebo Tryst</h1>
            <p className="tl-banner-meta">-02°C  Very Cold</p>
          </div>
        </section>

        <form className="tl-toolbar tl-search-panel" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search destination"
          />
          <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
            <option value="region">Group by region</option>
            <option value="country">Group by country</option>
          </select>
          <select value={filterValue} onChange={(event) => setFilterValue(event.target.value)}>
            <option value="all">Filter</option>
            {filterOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="popularity">Sort by popularity</option>
            <option value="name">Sort by name</option>
            <option value="cost">Sort by cost</option>
            <option value="trips">Sort by trip count</option>
          </select>
          <button className="tl-btn" type="submit">Search</button>
        </form>

        {errorMessage ? <p className="tl-error">{errorMessage}</p> : null}
        {isLoading ? <p className="tl-muted">Loading data...</p> : null}

        <section className="tl-section">
          <h2 className="tl-subtitle">Top Regional Selections</h2>
          <div className="tl-card-grid">
            {visibleCities.map((city) => (
              <article
                className="tl-city-card"
                key={city.id}
                style={city.imageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(255, 154, 60, 0.15), rgba(255, 139, 28, 0.45)), url(${city.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                <h3>{city.name}</h3>
                <p>{city.country}</p>
                <small>{city.region} | Popularity {city.popularityScore || 0}</small>
              </article>
            ))}
            {!visibleCities.length ? <p className="tl-muted">No matching cities found.</p> : null}
          </div>
        </section>

        <section className="tl-section">
          <h2 className="tl-subtitle">Previous Trips</h2>
          <div className="tl-trip-row">
            {trips.slice(0, 3).map((trip) => (
              <Link className="tl-trip-tile" key={trip.id} to={`/trips/${trip.id}`}>
                <h3>{trip.title}</h3>
                <p>{formatDateRange(trip.startDate, trip.endDate)}</p>
                <small>{trip.destinationCount || 0} stops</small>
              </Link>
            ))}
            {!trips.length ? <p className="tl-muted">No trips yet. Click Plan a trip to create your first one.</p> : null}
          </div>
        </section>
        </div>
        <Link className="tl-floating-plan" to="/plan">Plan a trip</Link>
      </main>
    </div>
  )
}
