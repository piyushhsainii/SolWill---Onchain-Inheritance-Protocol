'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { mockTx } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useWillStore } from '@/app/store/useWillStore'

export default function SettingsPage() {
    const router = useRouter()
    const {
        connected, willAccount, vaultAccount, heirs,
        emailNotifications, checkinReminders, userEmail,
        setEmailNotifications, setCheckinReminders, setUserEmail,
        setTxPending, txPending, reset,
    } = useWillStore()

    const [dissolveInput, setDissolveInput] = useState('')
    const [showDissolveModal, setShowDissolveModal] = useState(false)

    useEffect(() => {
        if (!connected) router.push('/connect')
    }, [connected, router])

    const handleSavePrefs = async () => {
        await mockTx('Preferences saved')
    }

    const handleDissolve = async () => {
        if (dissolveInput !== 'DISSOLVE') return toast.error('Type DISSOLVE to confirm')
        setTxPending(true)
        await mockTx('Will dissolved. Assets returned to your wallet.', () => {
            reset()
        })
        setTxPending(false)
        setShowDissolveModal(false)
        router.push('/connect')
    }

    const intervalDays = willAccount ? Math.floor(willAccount.interval / 86400) : 30

    return (
        <AppLayout>
            <div className="p-6 max-w-2xl">
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your account and protocol configuration.</p>
                </motion.div>

                <div className="flex flex-col gap-5">

                    {/* Notification Preferences */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-6">
                        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Email notifications</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receive updates when will state changes</div>
                                </div>
                                <Toggle value={emailNotifications} onChange={setEmailNotifications} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Check-in reminders</div>
                                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Get reminded before your interval expires</div>
                                </div>
                                <Toggle value={checkinReminders} onChange={setCheckinReminders} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={e => setUserEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                                    style={{ border: '1.5px solid var(--border)', outline: 'none', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <button onClick={handleSavePrefs} className="btn-primary px-6 py-2.5 text-sm self-start">
                                Save Preferences
                            </button>
                        </div>
                    </motion.div>

                    {/* Protocol Settings */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
                        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Will Configuration</h2>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'Check-in Interval', value: `Every ${intervalDays} days` },
                                { label: 'Heirs Registered', value: `${heirs.length} heir${heirs.length !== 1 ? 's' : ''}` },
                                { label: 'Vault Balance', value: vaultAccount ? `${vaultAccount.sol} SOL + ${vaultAccount.usdc} USDC` : '—' },
                                { label: 'Will Status', value: willAccount?.status ?? '—' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/setup">
                            <button className="btn-secondary px-5 py-2.5 text-sm mt-4 flex items-center gap-2">
                                Edit Will Setup <ExternalLink size={14} />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="rounded-[20px] p-6"
                        style={{ background: '#FFF5F5', border: '1.5px solid #FCA5A5' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                            <h2 className="text-base font-bold" style={{ color: '#EF4444' }}>Danger Zone</h2>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Dissolve Will & Reclaim Assets</div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    Permanently closes your will, withdraws all assets from the vault back to your wallet, and deletes all on-chain accounts. This action is irreversible.
                                </p>
                                {vaultAccount && (
                                    <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                        Estimated reclaim: {vaultAccount.sol} SOL + {vaultAccount.usdc} USDC
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowDissolveModal(true)}
                                className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:bg-red-500 hover:text-white"
                                style={{ border: '1.5px solid #EF4444', color: '#EF4444', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                Dissolve Will
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Dissolve Modal */}
            {showDissolveModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card p-6 max-w-sm w-full"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
                            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Are you sure?</h3>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                            This will permanently dissolve your will and return all assets to your wallet. Type <strong>DISSOLVE</strong> to confirm.
                        </p>
                        {vaultAccount && (
                            <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--bg)' }}>
                                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Assets to be reclaimed</div>
                                <div className="text-sm font-bold">{vaultAccount.sol} SOL + {vaultAccount.usdc} USDC</div>
                            </div>
                        )}
                        <input
                            type="text"
                            value={dissolveInput}
                            onChange={e => setDissolveInput(e.target.value)}
                            placeholder="Type DISSOLVE"
                            className="w-full px-4 py-2.5 rounded-xl text-sm mb-4"
                            style={{ border: '1.5px solid var(--border)', outline: 'none', background: 'var(--bg)', fontFamily: 'DM Mono, monospace' }}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDissolveModal(false); setDissolveInput('') }}
                                className="flex-1 py-2.5 rounded-full text-sm font-semibold"
                                style={{ border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDissolve}
                                disabled={dissolveInput !== 'DISSOLVE' || txPending}
                                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-all"
                                style={{
                                    background: dissolveInput === 'DISSOLVE' ? '#EF4444' : 'var(--border)',
                                    color: dissolveInput === 'DISSOLVE' ? 'white' : 'var(--text-secondary)',
                                    border: 'none',
                                    cursor: dissolveInput === 'DISSOLVE' ? 'pointer' : 'not-allowed',
                                }}
                            >
                                {txPending ? 'Processing...' : 'Confirm Dissolution'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ background: value ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer' }}
        >
            <motion.div
                animate={{ x: value ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            />
        </button>
    )
}