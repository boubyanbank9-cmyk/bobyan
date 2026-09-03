/** Force the window to the top (works around scroll-behavior: smooth and restoration). */
export function resetPageScroll() {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch {
    window.scrollTo(0, 0)
  }

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

export function resetPageScrollDelayed() {
  resetPageScroll()

  const timers = [0, 50, 120, 250].map((delay) =>
    window.setTimeout(resetPageScroll, delay)
  )

  return () => timers.forEach((id) => window.clearTimeout(id))
}
