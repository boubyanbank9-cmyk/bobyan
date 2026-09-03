export function markContactMessagesSeen() {
  if (typeof window === 'undefined') return
  try {
    const key = 'alain-contact-seen'
    window.localStorage.setItem(key, String(Date.now()))
  } catch {
    // ignore storage issues
  }
}

export function getContactMessagesSeenCount() {
  if (typeof window === 'undefined') return 0

  try {
    const raw = window.localStorage.getItem('alain-contact-seen')
    return raw ? 1 : 0
  } catch {
    return 0
  }
}
