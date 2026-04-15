'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import {
    Plus, UserPlus, ArrowRight, Wallet, ShieldCheck, Users,
    AlertTriangle, TrendingUp, Check, Edit2, Trash2, X, Layers,
} from 'lucide-react'
import Link from 'next/link'
import { useWillStore } from '../../store/useWillStore'
import { daysUntilExpiry, formatTimestamp, mockTx } from '@/lib/utils'
import ProtectionStatusCard from '@/components/ui/protectionStatusCard'

/* ─── Animation Variants ─────────────────────────────────────────────── */
const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
}
const slideRight = {
    hidden: { opacity: 0, x: 52 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, x: -52, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}
const slideLeft = {
    hidden: { opacity: 0, x: -52 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } },
    exit: { opacity: 0, x: 52, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
}

/* ─── Types ──────────────────────────────────────────────────────────── */
interface HeirEntry {
    id: string
    shareBps: number
    address: string
    sharePercentage: number
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function LockIcon({ size, color }: { size: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

function PulsingDot({ color = '#4ade80' }: { color?: string }) {
    return (
        <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
            <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%', background: color,
                animation: 'ping 1.4s cubic-bezier(0,0,0.2,1) infinite', opacity: 0.6,
            }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'block' }} />
        </span>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-secondary)',
        }}>
            {children}
        </span>
    )
}

function Spinner() {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2.5px solid rgba(255,255,255,0.25)',
                borderTopColor: 'white', flexShrink: 0,
            }}
        />
    )
}

/* ─── Onboarding: Step Indicator ─────────────────────────────────────── */
const STEPS = [
    { label: 'Create Will' },
    { label: 'Add Heirs' },
    { label: 'Fund Vault' },
]

type Props = {
    currentStep: number
    completedSteps: boolean[]
}

export function OnboardingProgress({
    currentStep,
    completedSteps,
}: Props) {
    /**
     * FIX:
     * Only previous steps should be "done"
     * Active step should stay active
     * Future steps should stay idle
     */
    const getDone = (index: number) => {
        if (index >= currentStep) return false
        return completedSteps[index] ?? false
    }

    const pct = (currentStep / (STEPS.length - 1)) * 100

    return (
        <div
            className="card"
            style={{
                padding: '22px 16px',
                marginBottom: 28,
                background: 'var(--surface)',
                width: '100%',
            }}
        >
            {/* Top Progress */}
            <div
                style={{
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--border)',
                    overflow: 'hidden',
                    marginBottom: 28,
                }}
            >
                <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{
                        duration: 0.7,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                    style={{
                        height: '100%',
                        borderRadius: 999,
                        background:
                            'linear-gradient(90deg,var(--primary),#3b4656)',
                    }}
                />
            </div>

            {/* Stepper */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: 8,
                }}
            >
                {STEPS.map((step, i) => {
                    const done = getDone(i)
                    const active = i === currentStep

                    return (
                        <div
                            key={step.label}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'flex-start',
                                minWidth: 0,
                            }}
                        >
                            {/* Bubble + Label */}
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <motion.div
                                    animate={{
                                        scale: active ? 1.06 : 1,
                                        background: done
                                            ? '#43d17a'
                                            : active
                                                ? 'linear-gradient(135deg,var(--primary),#3a4555)'
                                                : 'var(--surface)',
                                        borderColor: done
                                            ? '#43d17a'
                                            : active
                                                ? 'rgba(36,43,53,.15)'
                                                : 'var(--border)',
                                        boxShadow: active
                                            ? '0 0 0 4px rgba(36,43,53,.08), var(--shadow-card)'
                                            : 'var(--shadow-card)',
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.23, 1, 0.32, 1],
                                    }}
                                    style={{
                                        width: window.innerWidth < 640 ? 46 : 58,
                                        height: window.innerWidth < 640 ? 46 : 58,
                                        borderRadius: '50%',
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <AnimatePresence mode="wait">
                                        {done ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -30 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0 }}
                                            >
                                                <Check
                                                    size={18}
                                                    strokeWidth={3}
                                                    color="white"
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="num"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: 800,
                                                    color: active
                                                        ? '#fff'
                                                        : 'var(--text-secondary)',
                                                }}
                                            >
                                                {i + 1}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <span
                                    style={{
                                        fontSize: window.innerWidth < 640 ? 11 : 13,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        lineHeight: 1.3,
                                        color: done
                                            ? '#43d17a'
                                            : active
                                                ? 'var(--text-primary)'
                                                : 'var(--text-secondary)',
                                        maxWidth: 90,
                                    }}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector */}
                            {i < STEPS.length - 1 && (
                                <div
                                    style={{
                                        flex: 1,
                                        height: 2,
                                        marginTop: 22,
                                        marginInline: 6,
                                        borderRadius: 999,
                                        background: 'var(--border)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            width: done ? '100%' : '0%',
                                        }}
                                        transition={{
                                            duration: 0.55,
                                            ease: [0.23, 1, 0.32, 1],
                                        }}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: 999,
                                            background:
                                                'linear-gradient(90deg,#43d17a,#62e494)',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
/* ─── Wizard Step 0: Create Will ─────────────────────────────────────── */
/* ─── CreateWillStep ─────────────────────────────────────────────────── */
function CreateWillStep({
    onComplete,
    isLoading,
    dir,
}: {
    onComplete: (intervalDays: number) => void
    isLoading: boolean
    dir: 'forward' | 'back'
}) {
    const [intervalDays, setIntervalDays] = useState(30)
    const intervals = [7, 14, 30, 60, 90]
    const variants = dir === 'forward' ? slideRight : slideLeft

    return (
        <motion.div variants={variants} initial="hidden" animate="show" exit="exit">
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
                    style={{
                        width: 72, height: 72, borderRadius: '22px',
                        background: '#2B2D35',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 18px',
                        boxShadow: '0 12px 32px rgba(43,45,53,0.28)',
                    }}
                >
                    <ShieldCheck size={32} color="white" />
                </motion.div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                    Create Your On-Chain Will
                </h2>
                <p style={{ fontSize: 13, color: '#5A5A55', lineHeight: 1.65, margin: 0, maxWidth: 380, marginInline: 'auto' }}>
                    Set your check-in interval. Miss it and the recovery protocol triggers automatically — protecting your heirs.
                </p>
            </div>

            <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A85', display: 'block', marginBottom: 12 }}>
                    Check-in Interval
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {intervals.map(d => (
                        <motion.button
                            key={d}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setIntervalDays(d)}
                            style={{
                                padding: '9px 22px', borderRadius: 11, cursor: 'pointer',
                                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                                border: `1.5px solid ${intervalDays === d ? '#2B2D35' : 'rgba(0,0,0,0.16)'}`,
                                background: intervalDays === d ? 'rgba(43,45,53,0.08)' : '#F5F5F0',
                                color: intervalDays === d ? '#2B2D35' : '#5A5A55',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {d}d
                        </motion.button>
                    ))}
                </div>
            </div>

            <div style={{
                background: '#F5F5F0', borderRadius: 14, padding: '15px 18px',
                display: 'flex', alignItems: 'center', gap: 13, marginBottom: 28,
                border: '0.5px solid rgba(0,0,0,0.09)',
            }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: 'rgba(43,45,53,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <LockIcon size={16} color="#2B2D35" />
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
                        Secured by Solana smart contracts
                    </div>
                    <div style={{ fontSize: 11, color: '#5A5A55', marginTop: 2 }}>
                        Immutable once deployed. Verify every {intervalDays} days to stay active.
                    </div>
                </div>
            </div>

            <motion.button
                whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 10px 28px rgba(43,45,53,0.35)' } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                onClick={() => onComplete(intervalDays)}
                disabled={isLoading}
                style={{
                    width: '100%', padding: '14px 24px', borderRadius: 14,
                    background: isLoading ? 'rgba(0,0,0,0.16)' : '#2B2D35',
                    color: isLoading ? '#8A8A85' : 'white',
                    border: 'none', fontSize: 14, fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    transition: 'background 0.25s ease, color 0.25s ease',
                }}
            >
                {isLoading ? <><Spinner /> Deploying Contract…</> : <>Create Will <ArrowRight size={16} /></>}
            </motion.button>
        </motion.div>
    )
}

/* ─── Wizard Step 1: Add Heirs ───────────────────────────────────────── */
function AddHeirsStep({
    heirs,
    onAdd,
    onUpdate,
    onRemove,
    onComplete,
    isLoading,
    dir,
}: {
    heirs: HeirEntry[]
    onAdd: (address: string, share: number) => void
    onUpdate: (id: string, address: string, share: number) => void
    onRemove: (id: string) => void
    onComplete: () => void
    isLoading: boolean
    dir: 'forward' | 'back'
}) {
    const [address, setAddress] = useState('')
    const [share, setShare] = useState(100)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editAddr, setEditAddr] = useState('')
    const [editShare, setEditShare] = useState(0)
    const variants = dir === 'forward' ? slideRight : slideLeft

    const totalAllocated = heirs.reduce((s, h) => s + h.sharePercentage, 0)
    const remaining = 100 - totalAllocated
    const effectiveShare = Math.min(share, remaining <= 0 ? 0 : remaining)
    const canAdd = remaining > 0 && address.trim().length > 0
    const canProceed = heirs.length > 0 && totalAllocated === 100
    const avatarColors = ['#2B2D35', '#059669', '#D97706', '#7C3AED', '#2775CA']

    const handleAdd = () => {
        if (!address.trim()) { setError('Wallet address is required'); return }
        if (address.trim().length < 32) { setError('Invalid Solana wallet address'); return }
        if (effectiveShare <= 0) { setError('Allocations already total 100%'); return }
        setError('')
        onAdd(address.trim(), effectiveShare)
        setAddress('')
        setShare(Math.max(remaining - effectiveShare, 1))
    }

    const handleEditSave = (id: string) => {
        onUpdate(id, editAddr, editShare)
        setEditingId(null)
    }

    const handleEditShareChange = (val: number) => {
        const clamped = Math.max(1, Math.min(100, val))
        setEditShare(clamped)
    }

    return (
        <motion.div variants={variants} initial="hidden" animate="show" exit="exit">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
                    style={{
                        width: 72, height: 72, borderRadius: '22px',
                        background: '#2B2D35',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 18px',
                        boxShadow: '0 12px 32px rgba(43,45,53,0.28)',
                    }}
                >
                    <Users size={32} color="white" />
                </motion.div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                    Designate Beneficiaries
                </h2>
                <p style={{ fontSize: 13, color: '#5A5A55', lineHeight: 1.65, margin: 0 }}>
                    Add heirs and allocate estate shares. Allocations must sum to exactly 100%.
                </p>
            </div>

            {/* Add heir form */}
            <div style={{ marginBottom: 18 }}>
                <input
                    value={address}
                    onChange={e => { setAddress(e.target.value); setError('') }}
                    placeholder="Solana wallet address (e.g. 7xKXtg2CW…)"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    style={{
                        width: '100%', padding: '12px 16px', borderRadius: 12, boxSizing: 'border-box',
                        background: '#F5F5F0', border: `1.5px solid ${error ? '#ef4444' : 'rgba(0,0,0,0.16)'}`,
                        color: '#1A1A1A', fontSize: 13, fontFamily: 'inherit',
                        outline: 'none', marginBottom: 4,
                        transition: 'border-color 0.2s',
                    }}
                />
                <AnimatePresence>
                    {error && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ fontSize: 11, color: '#ef4444', margin: '0 0 8px 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertTriangle size={10} /> {error}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Allocation slider */}
                <div style={{ marginBottom: 16 }}>
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            gap: 12,
                            marginBottom: 12,
                            flexWrap: 'wrap',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Allocation
                        </span>

                        <motion.div
                            key={effectiveShare}
                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.18 }}
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: 4,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 26,
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    letterSpacing: '-0.03em',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                {effectiveShare}
                            </span>
                            <span
                                style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                %
                            </span>
                        </motion.div>
                    </div>

                    {/* Slider Card */}
                    <div
                        style={{
                            padding: '14px 14px 12px',
                            borderRadius: 16,
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                height: 12,
                                borderRadius: 999,
                                background: 'var(--surface-hover)',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                            }}
                        >
                            {/* Filled Progress */}
                            <motion.div
                                animate={{ width: `${effectiveShare}%` }}
                                transition={{ duration: 0.18 }}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: `${effectiveShare}%`,
                                    borderRadius: 999,
                                    background:
                                        'linear-gradient(90deg,var(--primary),#3b4656)',
                                }}
                            />

                            {/* Native Range Input */}
                            <input
                                type="range"
                                min={1}
                                max={100}
                                value={share}
                                onChange={(e) => setShare(Number(e.target.value))}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    margin: 0,
                                    opacity: 0,
                                    cursor: 'pointer',
                                    zIndex: 3,
                                }}
                            />

                            {/* Custom Thumb */}
                            <motion.div
                                animate={{
                                    left: `calc(${effectiveShare}% - 11px)`,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 22,
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: 'var(--surface)',
                                    border: '2px solid var(--primary)',
                                    boxShadow:
                                        '0 4px 14px rgba(36,43,53,0.14)',
                                    pointerEvents: 'none',
                                    zIndex: 2,
                                }}
                            />
                        </div>

                        {/* Bottom Labels */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 10,
                                marginTop: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                }}
                            >
                                1%
                            </span>

                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color:
                                        remaining > 0
                                            ? 'var(--text-secondary)'
                                            : '#16a34a',
                                }}
                            >
                                {remaining > 0
                                    ? `${remaining}% available`
                                    : 'Fully allocated'}
                            </span>

                            <span
                                style={{
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    fontWeight: 500,
                                }}
                            >
                                100%
                            </span>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={canAdd ? { scale: 1.02 } : {}}
                    whileTap={canAdd ? { scale: 0.98 } : {}}
                    onClick={handleAdd}
                    disabled={!canAdd}
                    style={{
                        width: '100%', padding: '12px 20px', borderRadius: 12,
                        background: canAdd ? '#2B2D35' : 'rgba(0,0,0,0.16)',
                        color: canAdd ? 'white' : '#8A8A85',
                        border: 'none', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                        cursor: canAdd ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        transition: 'all 0.2s ease',
                    }}
                >
                    <UserPlus size={14} /> Add Heir to Will
                </motion.button>
            </div>

            {/* Allocation summary bar */}
            <AnimatePresence>
                {heirs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: 14, overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A85' }}>
                                Total Allocated
                            </span>
                            <motion.span
                                key={totalAllocated}
                                initial={{ scale: 0.85 }}
                                animate={{ scale: 1 }}
                                style={{
                                    fontSize: 12, fontWeight: 800,
                                    color: totalAllocated === 100 ? '#059669' : totalAllocated > 100 ? '#ef4444' : '#1A1A1A',
                                }}
                            >
                                {totalAllocated}% / 100%
                            </motion.span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.09)', overflow: 'hidden' }}>
                            <motion.div
                                animate={{ width: `${Math.min(totalAllocated, 100)}%` }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                style={{
                                    height: '100%', borderRadius: 999,
                                    background: totalAllocated === 100
                                        ? '#059669'
                                        : totalAllocated > 100
                                            ? '#ef4444'
                                            : '#2B2D35',
                                }}
                            />
                        </div>
                        <AnimatePresence>
                            {totalAllocated !== 100 && totalAllocated > 0 && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{ fontSize: 11, color: '#D97706', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <AlertTriangle size={10} />
                                    {totalAllocated > 100
                                        ? 'Over-allocated — reduce heir shares'
                                        : `Remaining ${100 - totalAllocated}% must be assigned`}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Heir list */}
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
                <AnimatePresence initial={false}>
                    {heirs.map((heir, i) => (
                        <motion.div
                            key={heir.id}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 24, scale: 0.94, transition: { duration: 0.22 } }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                background: '#F5F5F0', borderRadius: 12, padding: '11px 13px',
                                border: `1px solid ${editingId === heir.id ? '#2B2D35' : 'rgba(0,0,0,0.09)'}`,
                                marginBottom: 8,
                                transition: 'border-color 0.2s',
                            }}
                        >
                            {editingId === heir.id ? (
                                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                                    <input
                                        value={editAddr}
                                        onChange={e => setEditAddr(e.target.value)}
                                        style={{
                                            flex: 1, minWidth: 0, padding: '7px 11px', borderRadius: 9,
                                            background: '#FFFFFF', border: '1.5px solid #2B2D35',
                                            color: '#1A1A1A', fontSize: 12, fontFamily: 'inherit', outline: 'none',
                                        }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                        <input
                                            type="number" min={1} max={100} value={editShare}
                                            onChange={e => handleEditShareChange(Number(e.target.value))}
                                            style={{
                                                width: 52, padding: '7px 8px', borderRadius: 9, textAlign: 'center',
                                                background: '#FFFFFF', border: '1.5px solid #2B2D35',
                                                color: '#1A1A1A', fontSize: 12, fontFamily: 'inherit', outline: 'none',
                                            }}
                                        />
                                        <span style={{ fontSize: 11, color: '#8A8A85' }}>%</span>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleEditSave(heir.id)}
                                        style={{ width: 30, height: 30, borderRadius: 8, background: '#059669', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Check size={13} color="white" strokeWidth={3} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => setEditingId(null)}
                                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.09)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <X size={13} color="#5A5A55" />
                                    </motion.button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                        background: avatarColors[i % avatarColors.length],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 11, fontWeight: 800,
                                    }}>
                                        {heir.address.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {heir.address}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(0,0,0,0.09)', overflow: 'hidden' }}>
                                                <motion.div
                                                    animate={{ width: `${heir.sharePercentage}%` }}
                                                    transition={{ duration: 0.5 }}
                                                    style={{ height: '100%', borderRadius: 999, background: avatarColors[i % avatarColors.length] }}
                                                />
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A8A85', flexShrink: 0 }}>
                                                {heir.sharePercentage}%
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                                            onClick={() => { setEditingId(heir.id); setEditAddr(heir.address); setEditShare(heir.sharePercentage) }}
                                            style={{ width: 28, height: 28, borderRadius: 7, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Edit2 size={11} color="#5A5A55" />
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                                            onClick={() => onRemove(heir.id)}
                                            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={11} color="#ef4444" />
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {heirs.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        whileHover={canProceed ? { scale: 1.02, boxShadow: '0 10px 28px rgba(43,45,53,0.28)' } : {}}
                        whileTap={canProceed ? { scale: 0.98 } : {}}
                        onClick={() => canProceed && onComplete()}
                        disabled={!canProceed || isLoading}
                        style={{
                            width: '100%', padding: '14px 24px', borderRadius: 14,
                            background: canProceed ? '#2B2D35' : 'rgba(0,0,0,0.16)',
                            color: canProceed ? 'white' : '#8A8A85',
                            border: 'none', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                            cursor: canProceed && !isLoading ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                            transition: 'all 0.25s ease',
                        }}
                    >
                        {isLoading ? <><Spinner /> Registering on-chain…</> : <>Confirm Beneficiaries <ArrowRight size={16} /></>}
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/* ─── Wizard Step 2: Deposit Funds ───────────────────────────────────── */
function DepositFundsStep({ dir }: { dir: 'forward' | 'back' }) {
    const variants = dir === 'forward' ? slideRight : slideLeft
    return (
        <motion.div variants={variants} initial="hidden" animate="show" exit="exit" style={{ textAlign: 'center' }}>
            <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
                style={{
                    width: 72, height: 72, borderRadius: '22px',
                    background: '#2B2D35',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px',
                    boxShadow: '0 12px 32px rgba(43,45,53,0.28)',
                }}
            >
                <Wallet size={32} color="white" />
            </motion.div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                Fund Your Vault
            </h2>
            <p style={{ fontSize: 13, color: '#5A5A55', lineHeight: 1.65, margin: '0 0 28px', maxWidth: 380, marginInline: 'auto' }}>
                Deposit SOL or SPL tokens into your estate vault. They will be distributed to your heirs automatically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                    { symbol: '◎', name: 'Solana (SOL)', color: '#9945FF', desc: 'Native Solana token' },
                    { symbol: '$', name: 'USD Coin (USDC)', color: '#2775CA', desc: 'Stable digital dollar' },
                ].map(token => (
                    <div key={token.name} style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
                        background: '#F5F5F0', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.09)', textAlign: 'left',
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                            background: token.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: 14, fontWeight: 800,
                        }}>
                            {token.symbol}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{token.name}</div>
                            <div style={{ fontSize: 11, color: '#5A5A55', marginTop: 2 }}>{token.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <Link href="/manage-funds">
                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 28px rgba(43,45,53,0.35)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%', padding: '14px 24px', borderRadius: 14,
                        background: '#2B2D35',
                        color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                    }}
                >
                    Deposit Funds <ArrowRight size={16} />
                </motion.button>
            </Link>
        </motion.div>
    )
}

/* ─── Dashboard: No Assets Fallback ─────────────────────────────────── */
function NoAssetsState() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '28px 16px', textAlign: 'center', flex: 1 }}>
            <div style={{
                width: 50, height: 50, borderRadius: '14px',
                background: '#F5F5F0', border: '1.5px dashed rgba(0,0,0,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Layers size={22} color="#8A8A85" />
            </div>
            <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>No Assets Locked</p>
                <p style={{ fontSize: 12, color: '#5A5A55', lineHeight: 1.5, margin: 0 }}>
                    Deposit SOL or SPL tokens into your vault to protect them.
                </p>
            </div>
            <Link href="/manage-funds">
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#2B2D35', color: 'white',
                        border: 'none', borderRadius: 9, padding: '8px 16px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    Manage Funds <ArrowRight size={12} />
                </motion.button>
            </Link>
        </div>
    )
}

/* ─── Main Dashboard Page ────────────────────────────────────────────── */
export default function DashboardPage() {
    const router = useRouter()

    // Cast to any to allow calling simulated store methods
    const store = useWillStore() as any
    const {
        connected,
        willAccount,
        vaultAccount,
        heirs: storeHeirs,
        setTxPending,
        txPending,
        performCheckin,
    } = store

    // ── Local simulation state ──────────────────────────────────────────
    const [simWill, setSimWill] = useState<any>(willAccount ?? null)
    const [simHeirs, setSimHeirs] = useState<HeirEntry[]>(storeHeirs ?? [])
    const [loadingStep, setLoadingStep] = useState(false)
    const [checkinAnim, setCheckinAnim] = useState(false)
    const [stepDir, setStepDir] = useState<'forward' | 'back'>('forward')

    const activeWill = simWill ?? willAccount
    const activeHeirs: HeirEntry[] = simHeirs.length > 0 ? simHeirs : (storeHeirs ?? [])
    const totalHeirShare = activeHeirs.reduce((s: number, h: HeirEntry) => s + h.sharePercentage, 0)

    // ── Determine current phase ─────────────────────────────────────────
    const phase: 0 | 1 | 2 | 'dashboard' =
        !activeWill ? 0
            : activeHeirs.length === 0 || totalHeirShare !== 100 ? 1
                : !vaultAccount || vaultAccount.totalUsdValue <= 0 ? 2
                    : 'dashboard'

    const completedSteps = [
        !!activeWill,
        activeHeirs.length > 0 && totalHeirShare === 100,
        !!(vaultAccount && vaultAccount.totalUsdValue > 0),
    ]

    // ── Dashboard helpers ───────────────────────────────────────────────
    const daysLeft = activeWill ? daysUntilExpiry(activeWill.lastCheckin, activeWill.interval) : 0
    const intervalDays = activeWill ? Math.floor(activeWill.interval / 86400) : 30
    const progressPct = intervalDays > 0 ? (daysLeft / intervalDays) * 100 : 0
    const isUrgent = daysLeft < 7
    const hasAssets = !!(vaultAccount && vaultAccount.totalUsdValue > 0)
    const avatarColors = ['var(--accent)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    // ── Handlers ────────────────────────────────────────────────────────
    const handleCreateWill = async (days: number) => {
        setLoadingStep(true)
        await mockTx('Will contract deployed', () => {
            const newWill = {
                lastCheckin: Math.floor(Date.now() / 1000),
                interval: days * 86400,
                isActive: true,
            }
            setSimWill(newWill)
            store.createWill?.(newWill)
        })
        setStepDir('forward')
        setLoadingStep(false)
    }

    const handleAddHeir = (address: string, share: number) => {
        const heir: HeirEntry = { id: `${Date.now()}-${Math.random()}`, address, sharePercentage: share, shareBps: 60 }
        setSimHeirs(prev => [...prev, heir])
        store.addHeir?.(heir)
    }

    const handleUpdateHeir = (id: string, address: string, share: number) => {
        setSimHeirs(prev => prev.map(h => h.id === id ? { ...h, address, sharePercentage: share } : h))
        store.updateHeir?.(id, address, share)
    }

    const handleRemoveHeir = (id: string) => {
        setSimHeirs(prev => prev.filter(h => h.id !== id))
        store.removeHeir?.(id)
    }

    const handleHeirsComplete = async () => {
        setLoadingStep(true)
        await mockTx('Beneficiaries registered on-chain', () => {
            store.setHeirs?.(simHeirs)
        })
        setStepDir('forward')
        setLoadingStep(false)
    }

    const handleCheckin = async () => {
        setCheckinAnim(true)
        setTxPending(true)
        await mockTx('Check-in recorded on-chain', performCheckin)
        setTxPending(false)
        setTimeout(() => setCheckinAnim(false), 600)
    }

    if (!connected) return null

    return (
        <>
            <style>{`
                @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
                @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:1} }
            `}</style>

            <div style={{
                width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', padding: '28px', boxSizing: 'border-box',
            }}>
                <div style={{ width: '100%', maxWidth: 1100 }}>

                    {/* ── Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
                    >
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                                Digital Estate Dashboard
                            </h1>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '5px 0 0', letterSpacing: '0.01em' }}>
                                {phase === 'dashboard'
                                    ? 'Monitoring your decentralised legacy protocol.'
                                    : 'Complete setup to activate your estate protection.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <PulsingDot color={phase === 'dashboard' ? '#4ade80' : '#f59e0b'} />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {phase === 'dashboard' ? '1 Node Online' : 'Setup Required'}
                            </span>
                        </div>
                    </motion.div>

                    {/* ── Main Content ── */}
                    <AnimatePresence mode="wait">

                        {/* ═══ ONBOARDING WIZARD ═══ */}
                        {phase !== 'dashboard' && (
                            <motion.div
                                key="wizard"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }}
                                transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                                style={{
                                    display: 'flex', justifyContent: 'center',
                                    minHeight: 'calc(100vh - 160px)', alignItems: 'center',
                                }}
                            >
                                <div style={{
                                    width: '100%', maxWidth: 760,
                                    background: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: 24, padding: '36px 40px',
                                    boxShadow: '0 24px 64px rgba(0,0,0,0.08)',
                                }}>
                                    <OnboardingProgress
                                        currentStep={phase as number}
                                        completedSteps={completedSteps}
                                    />
                                    <AnimatePresence mode="wait">
                                        {phase === 0 && (
                                            <CreateWillStep
                                                key="step-0"
                                                onComplete={handleCreateWill}
                                                isLoading={loadingStep}
                                                dir={stepDir}
                                            />
                                        )}
                                        {phase === 1 && (
                                            <AddHeirsStep
                                                key="step-1"
                                                heirs={activeHeirs}
                                                onAdd={handleAddHeir}
                                                onUpdate={handleUpdateHeir}
                                                onRemove={handleRemoveHeir}
                                                onComplete={handleHeirsComplete}
                                                isLoading={loadingStep}
                                                dir={stepDir}
                                            />
                                        )}
                                        {phase === 2 && (
                                            <DepositFundsStep key="step-2" dir={stepDir} />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* ═══ FULL DASHBOARD ═══ */}
                        {phase === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <motion.div
                                    variants={stagger}
                                    initial="hidden"
                                    animate="show"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(12, 1fr)',
                                        gap: '16px',
                                    }}
                                >
                                    {/* ── 1. Protection Status — 5 cols ── */}
                                    <motion.div variants={fadeUp} style={{ gridColumn: 'span 5' }}>
                                        <motion.div
                                            whileHover={{ y: -2, boxShadow: '0 16px 48px rgba(36,43,53,0.10)', borderColor: '#242B35' }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E4E4DF',
                                                borderRadius: '20px',
                                                padding: '24px',
                                                height: '100%',
                                                boxSizing: 'border-box',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
                                                transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                                            }}
                                        >
                                            <ProtectionStatusCard
                                                txPending={txPending}
                                                checkinAnim={checkinAnim}
                                                onCheckin={handleCheckin}
                                                nextVerificationTimestamp={formatTimestamp(activeWill.lastCheckin + activeWill.interval)}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* ── 2. Assets Architecture — 7 cols ── */}
                                    <motion.div variants={fadeUp} style={{ gridColumn: 'span 7' }}>
                                        <motion.div
                                            whileHover={{
                                                y: -2,
                                                boxShadow: '0 18px 42px rgba(36,43,53,0.08)',
                                                borderColor: '#242B35',
                                            }}
                                            transition={{ duration: 0.22 }}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E4E4DF',
                                                borderRadius: '24px',
                                                padding: '24px',
                                                height: '100%',
                                                boxSizing: 'border-box',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
                                                transition: 'all 0.25s ease',
                                                fontWeight: 300,
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '18px',
                                                }}
                                            >
                                                <span
                                                    className="tracking-tight"
                                                    style={{
                                                        fontSize: '10px',
                                                        textTransform: 'uppercase',
                                                        color: '#8A8A82',
                                                        fontWeight: 300,
                                                        letterSpacing: '0.12em',
                                                    }}
                                                >
                                                    Locked Assets Architecture
                                                </span>

                                                <Link href="/manage-funds">
                                                    <motion.button
                                                        whileHover={{
                                                            scale: 1.03,
                                                            background: '#242B35',
                                                            color: '#FFFFFF',
                                                            borderColor: '#242B35',
                                                        }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="tracking-tight"
                                                        style={{
                                                            background: '#EEEEE9',
                                                            color: '#555550',
                                                            border: '1px solid #E4E4DF',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            cursor: 'pointer',
                                                            padding: '7px 14px',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 300,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        Manage
                                                    </motion.button>
                                                </Link>
                                            </div>

                                            {hasAssets ? (
                                                <>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '6px',
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {[
                                                            {
                                                                bg: 'linear-gradient(135deg,#9945FF,#7c3aed)',
                                                                symbol: '◎',
                                                                name: 'Solana',
                                                                sub: `${vaultAccount?.sol} SOL`,
                                                                value: '$162,520.45',
                                                                change: '+2.4%',
                                                                up: true,
                                                            },
                                                            {
                                                                bg: 'linear-gradient(135deg,#2775CA,#1d4ed8)',
                                                                symbol: '$',
                                                                name: 'USD Coin',
                                                                sub: `${vaultAccount?.usdc} USDC`,
                                                                value: '$25,000.00',
                                                                change: 'Stable',
                                                                up: null,
                                                            },
                                                        ].map((asset, i) => (
                                                            <motion.div
                                                                key={asset.name}
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{
                                                                    delay: 0.15 + i * 0.08,
                                                                    duration: 0.35,
                                                                }}
                                                                whileHover={{
                                                                    background: '#F7F7F4',
                                                                    borderColor: '#242B35',
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    padding: '12px',
                                                                    borderRadius: '16px',
                                                                    border: '1px solid transparent',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '12px',
                                                                            background: asset.bg,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#fff',
                                                                            fontSize: '14px',
                                                                            fontWeight: 300,
                                                                            flexShrink: 0,
                                                                            boxShadow:
                                                                                '0 6px 16px rgba(36,43,53,0.12)',
                                                                        }}
                                                                    >
                                                                        {asset.symbol}
                                                                    </div>

                                                                    <div>
                                                                        <div
                                                                            className="tracking-tight"
                                                                            style={{
                                                                                fontSize: '14px',
                                                                                color: '#1A1A18',
                                                                                fontWeight: 300,
                                                                            }}
                                                                        >
                                                                            {asset.name}
                                                                        </div>
                                                                        <div
                                                                            className="tracking-tight"
                                                                            style={{
                                                                                fontSize: '11px',
                                                                                color: '#8A8A82',
                                                                                marginTop: 2,
                                                                            }}
                                                                        >
                                                                            {asset.sub}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div
                                                                        className="tracking-tight"
                                                                        style={{
                                                                            fontSize: '14px',
                                                                            color: '#1A1A18',
                                                                            fontWeight: 300,
                                                                        }}
                                                                    >
                                                                        {asset.value}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            fontSize: '11px',
                                                                            color:
                                                                                asset.up === true
                                                                                    ? '#16a34a'
                                                                                    : asset.up === false
                                                                                        ? '#dc2626'
                                                                                        : '#8A8A82',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 4,
                                                                            justifyContent: 'flex-end',
                                                                            marginTop: 2,
                                                                            fontWeight: 300,
                                                                        }}
                                                                    >
                                                                        {asset.up === true && (
                                                                            <TrendingUp size={10} />
                                                                        )}
                                                                        {asset.change}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    <div
                                                        style={{
                                                            borderTop: '1px solid #E4E4DF',
                                                            marginTop: '14px',
                                                            paddingTop: '16px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <div>
                                                            <div
                                                                className="tracking-tight"
                                                                style={{
                                                                    fontSize: '11px',
                                                                    color: '#8A8A82',
                                                                    marginBottom: 4,
                                                                    fontWeight: 300,
                                                                }}
                                                            >
                                                                Total Managed Estate Value
                                                            </div>

                                                            <div
                                                                className="tracking-tight"
                                                                style={{
                                                                    fontSize: '24px',
                                                                    color: '#1A1A18',
                                                                    fontWeight: 300,
                                                                }}
                                                            >
                                                                $
                                                                {vaultAccount?.totalUsdValue.toLocaleString()}
                                                            </div>
                                                        </div>

                                                        <Link href="/manage-funds">
                                                            <motion.button
                                                                whileHover={{
                                                                    scale: 1.08,
                                                                    background: '#242B35',
                                                                    borderColor: '#242B35',
                                                                }}
                                                                whileTap={{ scale: 0.95 }}
                                                                style={{
                                                                    width: '38px',
                                                                    height: '38px',
                                                                    borderRadius: '999px',
                                                                    background: '#EEEEE9',
                                                                    border: '1px solid #E4E4DF',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <Plus size={15} color="#555550" />
                                                            </motion.button>
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                <NoAssetsState />
                                            )}
                                        </motion.div>
                                    </motion.div>

                                    {/* ── 3. Verification Window — 3 cols ── */}
                                    <motion.div variants={fadeUp} style={{ gridColumn: 'span 3' }}>
                                        <motion.div
                                            whileHover={{ y: -2, boxShadow: '0 16px 48px rgba(36,43,53,0.10)', borderColor: isUrgent ? '#ef4444' : '#242B35' }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                background: isUrgent ? '#FFF8F8' : '#FFFFFF',
                                                border: `1px solid ${isUrgent ? '#fca5a5' : '#E4E4DF'}`,
                                                borderRadius: '20px',
                                                padding: '24px',
                                                height: '100%',
                                                boxSizing: 'border-box',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
                                                transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                                            }}
                                        >
                                            {isUrgent && (
                                                <div style={{
                                                    position: 'absolute', inset: 0, opacity: 0.03,
                                                    background: '#ef4444', pointerEvents: 'none',
                                                }} />
                                            )}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <motion.div
                                                    key={daysLeft}
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    style={{
                                                        fontSize: '56px', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em',
                                                        color: isUrgent ? '#ef4444' : '#1A1A18',
                                                    }}
                                                >
                                                    {daysLeft}
                                                </motion.div>
                                                {isUrgent && (
                                                    <motion.div
                                                        animate={{ scale: [1, 1.15, 1] }}
                                                        transition={{ repeat: Infinity, duration: 1.8 }}
                                                    >
                                                        <AlertTriangle size={18} color="#ef4444" />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A18', marginBottom: 2 }}>Days Remaining</div>
                                            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A82' }}>
                                                Verification Window
                                            </span>
                                            <p style={{ fontSize: '12px', color: '#8A8A82', lineHeight: 1.65, margin: '12px 0 16px' }}>
                                                Recovery protocol triggers if verification lapses.
                                            </p>
                                            <div style={{ height: '5px', borderRadius: '999px', overflow: 'hidden', background: '#EEEEE9' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progressPct}%` }}
                                                    transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                    style={{
                                                        height: '100%', borderRadius: '999px',
                                                        background: isUrgent
                                                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                                                            : 'linear-gradient(90deg,#242B35,#4A5568)',
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                <span style={{ fontSize: '10px', color: '#8A8A82' }}>0d</span>
                                                <span style={{ fontSize: '10px', color: '#8A8A82' }}>{intervalDays}d</span>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* ── 4. Designated Beneficiaries — 9 cols ── */}
                                    <motion.div variants={fadeUp} style={{ gridColumn: 'span 9' }}>
                                        <motion.div
                                            whileHover={{
                                                y: -2,
                                                boxShadow: '0 18px 42px rgba(36,43,53,0.08)',
                                                borderColor: '#242B35',
                                            }}
                                            transition={{ duration: 0.22 }}
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E4E4DF',
                                                borderRadius: '24px',
                                                padding: '24px',
                                                height: '100%',
                                                boxSizing: 'border-box',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
                                                transition: 'all 0.25s ease',
                                                fontWeight: 300,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <span
                                                    className="tracking-tight"
                                                    style={{
                                                        fontSize: '10px',
                                                        textTransform: 'uppercase',
                                                        color: '#8A8A82',
                                                        fontWeight: 300,
                                                        letterSpacing: '0.12em',
                                                    }}
                                                >
                                                    Designated Beneficiaries
                                                </span>

                                                <Link href="/setup">
                                                    <motion.button
                                                        whileHover={{
                                                            scale: 1.03,
                                                            background: '#242B35',
                                                            color: '#FFFFFF',
                                                            borderColor: '#242B35',
                                                        }}
                                                        whileTap={{ scale: 0.96 }}
                                                        className="tracking-tight"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '11px',
                                                            padding: '7px 14px',
                                                            borderRadius: '999px',
                                                            background: '#EEEEE9',
                                                            color: '#555550',
                                                            border: '1px solid #E4E4DF',
                                                            cursor: 'pointer',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 300,
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <UserPlus size={11} /> Add
                                                    </motion.button>
                                                </Link>
                                            </div>

                                            <p
                                                className="tracking-tight"
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#8A8A82',
                                                    marginBottom: '16px',
                                                    lineHeight: 1.6,
                                                    fontWeight: 300,
                                                }}
                                            >
                                                Authorised entities for automatic estate transfer
                                            </p>

                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns:
                                                        'repeat(auto-fill, minmax(260px, 1fr))',
                                                    gap: '10px',
                                                    flex: 1,
                                                }}
                                            >
                                                <AnimatePresence>
                                                    {activeHeirs.map((heir, i) => {
                                                        const truncated =
                                                            heir.address
                                                                ? `${heir.address.slice(
                                                                    0,
                                                                    4
                                                                )}...${heir.address.slice(-4)}`
                                                                : 'Unknown Beneficiary'

                                                        const bps = heir.shareBps || 0
                                                        const percentage = (bps / 100).toFixed(2)

                                                        return (
                                                            <motion.div
                                                                key={heir.id || i}
                                                                initial={{ opacity: 0, y: 8 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -8 }}
                                                                transition={{
                                                                    delay: 0.05 + i * 0.05,
                                                                }}
                                                                whileHover={{
                                                                    y: -2,
                                                                    background: '#F7F7F4',
                                                                    borderColor: '#242B35',
                                                                }}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    padding: '12px',
                                                                    borderRadius: '16px',
                                                                    border: '1px solid #E4E4DF',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '38px',
                                                                        height: '38px',
                                                                        borderRadius: '50%',
                                                                        flexShrink: 0,
                                                                        background:
                                                                            avatarColors[
                                                                            i %
                                                                            avatarColors.length
                                                                            ],
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#fff',
                                                                        fontSize: '13px',
                                                                        fontWeight: 300,
                                                                    }}
                                                                >
                                                                    {heir.address ? (
                                                                        heir.address
                                                                            .substring(0, 2)
                                                                            .toUpperCase()
                                                                    ) : (
                                                                        <Users size={14} />
                                                                    )}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        flex: 1,
                                                                        overflow: 'hidden',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="tracking-tight"
                                                                        style={{
                                                                            fontSize: '13px',
                                                                            color: '#1A1A18',
                                                                            fontWeight: 300,
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                        }}
                                                                    >
                                                                        {truncated}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            justifyContent:
                                                                                'space-between',
                                                                            alignItems: 'center',
                                                                            marginTop: 5,
                                                                            marginBottom: 6,
                                                                        }}
                                                                    >
                                                                        <span
                                                                            style={{
                                                                                fontSize: '10px',
                                                                                color: '#8A8A82',
                                                                                fontWeight: 300,
                                                                            }}
                                                                        >
                                                                            {bps} bps
                                                                        </span>

                                                                        <span
                                                                            style={{
                                                                                fontSize: '10px',
                                                                                color: '#555550',
                                                                                fontWeight: 300,
                                                                            }}
                                                                        >
                                                                            {percentage}%
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            height: 4,
                                                                            borderRadius: 999,
                                                                            background: '#E4E4DF',
                                                                            overflow: 'hidden',
                                                                        }}
                                                                    >
                                                                        <motion.div
                                                                            animate={{
                                                                                width: `${percentage}%`,
                                                                            }}
                                                                            transition={{
                                                                                duration: 0.5,
                                                                            }}
                                                                            style={{
                                                                                height: '100%',
                                                                                borderRadius: 999,
                                                                                background:
                                                                                    avatarColors[
                                                                                    i %
                                                                                    avatarColors.length
                                                                                    ],
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                </motion.div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}