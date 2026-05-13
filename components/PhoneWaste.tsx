'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './PhoneWaste.module.css'

type Slide = 0 | 1 | 2
type CamState = 'idle' | 'requesting' | 'active' | 'denied'

interface State {
  slide: Slide
  year: string
  hours: string
  animating: boolean
}

function calcResults(year: string, hours: string) {
  const y = parseInt(year)
  const h = parseFloat(hours)
  const now = new Date()
  const daysOwned = Math.round(
    (now.getFullYear() - y) * 365 + (now.getMonth() / 12) * 365
  )
  const totalHours = Math.round(daysOwned * h)
  const totalYears = totalHours / 8760
  const fullYears = Math.floor(totalYears)
  const months = Math.round((totalYears % 1) * 12)
  const pct = Math.min(100, Math.round((h / 16) * 100))
  const days = Math.round(totalHours / 24)
  return { daysOwned, totalHours, totalYears, fullYears, months, pct, days }
}

function getVerdict(totalYears: number, totalHours: number): string {
  if (totalYears < 0.5) return `${totalHours.toLocaleString()} hours surrendered to a glass rectangle. That's a start.`
  if (totalYears < 1) return `Nearly a full year absorbed. ${totalHours.toLocaleString()} hours of finite biological time, unrecoverable.`
  if (totalYears < 3) return `Years, not hours. You have donated a measurable slice of your life to a device manufacturer. ${totalHours.toLocaleString()} hours total.`
  if (totalYears < 6) return `Critical threshold exceeded. You could have become fluent in three languages. Built something lasting. Instead: ${totalHours.toLocaleString()} hours of scroll.`
  return `SYSTEM ALERT: Loss exceeds all acceptable parameters. ${totalHours.toLocaleString()} hours of irreversible human time exchanged for content. No recovery path exists.`
}

export default function PhoneWaste() {
  const [state, setState] = useState<State>({ slide: 0, year: '', hours: '', animating: false })
  const [visible, setVisible] = useState(false)
  const [barWidth, setBarWidth] = useState(0)
  const [camState, setCamState] = useState<CamState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start webcam
  const startCam = useCallback(async () => {
    setCamState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCamState('active')
    } catch {
      setCamState('denied')
    }
  }, [])

  useEffect(() => {
    startCam()
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [startCam])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [state.slide])

  function goNext(targetSlide: Slide) {
    setState(s => ({ ...s, animating: true }))
    setTimeout(() => {
      setState(s => ({ ...s, slide: targetSlide, animating: false }))
      if (targetSlide === 2) {
        const { pct } = calcResults(state.year, state.hours)
        setTimeout(() => setBarWidth(pct), 200)
      }
    }, 380)
  }

  function reset() {
    setBarWidth(0)
    setState({ slide: 0, year: '', hours: '', animating: false })
  }

  function handleSlide0() {
    const y = parseInt(state.year)
    if (!state.year || y < 2000 || y > 2024) return
    goNext(1)
  }

  function handleSlide1() {
    const h = parseFloat(state.hours)
    if (!state.hours || h < 0.5 || h > 24) return
    goNext(2)
  }

  const results = state.slide === 2 ? calcResults(state.year, state.hours) : null

  const slideClass = [
    styles.slide,
    visible ? styles.slideVisible : '',
    state.animating ? styles.slideExit : '',
  ].join(' ')

  // Result slide gets red/amber dramatic overlay
  const overlayClass = [
    styles.overlay,
    state.slide === 2 ? styles.overlayResult : '',
  ].join(' ')

  return (
    <div className={styles.root}>
      {/* ── WEBCAM BACKGROUND ── */}
      <video
        ref={videoRef}
        className={styles.webcam}
        autoPlay
        playsInline
        muted
      />

      {/* Cam states */}
      {camState === 'idle' || camState === 'requesting' ? (
        <div className={styles.camLoading}>
          <span className={styles.camLoadingDot} />
          <span className={styles.camLoadingText}>REQUESTING CAMERA ACCESS</span>
        </div>
      ) : null}

      {camState === 'denied' && (
        <div className={styles.camDenied}>
          <span className={styles.camDeniedText}>CAMERA DENIED</span>
          <span className={styles.camDeniedSub}>Enable camera for full experience</span>
          <button className={styles.camRetryBtn} onClick={startCam}>RETRY</button>
        </div>
      )}

      {/* Cinematic overlays */}
      <div className={overlayClass} />
      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      {/* Corner marks */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />

      {/* Crosshair center */}
      <div className={styles.crosshairH} />
      <div className={styles.crosshairV} />

      {/* Top bar */}
      <header className={styles.header}>
        <span className={styles.headerLeft}>TE-01 / DEVICE AUDIT</span>
        <span className={styles.headerCenter}>
          <span className={[styles.dot, camState === 'active' ? styles.dotPulse : ''].join(' ')} />
          {camState === 'active' ? 'REC' : 'STANDBY'}
        </span>
        <span className={styles.headerRight}>
          {String(state.slide + 1).padStart(2, '0')}&nbsp;/&nbsp;03
        </span>
      </header>

      {/* Progress ticks */}
      <div className={styles.progressRow}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={[
              styles.progressTick,
              i <= state.slide ? styles.progressTickActive : '',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Slide area */}
      <main className={styles.main}>
        {/* SLIDE 0 — Year */}
        {state.slide === 0 && (
          <div className={slideClass}>
            <div className={styles.slideTag}>INPUT_01 / PURCHASE YEAR</div>
            <h1 className={styles.question}>
              When did you buy<br />your first smartphone?
            </h1>
            <p className={styles.subtext}>Enter the year of purchase</p>
            <div className={styles.inputWrap}>
              <input
                ref={inputRef}
                className={styles.bigInput}
                type="number"
                min="2000"
                max="2024"
                placeholder="2018"
                value={state.year}
                onChange={e => setState(s => ({ ...s, year: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSlide0()}
              />
              <span className={styles.inputUnit}>YYYY</span>
            </div>
            <button className={styles.nextBtn} onClick={handleSlide0}>NEXT &rarr;</button>
            <div className={styles.hint}>or press ENTER</div>
          </div>
        )}

        {/* SLIDE 1 — Daily hours */}
        {state.slide === 1 && (
          <div className={slideClass}>
            <div className={styles.slideTag}>INPUT_02 / DAILY USAGE</div>
            <h1 className={styles.question}>
              What is your daily<br />screen time?
            </h1>
            <p className={styles.subtext}>Average hours per day on your device</p>
            <div className={styles.inputWrap}>
              <input
                ref={inputRef}
                className={styles.bigInput}
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                placeholder="4.5"
                value={state.hours}
                onChange={e => setState(s => ({ ...s, hours: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSlide1()}
              />
              <span className={styles.inputUnit}>HRS / DAY</span>
            </div>
            <button className={styles.nextBtn} onClick={handleSlide1}>CALCULATE &rarr;</button>
            <div className={styles.hint}>or press ENTER</div>
          </div>
        )}

        {/* SLIDE 2 — Results */}
        {state.slide === 2 && results && (
          <div className={slideClass}>
            <div className={styles.slideTag}>OUTPUT_03 / AUDIT COMPLETE</div>

            <div className={styles.resultHeadline}>
              <span className={styles.resultAccent}>
                {results.fullYears > 0 ? `${results.fullYears}Y ${results.months}M` : `${results.months}M`}
              </span>
              <span className={styles.resultLabel}>&nbsp;WASTED</span>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCell}>
                <span className={styles.statVal}>{results.daysOwned.toLocaleString()}</span>
                <span className={styles.statKey}>DAYS OWNED</span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statVal}>{results.totalHours.toLocaleString()}</span>
                <span className={styles.statKey}>TOTAL HOURS</span>
              </div>
              <div className={styles.statCell}>
                <span className={styles.statVal}>{results.days.toLocaleString()}</span>
                <span className={styles.statKey}>EQUIV. DAYS</span>
              </div>
              <div className={styles.statCell}>
                <span className={[styles.statVal, styles.statValAccent].join(' ')}>{results.pct}%</span>
                <span className={styles.statKey}>OF WAKING LIFE</span>
              </div>
            </div>

            <div className={styles.lifeBarLabel}>
              <span>WAKING HOURS CONSUMED</span>
              <span>{results.pct}%</span>
            </div>
            <div className={styles.lifeBarTrack}>
              <div className={styles.lifeBarFill} style={{ width: `${barWidth}%` }} />
            </div>

            <p className={styles.verdict}>{getVerdict(results.totalYears, results.totalHours)}</p>

            <button className={styles.resetBtn} onClick={reset}>↺ RUN AGAIN</button>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className={styles.footer}>
        <span className={styles.footerLeft}>SN: PH-WASTE / REV.2024</span>
        <span className={styles.footerRight}>TEENAGE ENGINEERING INSPIRED</span>
      </footer>
    </div>
  )
}
