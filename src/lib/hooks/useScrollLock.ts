import { useEffect } from "react"

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY

    document.body.classList.add("no-scroll")
    document.documentElement.classList.add("no-scroll")
    // Preserve scroll position via top offset
    document.body.style.top = `-${scrollY}px`

    return () => {
      document.body.classList.remove("no-scroll")
      document.documentElement.classList.remove("no-scroll")
      document.body.style.top = ""
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
