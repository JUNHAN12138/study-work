import { useState, useEffect, useRef, useCallback } from 'react'
import type { Frame } from '../algorithms'

export interface PlayerState {
  index: number
  playing: boolean
  speed: number
  setSpeed: (s: number) => void
  play: () => void
  pause: () => void
  next: () => void
  prev: () => void
  reset: () => void
  seek: (i: number) => void
  frame: Frame
  total: number
}

/**
 * 播放器 Hook —— 持有 index，定时 +1，取 steps[index] 给视图渲染
 */
export function usePlayer(steps: Frame[]): PlayerState {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIndex(0)
    setPlaying(false)
  }, [steps])

  useEffect(() => {
    if (!playing) return
    if (index >= steps.length - 1) { setPlaying(false); return }
    const safeSpeed = Math.min(4, Math.max(0.25, speed))
    const delay = 600 / safeSpeed
    timerRef.current = setTimeout(() => setIndex(i => i + 1), delay)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, index, speed, steps.length])

  const play = useCallback(() => setPlaying(true), [])
  const pause = useCallback(() => setPlaying(false), [])
  const next = useCallback(() => setIndex(i => Math.min(i + 1, steps.length - 1)), [steps.length])
  const prev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), [])
  const reset = useCallback(() => { setIndex(0); setPlaying(false) }, [])
  const seek = useCallback((i: number) => setIndex(i), [])

  return {
    index, playing, speed, setSpeed,
    play, pause, next, prev, reset, seek,
    frame: steps[index] ?? steps[0],
    total: steps.length,
  }
}
