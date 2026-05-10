export const DEFAULT_CITY_IMAGE = '/images/cities/default.svg'
export const DEFAULT_COUNTRY_IMAGE = '/images/countries/default.svg'

const cityImages = {
  bali: '/images/cities/bali.svg',
  dubai: '/images/cities/dubai.svg',
  kyoto: '/images/cities/kyoto.svg',
  osaka: '/images/cities/osaka.svg',
  paris: '/images/cities/paris.svg',
  rome: '/images/cities/rome.svg',
  tokyo: '/images/cities/tokyo.svg',
  'swiss alps': '/images/cities/swiss-alps.svg',
}

const countryImages = {
  india: '/images/cities/india.svg',
  japan: '/images/countries/japan.svg',
}

const keywordImages = {
  adventure: '/images/cities/swiss-alps.svg',
  alps: '/images/cities/swiss-alps.svg',
  andaman: '/images/cities/india.svg',
  bali: '/images/cities/bali.svg',
  darjeeling: '/images/cities/india.svg',
  disneyland: '/images/cities/paris.svg',
  dotonbori: '/images/cities/osaka.svg',
  dubai: '/images/cities/dubai.svg',
  europe: '/images/cities/paris.svg',
  goa: '/images/cities/bali.svg',
  himachal: '/images/cities/india.svg',
  japan: '/images/countries/japan.svg',
  kamshet: '/images/cities/india.svg',
  kyoto: '/images/cities/kyoto.svg',
  maldives: '/images/cities/bali.svg',
  manali: '/images/cities/india.svg',
  milan: '/images/cities/rome.svg',
  mountains: '/images/cities/swiss-alps.svg',
  osaka: '/images/cities/osaka.svg',
  paris: '/images/cities/paris.svg',
  rome: '/images/cities/rome.svg',
  scuba: '/images/cities/bali.svg',
  shibuya: '/images/cities/tokyo.svg',
  shimla: '/images/cities/india.svg',
  surfing: '/images/cities/bali.svg',
  switzerland: '/images/cities/swiss-alps.svg',
  tokyo: '/images/cities/tokyo.svg',
  venice: '/images/cities/rome.svg',
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function isUsableLocalImage(value) {
  return typeof value === 'string'
    && value.startsWith('/images/')
    && !value.endsWith('.jpg')
    && !value.includes('/jp/')
}

export function getPlaceImage(place = {}) {
  const provided = place.imageUrl || place.image

  if (isUsableLocalImage(provided)) {
    return provided
  }

  const cityKey = normalize(place.name || place.cityName || place.title)
  const countryKey = normalize(place.country)
  const searchable = [
    place.name,
    place.cityName,
    place.title,
    place.country,
    place.region,
    place.location,
  ].filter(Boolean).join(' ').toLowerCase()

  if (cityImages[cityKey]) {
    return cityImages[cityKey]
  }

  if (countryImages[countryKey]) {
    return countryImages[countryKey]
  }

  const keyword = Object.keys(keywordImages).find((item) => searchable.includes(item))

  return keyword ? keywordImages[keyword] : DEFAULT_CITY_IMAGE
}

export function getTripImage(trip) {
  if (!trip) {
    return DEFAULT_CITY_IMAGE
  }

  if (isUsableLocalImage(trip.coverPhotoUrl)) {
    return trip.coverPhotoUrl
  }

  return getPlaceImage(trip.stops?.[0] || trip)
}

export function handleImageError(event, fallback = DEFAULT_CITY_IMAGE) {
  if (event.currentTarget.src.endsWith(fallback)) {
    return
  }

  event.currentTarget.src = fallback
}
