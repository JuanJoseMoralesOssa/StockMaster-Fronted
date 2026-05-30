import { useEffect, useRef } from 'react'

/** Default polling window: refresh the viewed data every 5 minutes. */
export const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000

interface UseAutoRefreshOptions {
  /** Polling interval in ms (default 5 minutes). */
  intervalMs?: number
  /** Disable polling entirely. */
  enabled?: boolean
}

/**
 * Periodically calls `refresh` to keep on-screen data current without a full
 * page reload. Designed as a stale-while-revalidate companion to the in-memory
 * caches: data stays visible while the background refresh runs.
 *
 * Behaviour:
 * - Only fires while the tab is visible (no wasted requests in background tabs).
 * - When the tab regains focus after being away longer than `intervalMs`,
 *   refreshes immediately so a long-idle tab shows fresh data on return.
 * - The latest `refresh` callback is always used, so passing a new function
 *   identity each render does not reset the timer.
 *
 * A browser hard-reload still hits the network for real data because the app's
 * caches are in-memory only (nothing data-related is persisted to storage).
 */
export function useAutoRefresh(
  refresh: () => void,
  { intervalMs = DEFAULT_REFRESH_INTERVAL, enabled = true }: UseAutoRefreshOptions = {},
): void {
  const refreshRef = useRef(refresh)
  const lastRunRef = useRef<number | null>(null)

  // Keep the ref pointing at the latest callback without resetting the timer.
  useEffect(() => {
    refreshRef.current = refresh
  })

  useEffect(() => {
    if (!enabled) return

    lastRunRef.current = Date.now()

    const run = () => {
      lastRunRef.current = Date.now()
      refreshRef.current()
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') run()
    }, intervalMs)

    const handleVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        lastRunRef.current !== null &&
        Date.now() - lastRunRef.current >= intervalMs
      ) {
        run()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intervalMs, enabled])
}
