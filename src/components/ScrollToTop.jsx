import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { resetPageScrollDelayed } from '../lib/scrollReset'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => resetPageScrollDelayed(), [pathname])

  return null
}
