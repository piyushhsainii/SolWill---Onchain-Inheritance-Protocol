'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Users } from 'lucide-react'
import { useWillStore } from '@/app/store/useWillStore'
import type { Heir } from '@/app/store/useWillStore'
import { useUpdateHeir } from '@/lib/hooks/useUpdateHeir'
import { useRemoveHeir } from '@/lib/hooks/useRemoveHeir'

export default function ManageHeirsPage() {
    // ── Individual selectors — prevents setState-during-render ───────────────
    const heirs = useWillStore((s) => s.heirs)
    const addHeir = useWillStore((s) => s.addHeir)

    const { executeUpdateHeir, loading: updateLoading } = useUpdateHeir()
    const { executeRemoveHeir, loading: removeLoading, removingId } = useRemoveHeir()

    const [draftAddress, setDraftAddress] = useState('')
    const [draftBps, setDraftBps] = useState('')
    const [error, setError] = useState('')

    const totalBps = useMemo(
        () => heirs.reduce((sum, h) => sum + (Number(h.shareBps) || 0), 0),
        [heirs],
    )

    // 1) Add state:
    const [edits, setEdits] = useState<Record<string, { walletAddress: string; shareBps: string }>>({})

    // 2) Helpers:
    const getDraft = (heir: Heir) => edits[heir.id] ?? {
        walletAddress: heir.walletAddress ?? '',
        shareBps: String(heir.shareBps ?? ''),
    }

    const updateDraft = (heir: Heir, field: 'walletAddress' | 'shareBps', value: string) => {
        const current = getDraft(heir)
        setEdits(prev => ({
            ...prev,
            [heir.id]: { ...current, [field]: value }
        }))
    }


    // ── Add ──────────────────────────────────────────────────────────────────
    const handleAdd = () => {
        const address = draftAddress.trim()
        const bps = Number(draftBps)

        if (!address) return setError('Enter a wallet address.')
        if (!bps || bps <= 0) return setError('Enter a valid bps value.')
        if (totalBps + bps > 100) return setError('Total bps cannot exceed 100.')
        if (heirs.length >= 5) return setError('Maximum 5 heirs allowed.')

        addHeir({ walletAddress: address, shareBps: bps, onChain: false })
        setDraftAddress('')
        setDraftBps('')
        setError('')
    }

    const handleAddressChange = (id: string, walletAddress: string) => {
        const heir = heirs.find((h) => h.id === id)
        if (!heir) return

        executeUpdateHeir(
            id,                         // storeId
            heir.walletAddress,         // currentWalletAddress
            walletAddress,              // newWalletAddress
            Number(heir.shareBps) || 0  // updatedBps
        )
    }

    // ── Update bps inline ───────────────────────────────────
    const handleBpsChange = (id: string, value: string) => {
        const heir = heirs.find((h) => h.id === id)
        if (!heir) return

        const newBps = Number(value) || 0

        const otherSum = heirs
            .filter((h) => h.id !== id)
            .reduce((sum, h) => sum + (Number(h.shareBps) || 0), 0)

        if (otherSum + newBps > 100) {
            setError('Total bps cannot exceed 100.')
            return
        }

        setError('')

        executeUpdateHeir(
            id,                         // storeId
            heir.walletAddress,         // currentWalletAddress
            heir.walletAddress,         // keep same wallet
            newBps                      // updatedBps
        )
    }

    // ── Remove ──────────────────────────────────────────────
    const handleRemove = (id: string) => {
        const heir = heirs.find((h) => h.id === id)
        if (!heir) return

        executeRemoveHeir(
            id,                         // storeId
            heir.walletAddress,         // heirWalletAddress
            heir.walletAddress,         // newHeirAddress (same if required by IDL)
            Number(heir.shareBps) || 0  // bps
        )
    }

    const truncate = (v: string | undefined) => {
        if (!v) return '—'
        return v.length > 10 ? `${v.slice(0, 4)}...${v.slice(-4)}` : v
    }

    return (
        <div style={{
            maxWidth: 1100, margin: '0 auto', padding: 24,
            display: 'grid', gap: 22, background: '#EEEEE9', minHeight: '100vh',
        }}>

            {/* ── TOP CARD ─────────────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={card}>
                <div style={eyebrow}>MANAGE HEIRS</div>
                <div style={title}>Beneficiary Controls</div>
                <p style={desc}>
                    Add heirs and assign basis points. Total allocation can never exceed 100 bps.
                </p>

                {/* Allocation bar */}
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={meta}>Allocated</span>
                        <span style={meta}>{totalBps} / 100</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: '#E4E4DF', overflow: 'hidden' }}>
                        <motion.div
                            animate={{ width: `${Math.min((totalBps / 100) * 100, 100)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: '#242B35', borderRadius: 999 }}
                        />
                    </div>
                    <div style={{ ...meta, marginTop: 8 }}>Remaining: {100 - totalBps}</div>
                </div>

                {/* Add row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 180px', gap: 12 }}>
                    <input
                        placeholder="Wallet Address"
                        value={draftAddress}
                        onChange={(e) => setDraftAddress(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        placeholder="BPS"
                        type="number"
                        min={1}
                        max={100}
                        value={draftBps}
                        onChange={(e) => setDraftBps(e.target.value)}
                        style={inputStyle}
                    />
                    <button onClick={handleAdd} style={primaryBtn}>
                        <Plus size={15} />
                        Add Heir
                    </button>
                </div>

                {error && (
                    <div style={{ marginTop: 12, color: '#dc2626', fontSize: 12, fontWeight: 300 }}>
                        {error}
                    </div>
                )}
            </motion.div>

            {/* ── HEIR CARDS ───────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }} style={card}
            >
                <div style={eyebrow}>CURRENT HEIRS</div>

                {heirs.length === 0 ? (
                    <div style={{ padding: '44px 20px', borderRadius: 22, border: '1px dashed #E4E4DF', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F7F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <Users size={24} color="#555550" />
                        </div>
                        <div style={{ fontSize: 16, color: '#1A1A18', fontWeight: 300 }}>No heirs added yet</div>
                        <div style={{ fontSize: 13, color: '#8A8A82', marginTop: 6 }}>Add your first beneficiary above.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
                        <AnimatePresence>
                            {heirs.map((heir, i) => {
                                const bps = Number(heir.shareBps) || 0
                                const percent = bps / 100
                                const deg = (bps / 100) * 360
                                const isRemoving = removingId === heir.id

                                return (
                                    <motion.div
                                        key={heir.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: isRemoving ? 0.4 : 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: isRemoving ? 0 : -4 }}
                                        style={heirCard}
                                    >
                                        {/* Donut */}
                                        <div style={{
                                            width: 110, height: 110, borderRadius: '50%',
                                            background: `conic-gradient(#242B35 ${deg}deg, #E4E4DF ${deg}deg)`,
                                            padding: 4,
                                        }}>
                                            <div style={{
                                                width: '100%', height: '100%', borderRadius: '50%', background: '#fff',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <div style={{ fontSize: 16, color: '#1A1A18', fontWeight: 300 }}>
                                                    {percent.toFixed(2)}%
                                                </div>
                                                <div style={{ fontSize: 11, color: '#8A8A82' }}>{bps} bps</div>
                                            </div>
                                        </div>

                                        {/* Truncated address display */}
                                        <div style={{ fontSize: 13, color: '#555550' }}>
                                            {truncate(heir.walletAddress)}
                                        </div>

                                        {/* Editable address */}
                                        <input
                                            value={heir.walletAddress ?? ''}
                                            onChange={(e) => handleAddressChange(heir.id, e.target.value)}
                                            placeholder="Wallet address"
                                            style={inputStyle}
                                            disabled={updateLoading}
                                        />

                                        {/* Editable bps */}
                                        <input
                                            type="number"
                                            value={bps}
                                            onChange={(e) => handleBpsChange(heir.id, e.target.value)}
                                            style={inputStyle}
                                            disabled={updateLoading}
                                        />

                                        {/* Remove */}
                                        <button
                                            onClick={() => handleRemove(heir.id)}
                                            disabled={isRemoving || removeLoading}
                                            style={{
                                                ...deleteBtn,
                                                opacity: isRemoving ? 0.5 : 1,
                                                cursor: isRemoving ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {isRemoving ? (
                                                <span style={{ fontSize: 12, color: '#8A8A82' }}>Removing…</span>
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                        </button>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid #E4E4DF',
    borderRadius: 28, padding: 26,
    boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
}

const eyebrow: React.CSSProperties = {
    fontSize: 11, color: '#8A8A82',
    letterSpacing: '0.14em', fontWeight: 300, marginBottom: 10,
}

const title: React.CSSProperties = {
    fontSize: 30, color: '#1A1A18', fontWeight: 300, marginBottom: 10,
}

const desc: React.CSSProperties = {
    fontSize: 14, color: '#555550',
    lineHeight: 1.6, fontWeight: 300, marginBottom: 20,
}

const meta: React.CSSProperties = {
    fontSize: 12, color: '#8A8A82', fontWeight: 300,
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    borderRadius: 16, border: '1px solid #E4E4DF',
    background: '#FFFFFF', color: '#1A1A18',
    fontSize: 14, fontWeight: 300, outline: 'none',
    boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
    border: '1px solid #242B35', background: '#242B35',
    color: '#fff', borderRadius: 16, cursor: 'pointer',
    fontSize: 14, fontWeight: 300,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}

const heirCard: React.CSSProperties = {
    border: '1px solid #E4E4DF', borderRadius: 22,
    padding: 16, background: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
}

const deleteBtn: React.CSSProperties = {
    width: '100%', height: 42, borderRadius: 14,
    border: '1px solid #E4E4DF', background: '#F7F7F4',
    cursor: 'pointer', color: '#1A1A18',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
}