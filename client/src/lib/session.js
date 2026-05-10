const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const USER_ID_KEYS = ['traveloop_user_id', 'userId', 'currentUserId']

function readUserIdFromKnownKeys() {
  for (const key of USER_ID_KEYS) {
    const value = localStorage.getItem(key)
    if (value && value.length >= 10) {
      return value
    }
  }

  const userJson = localStorage.getItem('traveloop_user')
  if (userJson) {
    try {
      const parsed = JSON.parse(userJson)
      if (parsed?.id) {
        return parsed.id
      }
    } catch {
      return null
    }
  }

  return null
}

export function getCurrentUserId() {
  const existing = readUserIdFromKnownKeys()
  if (existing) {
    localStorage.setItem('traveloop_user_id', existing)
    return existing
  }

  localStorage.setItem('traveloop_user_id', DEMO_USER_ID)
  return DEMO_USER_ID
}

export function setCurrentUserId(userId) {
  if (!userId) {
    return
  }

  localStorage.setItem('traveloop_user_id', userId)
}
