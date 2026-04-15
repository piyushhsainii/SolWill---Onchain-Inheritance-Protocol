'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Props {
    txPending: boolean
    checkinAnim: boolean
    onCheckin: () => void
    nextVerificationTimestamp: string
    lastCheckin?: number
    intervalSeconds?: number
}

function ProtectionStatusCard({
    txPending,
    checkinAnim,
    onCheckin,
    nextVerificationTimestamp,
    lastCheckin = 0,
    intervalSeconds = 86400,
}: Props) {
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const tracker = useMemo(() => {
        if (!lastCheckin || !intervalSeconds) {
            return {
                progress: 0,
                timeLeft: '--',
                label: 'Awaiting Data',
                color: '#8A8A82',
                bg: '#F7F7F4',
            }
        }

        const nextDue = lastCheckin * 1000 + intervalSeconds * 1000
        const remaining = nextDue - now
        const total = intervalSeconds * 1000

        const elapsed = total - remaining
        const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100)

        const ratioLeft = Math.max(remaining / total, 0)

        let color = '#16A34A'
        let bg = 'rgba(22,163,74,0.08)'
        let label = 'Healthy Window'

        if (ratioLeft <= 0.5 && ratioLeft > 0.2) {
            color = '#D97706'
            bg = 'rgba(217,119,6,0.08)'
            label = 'Attention Needed'
        }

        if (ratioLeft <= 0.2) {
            color = '#DC2626'
            bg = 'rgba(220,38,38,0.08)'
            label = 'Urgent Check-In'
        }

        if (remaining <= 0) {
            color = '#DC2626'
            bg = 'rgba(220,38,38,0.08)'
            label = 'Trigger Window Reached'
        }

        const secs = Math.max(Math.floor(remaining / 1000), 0)

        const days = Math.floor(secs / 86400)
        const hours = Math.floor((secs % 86400) / 3600)
        const mins = Math.floor((secs % 3600) / 60)

        let timeLeft = ''

        if (days > 0) timeLeft += `${days}d `
        if (hours > 0 || days > 0) timeLeft += `${hours}h `
        timeLeft += `${mins}m`

        return {
            progress,
            timeLeft,
            label,
            color,
            bg,
        }
    }, [now, lastCheckin, intervalSeconds])

    return (
        <div
            style={{
                background: '#FFFFFF',
                border: '1px solid #E4E4DF',
                borderRadius: '24px',
                padding: '28px 24px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
            }}
        >
            {/* Header */}
            <div
                className="tracking-tight"
                style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    color: '#8A8A82',
                    letterSpacing: '0.12em',
                    marginBottom: '10px',
                    fontWeight: 300,
                }}
            >
                Active Protection Status
            </div>

            {/* Title */}
            <h2
                className="tracking-tight"
                style={{
                    fontSize: '26px',
                    color: '#1A1A18',
                    margin: '0 0 10px',
                    fontWeight: 300,
                }}
            >
                Estate Secured
            </h2>

            {/* Description */}
            <p
                className="tracking-tight"
                style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#555550',
                    margin: '0 0 28px',
                    fontWeight: 300,
                }}
            >
                Your digital legacy remains protected. Regular identity
                verification prevents automatic recovery execution.
            </p>

            {/* Fingerprint Button */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '28px',
                }}
            >
                <motion.button
                    onClick={onCheckin}
                    disabled={txPending}
                    whileHover={{
                        scale: 1.03,
                    }}
                    whileTap={{ scale: 0.96 }}
                    animate={
                        checkinAnim
                            ? { scale: [1, 0.95, 1.05, 1] }
                            : {}
                    }
                    transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 18,
                    }}
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontFamily: 'inherit',
                        background: '#EEEEE9',
                        position: 'relative',
                        boxShadow: `
                            0 0 0 10px rgba(238,238,233,0.9),
                            0 0 0 22px rgba(247,247,244,0.9),
                            0 8px 30px rgba(36,43,53,0.08)
                        `,
                    }}
                >
                    {!txPending && (
                        <motion.div
                            animate={{
                                scale: [1, 1.08, 1],
                                opacity: [0.55, 0.15, 0.55],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                ease: 'easeInOut',
                            }}
                            style={{
                                position: 'absolute',
                                inset: '-10px',
                                borderRadius: '50%',
                                border: `1px solid ${tracker.color}`,
                            }}
                        />
                    )}

                    {txPending ? (
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '2px solid #242B35',
                                borderTopColor: 'transparent',
                                animation: 'spin 0.7s linear infinite',
                            }}
                        />
                    ) : (
                        <>
                            <Image
                                src="/finger_print.png"
                                alt="Fingerprint"
                                width={42}
                                height={42}
                                style={{
                                    objectFit: 'contain',
                                    opacity: 0.95,
                                }}
                            />

                            <span
                                className="tracking-tight"
                                style={{
                                    fontSize: '11px',
                                    color: '#242B35',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.12em',
                                    fontWeight: 300,
                                }}
                            >
                                Check In
                            </span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Tracker */}
            <div
                style={{
                    background: tracker.bg,
                    border: `1px solid ${tracker.color}22`,
                    borderRadius: '18px',
                    padding: '16px',
                    marginBottom: '14px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                    }}
                >
                    <span
                        className="tracking-tight"
                        style={{
                            fontSize: '12px',
                            color: '#555550',
                            fontWeight: 300,
                        }}
                    >
                        Check-In Window
                    </span>

                    <span
                        className="tracking-tight"
                        style={{
                            fontSize: '12px',
                            color: tracker.color,
                            fontWeight: 300,
                        }}
                    >
                        {tracker.label}
                    </span>
                </div>

                <div
                    style={{
                        height: '7px',
                        borderRadius: '999px',
                        background: '#E4E4DF',
                        overflow: 'hidden',
                        marginBottom: '10px',
                    }}
                >
                    <motion.div
                        animate={{
                            width: `${tracker.progress}%`,
                        }}
                        transition={{ duration: 0.6 }}
                        style={{
                            height: '100%',
                            borderRadius: '999px',
                            background: tracker.color,
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: '11px',
                            color: '#8A8A82',
                            fontWeight: 300,
                        }}
                    >
                        Time Remaining
                    </span>

                    <span
                        style={{
                            fontSize: '14px',
                            color: '#1A1A18',
                            fontWeight: 300,
                        }}
                    >
                        {tracker.timeLeft}
                    </span>
                </div>
            </div>

            {/* Due Row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F7F7F4',
                    border: '1px solid #E4E4DF',
                    borderRadius: '14px',
                    padding: '14px 16px',
                }}
            >
                <span
                    className="tracking-tight"
                    style={{
                        fontSize: '13px',
                        color: '#555550',
                        fontWeight: 300,
                    }}
                >
                    Next verification due
                </span>

                <span
                    className="tracking-tight"
                    style={{
                        fontSize: '13px',
                        color: '#1A1A18',
                        fontWeight: 300,
                    }}
                >
                    {nextVerificationTimestamp}
                </span>
            </div>

            <style>{`
                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    )
}

export default ProtectionStatusCard