'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Shield, CheckCircle, ExternalLink, Wallet, Trash2, Plus, AlertCircle, X } from 'lucide-react'
import { mockTx } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useWillStore, type Heir } from '@/app/store/useWillStore'

type ClaimState = 'not-triggered' | 'ready' | 'claimed'

const MAX_HEIRS = 5

// ── Shared inline style helpers ─────────────────────────────────────────────
const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    padding: '28px 24px',
}

const label: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    display: 'block',
}

const input: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
}

const primaryBtn: React.CSSProperties = {
    width: '100%',
    padding: '13px 20px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
}

const ghostBtn: React.CSSProperties = {
    padding: '7px 14px',
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
}

// ── Heir row ─────────────────────────────────────────────────────────────────
function HeirRow({
    heir,
    index,
    onUpdate,
    onRemove,
}: {
    heir: Heir
    index: number
    onUpdate: (id: string, updates: Partial<Omit<Heir, 'id'>>) => void
    onRemove: (id: string) => void
}) {
    const [editing, setEditing] = useState(false)
    const [addr, setAddr] = useState(heir.walletAddress)
    const [bps, setBps] = useState(String(heir.shareBps))

    const save = () => {
        const parsed = parseInt(bps)
        if (!addr.trim() || isNaN(parsed) || parsed < 1 || parsed > 10000) {
            toast.error('Invalid values')
            return
        }
        onUpdate(heir.id, { walletAddress: addr.trim(), shareBps: parsed })
        setEditing(false)
    }

    const cancel = () => {
        setAddr(heir.walletAddress)
        setBps(String(heir.shareBps))
        setEditing(false)
    }

    const COLORS = ['var(--accent)', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    const color = COLORS[index % COLORS.length]
    const initials = heir.walletAddress.slice(0, 2).toUpperCase()

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
                background: 'var(--surface)',
            }}
        >
            {/* Summary row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
            }}>
                <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '12px', fontWeight: 700,
                }}>
                    {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                        {heir.walletAddress}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {index === 0 ? 'Primary' : 'Secondary'} · {heir.shareBps / 100}% share ({heir.shareBps} bps)
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                        onClick={() => setEditing(e => !e)}
                        style={{ ...ghostBtn, padding: '5px 12px', fontSize: '12px' }}
                    >
                        {editing ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                        onClick={() => onRemove(heir.id)}
                        style={{
                            ...ghostBtn, padding: '5px 10px',
                            color: '#EF4444', borderColor: '#FCA5A5',
                            background: '#FEF2F2',
                        }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Inline edit form */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
                    >
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={label}>Wallet Address</label>
                                <input
                                    style={input}
                                    value={addr}
                                    onChange={e => setAddr(e.target.value)}
                                    placeholder="Solana wallet address"
                                    spellCheck={false}
                                />
                            </div>
                            <div>
                                <label style={label}>Share (BPS) — 100 bps = 1%</label>
                                <input
                                    style={input}
                                    type="number"
                                    min={1}
                                    max={10000}
                                    value={bps}
                                    onChange={e => setBps(e.target.value)}
                                    placeholder="e.g. 5000 = 50%"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={save} style={{ ...primaryBtn, width: 'auto', flex: 1 }}>Save</button>
                                <button onClick={cancel} style={{ ...ghostBtn }}>Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ── Add heir form ─────────────────────────────────────────────────────────────
function AddHeirForm({ onAdd, onClose }: { onAdd: (h: Omit<Heir, 'id'>) => void; onClose: () => void }) {
    const [addr, setAddr] = useState('')
    const [bps, setBps] = useState('')

    const submit = () => {
        const parsed = parseInt(bps)
        if (!addr.trim()) { toast.error('Wallet address is required'); return }
        if (isNaN(parsed) || parsed < 1 || parsed > 10000) { toast.error('BPS must be between 1 and 10000'); return }
        onAdd({ walletAddress: addr.trim(), shareBps: parsed })
        toast.success('Heir added')
        onClose()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
                ...card,
                padding: '20px',
                border: '1.5px solid var(--accent)',
                background: '#FAFAFE',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>New Heir</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)' }}>
                    <X size={16} />
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                    <label style={label}>Wallet Address</label>
                    <input
                        style={input}
                        value={addr}
                        onChange={e => setAddr(e.target.value)}
                        placeholder="Solana wallet address"
                        spellCheck={false}
                    />
                </div>
                <div>
                    <label style={label}>Share in BPS (100 bps = 1%)</label>
                    <input
                        style={input}
                        type="number"
                        min={1}
                        max={10000}
                        value={bps}
                        onChange={e => setBps(e.target.value)}
                        placeholder="e.g. 5000 for 50%"
                    />
                </div>
                <button onClick={submit} style={primaryBtn}>Add Heir</button>
            </div>
        </motion.div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ClaimPage() {
    const params = useParams()
    const token = params.token as string
    const { willAccount, vaultAccount, heirs, addHeir, updateHeir, removeHeir } = useWillStore()

    const [claimState, setClaimState] = useState<ClaimState>('not-triggered')
    const [connected, setConnected] = useState(false)
    const [txHash, setTxHash] = useState('')
    const [txPending, setTxPending] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        if (willAccount?.status === 'Triggered' || willAccount?.status === 'Settled') {
            setClaimState('ready')
        }
    }, [willAccount])

    const totalBps = heirs.reduce((sum, h) => sum + h.shareBps, 0)
    const bpsLeft = 10000 - totalBps
    const atLimit = heirs.length >= MAX_HEIRS

    const handleConnect = async () => {
        const id = toast.loading('Connecting wallet...')
        await new Promise(r => setTimeout(r, 1200))
        toast.dismiss(id)
        setConnected(true)
        toast.success('Wallet connected')
    }

    const handleClaim = async () => {
        setTxPending(true)
        await mockTx('Assets claimed successfully!', () => {
            setTxHash('5xK9mQvP3nB7hR2jL1sZ' + Math.random().toString(36).substring(2, 8))
            setClaimState('claimed')
        })
        setTxPending(false)
    }

    const heirShare = 60
    const heirSol = vaultAccount ? (vaultAccount.sol * heirShare / 100).toFixed(2) : '7.86'
    const heirUsdc = vaultAccount ? Math.floor(vaultAccount.usdc * heirShare / 100) : 300

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}
            >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={15} color="white" />
                </div>
                <span style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '14px', color: 'var(--text-primary)' }}>
                    SOLWILL
                </span>
            </motion.div>

            {/* Demo toggle */}
            <button
                onClick={() => setClaimState(s => s === 'not-triggered' ? 'ready' : s === 'ready' ? 'not-triggered' : 'not-triggered')}
                style={{ ...ghostBtn, marginBottom: '24px', fontSize: '12px' }}
            >
                Demo: Toggle State ({claimState})
            </button>

            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* ── Claim states ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={claimState}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                    >

                        {claimState === 'not-triggered' && (
                            <div style={card}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 12px', borderRadius: '999px',
                                    background: '#FFF7ED', color: '#EA580C',
                                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em',
                                    textTransform: 'uppercase', marginBottom: '16px',
                                }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA580C', display: 'inline-block' }} />
                                    Monitoring Active
                                </span>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                                    Will Not Yet Triggered
                                </h2>
                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                                    The will is active but has not triggered yet. The owner is still checking in regularly.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: 'var(--bg)', borderRadius: '10px', marginBottom: '20px' }}>
                                    <Shield size={14} color="var(--text-secondary)" />
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        You'll be notified when assets become claimable.
                                    </span>
                                </div>
                                {!connected ? (
                                    <button onClick={handleConnect} style={primaryBtn}>
                                        Connect Wallet to Verify Identity
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>Wallet connected · Identity verified</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {claimState === 'ready' && (
                            <div style={card}>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 12px', borderRadius: '999px',
                                    background: '#F0FDF4', color: '#16A34A',
                                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em',
                                    textTransform: 'uppercase', marginBottom: '16px',
                                }}>
                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                                    Ready to Claim
                                </span>
                                <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                                    Claim Inheritance
                                </h2>
                                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                                    The will has been triggered. Connect your wallet to claim your share.
                                </p>
                                <div style={{ border: '1.5px solid var(--accent)', borderRadius: '14px', padding: '18px', background: '#FAFAFE', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>Your Share</div>
                                    <div style={{ fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{heirShare}%</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: '2px' }}>of the estate vault</div>
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[{ label: 'SOL', value: `${heirSol} SOL` }, { label: 'USDC', value: `${heirUsdc} USDC` }].map(row => (
                                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                                                <span style={{ fontWeight: 600 }}>{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                        <CheckCircle size={12} color="var(--success)" />
                                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                            Verified On-Chain
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                                        Will triggered after 90-day inactivity. Your wallet address was registered as an heir at will creation. No admin approval required.
                                    </p>
                                </div>
                                {!connected ? (
                                    <button onClick={handleConnect} style={primaryBtn}>Connect Wallet to Claim</button>
                                ) : (
                                    <button onClick={handleClaim} disabled={txPending} style={{ ...primaryBtn, opacity: txPending ? 0.7 : 1 }}>
                                        {txPending ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                                Processing...
                                            </span>
                                        ) : 'Claim assets to my wallet'}
                                    </button>
                                )}
                                <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    Single transaction · Irreversible · On-chain proof
                                </p>
                            </div>
                        )}

                        {claimState === 'claimed' && (
                            <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle size={32} color="var(--success)" />
                                    </div>
                                </motion.div>
                                <div>
                                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Assets Successfully Claimed</h2>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                                        Your inheritance has been transferred to your wallet. Permanently recorded on-chain.
                                    </p>
                                </div>
                                {txHash && (
                                    <a href={`https://solscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                                        View on Solscan <ExternalLink size={13} />
                                    </a>
                                )}
                                <div style={{ background: 'var(--bg)', borderRadius: '12px', padding: '14px', width: '100%', textAlign: 'left' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Transaction Hash</div>
                                    <div style={{ fontSize: '12px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                        {txHash}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* ── Heirs Management ── */}
                <div style={{ ...card }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                                Designated Heirs
                            </h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0' }}>
                                {heirs.length} of {MAX_HEIRS} slots used
                            </p>
                        </div>
                        {!atLimit && (
                            <button
                                onClick={() => setShowAddForm(s => !s)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 14px', borderRadius: '10px',
                                    background: showAddForm ? 'var(--bg)' : 'var(--primary)',
                                    color: showAddForm ? 'var(--text-secondary)' : 'white',
                                    border: showAddForm ? '1px solid var(--border)' : 'none',
                                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                }}
                            >
                                <Plus size={14} />
                                Add Heir
                            </button>
                        )}
                    </div>

                    {/* BPS meter */}
                    {heirs.length > 0 && (
                        <div style={{ marginBottom: '16px', marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total allocation</span>
                                <span style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: totalBps > 10000 ? '#EF4444' : totalBps === 10000 ? '#16a34a' : 'var(--text-secondary)',
                                }}>
                                    {totalBps} / 10000 bps {bpsLeft > 0 ? `(${bpsLeft} remaining)` : totalBps === 10000 ? '✓ Fully allocated' : '⚠ Over-allocated'}
                                </span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '999px', background: 'var(--bg)', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '999px',
                                    background: totalBps > 10000 ? '#EF4444' : totalBps === 10000 ? '#16a34a' : 'var(--accent)',
                                    width: `${Math.min((totalBps / 10000) * 100, 100)}%`,
                                    transition: 'width 0.4s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* Over-alloc warning */}
                    {totalBps > 10000 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: '#FEF2F2', borderRadius: '10px', marginBottom: '12px' }}>
                            <AlertCircle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.5 }}>
                                Total BPS exceeds 10000. Please adjust heir shares so they sum to ≤ 10000.
                            </span>
                        </div>
                    )}

                    {/* Add form */}
                    <AnimatePresence>
                        {showAddForm && (
                            <div style={{ marginBottom: '12px' }}>
                                <AddHeirForm
                                    onAdd={(h) => { addHeir(h); setShowAddForm(false) }}
                                    onClose={() => setShowAddForm(false)}
                                />
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Heir list */}
                    {heirs.length === 0 && !showAddForm ? (
                        <div style={{ padding: '32px 0', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>👤</div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>No heirs added yet</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Add up to {MAX_HEIRS} heirs to receive your estate</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <AnimatePresence>
                                {heirs.map((heir, i) => (
                                    <HeirRow
                                        key={heir.id}
                                        heir={heir}
                                        index={i}
                                        onUpdate={updateHeir}
                                        onRemove={removeHeir}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* At limit notice */}
                    {atLimit && (
                        <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: 'var(--bg)', borderRadius: '10px', marginTop: '12px' }}>
                            <AlertCircle size={14} color="var(--text-secondary)" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                Maximum of {MAX_HEIRS} heirs reached. Remove an heir to add a new one.
                            </span>
                        </div>
                    )}
                </div>

            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}