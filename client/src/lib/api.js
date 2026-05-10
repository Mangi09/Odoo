export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const DEMO_USER_ID =
  import.meta.env.VITE_DEMO_USER_ID || '00000000-0000-0000-0000-000000000001'

export const DEMO_TRIP_ID =
  import.meta.env.VITE_DEMO_TRIP_ID || '30000000-0000-0000-0000-000000000001'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed')
  }

  return data
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('traveloop_user')) || null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem('traveloop_user', JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem('traveloop_user')
}

export function getActiveUserId() {
  return getStoredUser()?.id || DEMO_USER_ID
}

// Backwards-compatible alias: some pages import `apiFetch`
export const apiFetch = apiRequest
