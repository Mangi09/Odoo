const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = isJson ? payload?.error?.message || payload?.message : payload
    throw new Error(message || 'Request failed')
  }

  return payload
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, signal } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  })

  return parseResponse(response)
}

export { API_BASE_URL }
