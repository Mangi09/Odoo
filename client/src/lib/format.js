export function formatDate(value) {
  if (!value) return 'Not set'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function currencyFormat(value, currency = 'USD') {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getTripPhase(trip) {
  const today = new Date()
  const start = new Date(trip.startDate)
  const end = new Date(trip.endDate)

  today.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  if (trip.status === 'completed' || end < today) return 'completed'
  if (start > today) return 'upcoming'
  return 'ongoing'
}
