'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useCheckinWill } from '@/lib/hooks/useCheckInWill'

interface Props {
    nextVerificationTimestamp: string
    lastCheckin?: number
    intervalSeconds?: number
}

const HOLD_DURATION = 1500

function ProtectionStatusCard({
    nextVerificationTimestamp,
    lastCheckin,
    intervalSeconds = 86400,
}: Props) {
    const { checkinWill, loading: txPending } = useCheckinWill()

    const [now, setNow] = useState(Date.now())
    const [holdProgress, setHoldProgress] = useState(0)
    const [isHolding, setIsHolding] = useState(false)
    const [fired, setFired] = useState(false)
    const [checkinAnim, setCheckinAnim] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const startRef = useRef<number>(0)
    const rafRef = useRef<number>(0)

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    // After tx resolves → flash success state for 2.5s then revert
    useEffect(() => {
        if (!txPending && fired) {
            setShowSuccess(true)
            setCheckinAnim(true)
            const t1 = setTimeout(() => setCheckinAnim(false), 800)
            const t2 = setTimeout(() => {
                setShowSuccess(false)
                setFired(false)
            }, 2800)
            return () => { clearTimeout(t1); clearTimeout(t2) }
        }
    }, [txPending, fired])

    const tracker = useMemo(() => {
        // Fix: use lastCheckin !== undefined instead of !lastCheckin (0 is falsy)
        if (lastCheckin === undefined || !intervalSeconds) {
            return {
                progress: 0,
                secs: 0, mins: 0, hours: 0, days: 0,
                totalRemaining: 0,
                label: 'Awaiting Data',
                color: '#8A8A82',
                bg: '#F7F7F4',
                hasData: false,
            }
        }

        const nextDue = lastCheckin * 1000 + intervalSeconds * 1000
        const remaining = nextDue - now
        const total = intervalSeconds * 1000
        const elapsed = total - remaining
        const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100)
        const ratioLeft = Math.max(remaining / total, 0)

        let color = '#16A34A'
        let bg = 'rgba(22,163,74,0.07)'
        let label = 'Healthy Window'

        if (ratioLeft <= 0.5 && ratioLeft > 0.2) {
            color = '#D97706'; bg = 'rgba(217,119,6,0.07)'; label = 'Attention Needed'
        }
        if (ratioLeft <= 0.2) {
            color = '#DC2626'; bg = 'rgba(220,38,38,0.07)'; label = 'Urgent Check-In'
        }
        if (remaining <= 0) {
            color = '#DC2626'; bg = 'rgba(220,38,38,0.07)'; label = 'Trigger Window Reached'
        }

        const totalSecs = Math.max(Math.floor(remaining / 1000), 0)
        const days = Math.floor(totalSecs / 86400)
        const hours = Math.floor((totalSecs % 86400) / 3600)
        const mins = Math.floor((totalSecs % 3600) / 60)
        const secs = totalSecs % 60

        return { progress, secs, mins, hours, days, totalRemaining: totalSecs, label, color, bg, hasData: true }
    }, [now, lastCheckin, intervalSeconds])

    const startHold = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (txPending || fired || showSuccess) return
        e.preventDefault()
        setIsHolding(true)
        startRef.current = Date.now()

        const tick = () => {
            const elapsed = Date.now() - startRef.current
            const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100)
            setHoldProgress(pct)
            if (pct < 100) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                setFired(true)
                setIsHolding(false)
                setHoldProgress(0)
                checkinWill()
            }
        }
        rafRef.current = requestAnimationFrame(tick)
    }, [txPending, fired, showSuccess, checkinWill])

    const cancelHold = useCallback(() => {
        if (!isHolding) return
        cancelAnimationFrame(rafRef.current)
        setIsHolding(false)
        setHoldProgress(0)
    }, [isHolding])

    const RADIUS = 68
    const CIRC = 2 * Math.PI * RADIUS
    const strokeDash = (holdProgress / 100) * CIRC

    const buttonBg = showSuccess
        ? '#16A34A'
        : (fired && txPending)
            ? '#16A34A'
            : isHolding
                ? '#1A1A18'
                : '#EEEEE9'

    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E4E4DF',
            borderRadius: '24px',
            padding: '28px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            userSelect: 'none',
        }}>
            {/* Header */}
            <div style={{
                fontSize: '10px', textTransform: 'uppercase',
                color: '#8A8A82', letterSpacing: '0.12em',
                marginBottom: '10px', fontWeight: 300,
            }}>
                Active Protection Status
            </div>

            <h2 style={{ fontSize: '26px', color: '#1A1A18', margin: '0 0 10px', fontWeight: 300, letterSpacing: '-0.03em' }}>
                Estate Secured
            </h2>

            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#555550', margin: '0 0 24px', fontWeight: 300, letterSpacing: '-0.01em' }}>
                Your digital legacy remains protected. Regular identity
                verification prevents automatic recovery execution.
            </p>

            {/* Hold Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px', gap: 10 }}>
                <div style={{ position: 'relative', width: 160, height: 160 }}>

                    {/* Ambient pulse rings */}
                    {!isHolding && !txPending && !showSuccess && (
                        <>
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ scale: [1, 1.55 + i * 0.22], opacity: [0.45 - i * 0.1, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.55, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        border: `1.5px solid ${tracker.color}`, pointerEvents: 'none',
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* Success ripple rings */}
                    {showSuccess && !txPending && (
                        <>
                            {[0, 1].map(i => (
                                <motion.div
                                    key={`success-${i}`}
                                    initial={{ scale: 1, opacity: 0.7 }}
                                    animate={{ scale: 2.2 + i * 0.4, opacity: 0 }}
                                    transition={{ duration: 0.9, delay: i * 0.2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        border: '2px solid #16A34A', pointerEvents: 'none',
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* SVG progress ring */}
                    <svg
                        width={160} height={160} viewBox="0 0 160 160"
                        style={{
                            position: 'absolute', inset: 0,
                            transform: 'rotate(-90deg)', pointerEvents: 'none',
                            opacity: isHolding ? 1 : 0, transition: 'opacity 0.2s',
                        }}
                    >
                        <circle cx={80} cy={80} r={RADIUS} fill="none" stroke="rgba(36,43,53,0.1)" strokeWidth={4} />
                        <circle
                            cx={80} cy={80} r={RADIUS} fill="none"
                            stroke="#1A1A18" strokeWidth={4} strokeLinecap="round"
                            strokeDasharray={`${strokeDash} ${CIRC}`}
                            style={{ transition: 'none' }}
                        />
                    </svg>

                    {/* Main button */}
                    <motion.button
                        onMouseDown={startHold}
                        onMouseUp={cancelHold}
                        onMouseLeave={cancelHold}
                        onTouchStart={startHold}
                        onTouchEnd={cancelHold}
                        disabled={txPending || showSuccess}
                        animate={{
                            scale: isHolding ? 0.93 : checkinAnim ? [1, 0.95, 1.06, 1] : 1,
                            backgroundColor: buttonBg,
                        }}
                        transition={{
                            scale: { type: 'spring', stiffness: 320, damping: 22 },
                            backgroundColor: { duration: 0.3 },
                        }}
                        style={{
                            position: 'absolute', inset: 8, borderRadius: '50%',
                            border: 'none',
                            cursor: (txPending || showSuccess) ? 'default' : 'pointer',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: '10px',
                            fontFamily: 'inherit', outline: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            boxShadow: isHolding
                                ? '0 0 0 0px transparent, 0 12px 36px rgba(36,43,53,0.18)'
                                : showSuccess
                                    ? '0 0 0 8px rgba(22,163,74,0.12), 0 0 0 18px rgba(22,163,74,0.06), 0 8px 30px rgba(22,163,74,0.15)'
                                    : '0 0 0 8px rgba(238,238,233,0.85), 0 0 0 18px rgba(247,247,244,0.7), 0 8px 30px rgba(36,43,53,0.07)',
                            transition: 'box-shadow 0.4s ease',
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {txPending ? (
                                <motion.div
                                    key="spinner"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        border: '2.5px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        animation: 'spin 0.65s linear infinite',
                                    }}
                                />
                            ) : showSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                                >
                                    {/* Checkmark SVG */}
                                    <motion.svg
                                        width={48} height={48} viewBox="0 0 48 48" fill="none"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                    >
                                        <motion.path
                                            d="M10 24 L20 34 L38 14"
                                            stroke="white"
                                            strokeWidth={3.5}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            fill="none"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.45, ease: 'easeOut' }}
                                        />
                                    </motion.svg>
                                    <span style={{
                                        fontSize: '10px', color: 'rgba(255,255,255,0.9)',
                                        textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'inherit',
                                    }}>
                                        Verified
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="icon"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
                                >
                                    <Image
                                        src="/scanner.png" alt="Fingerprint"
                                        width={58} height={58}
                                        style={{
                                            objectFit: 'contain',
                                            opacity: isHolding ? 0.4 : 0.95,
                                            filter: isHolding ? 'invert(1)' : 'none',
                                            transition: 'opacity 0.2s, filter 0.2s',
                                        }}
                                    />
                                    <span style={{
                                        fontSize: '10px',
                                        color: isHolding ? 'rgba(255,255,255,0.7)' : '#242B35',
                                        textTransform: 'uppercase', letterSpacing: '0.12em',
                                        fontWeight: 300, fontFamily: 'inherit', transition: 'color 0.2s',
                                    }}>
                                        {isHolding ? 'Hold...' : 'Hold to Check In'}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* Hint / success text below button */}
                <AnimatePresence mode="wait">
                    {showSuccess && !txPending ? (
                        <motion.p
                            key="ok"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            style={{ fontSize: '12px', color: '#16A34A', margin: 0, letterSpacing: '-0.01em' }}
                        >
                            Check-in recorded on-chain ✓
                        </motion.p>
                    ) : isHolding ? (
                        <motion.p
                            key="holding"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            style={{ fontSize: '12px', color: '#8A8A82', margin: 0, letterSpacing: '-0.01em' }}
                        >
                            {Math.ceil(((100 - holdProgress) / 100) * (HOLD_DURATION / 1000))}s remaining…
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* ── Countdown display ── */}
            <div style={{
                background: tracker.bg,
                border: `1px solid ${tracker.color}30`,
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '14px',
            }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '12px',
                }}>
                    <span style={{ fontSize: '12px', color: '#555550', fontWeight: 300 }}>
                        Check-In Window
                    </span>
                    <span style={{ fontSize: '12px', color: tracker.color, fontWeight: 300 }}>
                        {tracker.label}
                    </span>
                </div>

                {/* Progress bar */}
                <div style={{
                    height: '5px', borderRadius: '999px',
                    background: '#E4E4DF', overflow: 'hidden', marginBottom: '14px',
                }}>
                    <motion.div
                        animate={{ width: `${tracker.progress}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{
                            height: '100%', borderRadius: '999px',
                            background: `linear-gradient(90deg, ${tracker.color}88, ${tracker.color})`,
                        }}
                    />
                </div>

                {/* Time units grid */}
                {tracker.hasData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {[
                            { val: tracker.days, unit: 'Days' },
                            { val: tracker.hours, unit: 'Hours' },
                            { val: tracker.mins, unit: 'Mins' },
                            { val: tracker.secs, unit: 'Secs' },
                        ].map(({ val, unit }) => (
                            <div
                                key={unit}
                                style={{
                                    background: 'rgba(255,255,255,0.6)',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                    borderRadius: 12,
                                    padding: '10px 6px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 3,
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    <motion.span
                                        key={val}
                                        initial={{ y: -8, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 8, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            fontSize: '20px',
                                            fontWeight: 300,
                                            color: tracker.color,
                                            letterSpacing: '-0.04em',
                                            fontVariantNumeric: 'tabular-nums',
                                            minWidth: 32,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {String(val).padStart(2, '0')}
                                    </motion.span>
                                </AnimatePresence>
                                <span style={{
                                    fontSize: '9px', textTransform: 'uppercase',
                                    letterSpacing: '0.08em', color: '#8A8A82',
                                }}>
                                    {unit}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Loading skeleton when no data yet */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {['Days', 'Hours', 'Mins', 'Secs'].map(unit => (
                            <div
                                key={unit}
                                style={{
                                    background: 'rgba(228,228,223,0.4)',
                                    borderRadius: 12, padding: '10px 6px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: 3,
                                }}
                            >
                                <span style={{
                                    fontSize: '20px', fontWeight: 300,
                                    color: '#D4D4CF', letterSpacing: '-0.04em',
                                }}>
                                    --
                                </span>
                                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C0C0BB' }}>
                                    {unit}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Due Row */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#F7F7F4', border: '1px solid #E4E4DF',
                borderRadius: '14px', padding: '14px 16px',
            }}>
                <span style={{ fontSize: '13px', color: '#555550', fontWeight: 300 }}>
                    Next verification due
                </span>
                <span style={{ fontSize: '13px', color: '#1A1A18', fontWeight: 300 }}>
                    {nextVerificationTimestamp}
                </span>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default ProtectionStatusCard