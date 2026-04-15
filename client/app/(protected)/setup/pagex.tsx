'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { Trash2, Plus, Copy, Check, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useWillStore, HeirAccount } from '@/store/useWillStore'
import { mockTx, totalShareBps, generateClaimToken, truncateAddress } from '@/lib/utils'
import toast from 'react-hot-toast'
import AppLayout from '@/components/Applayout'

const INTERVALS = [
    { label: 'Monthly', sublabel: '30 Days', value: 2592000 },
    { label: 'Quarterly', sublabel: '90 Days', value: 7776000 },
    { label: 'Bi-Annually', sublabel: '180 Days', value: 15552000 },
]

export default function SetupPage() {
    // notFound()
    const router = useRouter()
    const { connected, heirs, setHeirs, willAccount, setWillAccount, setTxPending, txPending } = useWillStore()
    const [localHeirs, setLocalHeirs] = useState<HeirAccount[]>(heirs)
    const [selectedInterval, setSelectedInterval] = useState(willAccount?.interval ?? 2592000)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        if (!connected) router.push('/connect')
    }, [connected, router])

    const totalBps = totalShareBps(localHeirs)
    const allocationPct = (totalBps / 100).toFixed(0)
    const isComplete = totalBps === 10000

    const addHeir = () => {
        if (localHeirs.length >= 5) return toast.error('Maximum 5 heirs allowed')
        setLocalHeirs([...localHeirs, {
            id: Date.now().toString(),
            name: '',
            walletAddress: '',
            shareBps: 0,
            claimed: false,
        }])
    }

    const removeHeir = (id: string) => setLocalHeirs(localHeirs.filter(h => h.id !== id))

    const updateHeir = (id: string, field: keyof HeirAccount, value: string | number) => {
        setLocalHeirs(localHeirs.map(h => h.id === id ? { ...h, [field]: value } : h))
    }

    const generateLink = (id: string) => {
        const token = generateClaimToken()
        updateHeir(id, 'claimToken', token)
        toast.success('Claim link generated')
    }

    const copyLink = (token: string, id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/claim/${token}`)
        setCopiedId(id)
        toast.success('Link copied to clipboard')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleConfirm = async () => {
        if (!isComplete) return toast.error('Allocations must total 100%')
        if (localHeirs.some(h => !h.walletAddress)) return toast.error('All heirs need wallet addresses')
        setTxPending(true)
        await mockTx('Will confirmed & assets locked on-chain', () => {
            setHeirs(localHeirs)
            if (willAccount) setWillAccount({ ...willAccount, interval: selectedInterval, status: 'Active' })
        })
        setTxPending(false)
        router.push('/dashboard')
    }

    const intervalDays = Math.floor(selectedInterval / 86400)

    return (
        <AppLayout>
            <div className="p-6 max-w-6xl">
                <div className="text-xs font-semibold mb-6" style={{ color: 'var(--text-secondary)' }}>
                    ← MAIN PROTOCOL SETUP
                </div>

                <div className=" grid grid-cols-[1fr_320px] gap-6">
                    {/* LEFT */}
                    <div className="flex flex-col gap-5">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                                Who should receive
                            </h1>
                            <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                                your digital assets?
                            </h1>
                            <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                                We'll help you ensure your loved ones are protected. Choose who receives your assets and how often you'd like to check in with us.
                            </p>
                        </motion.div>

                        {/* Check-in Schedule */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
                            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Your Check-In Schedule</div>
                            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                How often would you like to confirm everything is okay? If we don't hear from you in this window, your protocol activates.
                            </p>
                            <div className="flex gap-2">
                                {INTERVALS.map(interval => (
                                    <button
                                        key={interval.value}
                                        onClick={() => setSelectedInterval(interval.value)}
                                        className="flex-1 py-2.5 px-3 rounded-full text-sm font-semibold transition-all"
                                        style={{
                                            background: selectedInterval === interval.value ? 'var(--primary)' : 'var(--bg)',
                                            color: selectedInterval === interval.value ? 'white' : 'var(--text-secondary)',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {interval.label}
                                        <span className="block text-xs opacity-70">({interval.sublabel})</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Heirs */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Designated Heirs</div>
                                <span className="text-xs font-semibold" style={{ color: isComplete ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                    Allocation Progress: {allocationPct}% Shared
                                </span>
                            </div>
                            {/* Allocation bar */}
                            <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg)' }}>
                                <motion.div
                                    animate={{ width: `${Math.min(totalBps / 100, 100)}%` }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full rounded-full"
                                    style={{ background: isComplete ? 'var(--accent)' : totalBps > 10000 ? '#EF4444' : '#94A3B8' }}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                {localHeirs.map((heir, i) => (
                                    <div key={heir.id} className="rounded-2xl p-4" style={{ background: 'var(--bg)' }}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--primary)' }}>
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                                        {i === 0 ? 'Primary Recipient' : 'Secondary Recipient'}
                                                    </span>
                                                </div>
                                                <p className="text-xs mt-1 ml-8" style={{ color: 'var(--text-secondary)' }}>
                                                    {i === 0 ? 'The main person to receive your legacy assets.' : 'A family member or trusted friend to include.'}
                                                </p>
                                            </div>
                                            <button onClick={() => removeHeir(heir.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                                                <Trash2 size={14} style={{ color: '#EF4444' }} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-[1fr_100px] gap-3">
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>Wallet Address</label>
                                                <input
                                                    type="text"
                                                    value={heir.walletAddress}
                                                    onChange={e => updateHeir(heir.id, 'walletAddress', e.target.value)}
                                                    placeholder="Enter Solana wallet address"
                                                    className="w-full px-3 py-2 rounded-xl text-xs"
                                                    style={{
                                                        background: 'white',
                                                        border: '1.5px solid var(--border)',
                                                        fontFamily: 'DM Mono, monospace',
                                                        outline: 'none',
                                                        color: 'var(--text-primary)',
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-secondary)' }}>Allocation</label>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={heir.shareBps / 100 || ''}
                                                        onChange={e => updateHeir(heir.id, 'shareBps', Number(e.target.value) * 100)}
                                                        placeholder="0"
                                                        min="0" max="100"
                                                        className="w-full px-3 py-2 rounded-xl text-xs text-center"
                                                        style={{
                                                            background: 'white',
                                                            border: '1.5px solid var(--border)',
                                                            outline: 'none',
                                                            color: 'var(--text-primary)',
                                                        }}
                                                    />
                                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>%</span>
                                                </div>
                                            </div>
                                        </div>
                                        {heir.name !== undefined && (
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    value={heir.name}
                                                    onChange={e => updateHeir(heir.id, 'name', e.target.value)}
                                                    placeholder="Heir name (optional)"
                                                    className="w-full px-3 py-2 rounded-xl text-xs"
                                                    style={{
                                                        background: 'white',
                                                        border: '1.5px solid var(--border)',
                                                        outline: 'none',
                                                        color: 'var(--text-primary)',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {localHeirs.length < 5 && (
                                <button
                                    onClick={addHeir}
                                    className="w-full mt-3 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-gray-100"
                                    style={{ border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    <Plus size={14} /> Add Another Beneficiary
                                </button>
                            )}
                        </motion.div>

                        {/* Share Links */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
                            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Share Claim Link with Heirs</h3>
                            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                                Generate a private link for each heir to access their claim page. Share it securely — anyone with this link can claim if the will triggers.
                            </p>

                            {localHeirs.length === 0 ? (
                                <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>Add heirs above to generate claim links.</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {localHeirs.map((heir, i) => (
                                        <div key={heir.id} className="rounded-xl p-3 flex items-center justify-between gap-3" style={{ background: 'var(--bg)' }}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-primary)' }}>
                                                    {heir.name || `Heir ${i + 1}`}
                                                </span>
                                                {heir.walletAddress && (
                                                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace' }}>
                                                        {truncateAddress(heir.walletAddress)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {heir.claimToken ? (
                                                    <>
                                                        <button
                                                            onClick={() => copyLink(heir.claimToken!, heir.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                                            style={{ background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            {copiedId === heir.id ? <Check size={12} /> : <Copy size={12} />}
                                                            {copiedId === heir.id ? 'Copied!' : 'Copy Link'}
                                                        </button>
                                                        <button
                                                            onClick={() => generateLink(heir.id)}
                                                            className="p-1.5 rounded-full transition-colors hover:bg-gray-200"
                                                            style={{ background: 'white', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            <RefreshCw size={12} style={{ color: 'var(--text-secondary)' }} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => generateLink(heir.id)}
                                                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        Generate Link
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                                <AlertTriangle size={12} style={{ color: '#F59E0B' }} />
                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Share privately. This link grants claim access.
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex flex-col gap-4">
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card p-5 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Peace of Mind</span>
                            </div>

                            {/* Automatic Protection */}
                            <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--bg)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🔒</span>
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Automatic Protection</span>
                                </div>
                                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                                    Your legacy is automatically protected by our Immutable backup. Your beneficiaries only receive assets if you haven't signed in for {intervalDays} days.
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span style={{ color: 'var(--text-secondary)' }}>PROTOCOL HEALTH</span>
                                        <span className="font-semibold text-green-600">READY TO EXECUTE</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                        <div className="h-full rounded-full" style={{ width: isComplete ? '100%' : '60%', background: isComplete ? 'var(--success)' : 'var(--accent)', transition: 'width 0.4s' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Plan Summary */}
                            <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--bg)' }}>
                                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Plan Summary</div>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { label: 'Total Beneficiaries', value: `0${localHeirs.length} People` },
                                        { label: 'Security Check-in', value: `Every ${intervalDays} Days` },
                                        { label: 'Network Transaction Fee', value: '~0.005 SOL' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between">
                                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="rounded-xl p-3 mb-4 flex gap-2" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <span className="text-sm shrink-0">ℹ️</span>
                                <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                                    You can change these settings at any time by simply checking in. Your legacy is always under your control.
                                </p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleConfirm}
                                disabled={txPending || !isComplete}
                                className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: isComplete ? 'var(--primary)' : 'var(--border)',
                                    color: isComplete ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: isComplete ? 'pointer' : 'not-allowed',
                                    opacity: txPending ? 0.7 : 1,
                                }}
                            >
                                {txPending ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>🔒 Confirm & Lock Assets</>
                                )}
                            </button>
                            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
                                Encrypted Smart Contract Protocol
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}