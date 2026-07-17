import { useState, useEffect, useRef } from 'react'

/**
 * 播放器 Hook —— 持有 index，定时 +1，取 steps[index] 给视图渲染
 * 支持：播放/暂停/单步前进/单步后退/调速(0.25×~4×)/拖动进度条
 */
export function usePlayer(steps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const timerRef = useRef(null)

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
    return () => clearTimeout(timerRef.current)
  }, [playing, index, speed, steps.length])

  return {
    index, playing, speed, setSpeed,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    next: () => setIndex(i => Math.min(i + 1, steps.length - 1)),
    prev: () => setIndex(i => Math.max(i - 1, 0)),
    reset: () => { setIndex(0); setPlaying(false) },
    seek: (i) => setIndex(i),
    frame: steps[index] || steps[0],
    total: steps.length
  }
}
