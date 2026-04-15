'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, Lock, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWillStore } from '../store/useWillStore'

const MOCK_WALLETS = [
    { name: 'Phantom', addr: '7xWbB3mQu9Kp2R4v8jHnL1sZdE6fYtXcA' },
    { name: 'Solflare', addr: '3mQui4v8p7xWbB3mQK9R2L5sZdE6fYtXcB' },
]

export default function ConnectPage() {
    const router = useRouter()
    const { setWallet, willAccount } = useWillStore()

    const handleConnect = async (wallet: typeof MOCK_WALLETS[0]) => {
        const id = toast.loading('Connecting wallet...')
        await new Promise(r => setTimeout(r, 1500))
        toast.dismiss(id)
        setWallet(wallet.addr)
        toast.success(`Connected: ${wallet.name}`)
        router.push(willAccount ? '/dashboard' : '/setup')
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '28px',
                    width: '100%',
                    maxWidth: '400px',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white',
                    }}>
                        <Wallet size={26} />
                    </div>
                    <span style={{ fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '14px', color: 'var(--text-primary)' }}>
                        SOLWILL
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Securing digital legacy
                    </span>
                </div>

                {/* Card */}
                <div style={{
                    width: '100%', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '32px',
                    display: 'flex', flexDirection: 'column', gap: '24px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: '0 0 10px' }}>
                            Connect your vault
                        </h1>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
                            Access your digital estate by linking your primary crypto wallet. Secure, private, and permanent.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {MOCK_WALLETS.map((w) => (
                            <button
                                key={w.name}
                                onClick={() => handleConnect(w)}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                style={{
                                    width: '100%', padding: '14px 20px',
                                    background: 'var(--primary)', color: 'white',
                                    border: 'none', borderRadius: '999px',
                                    fontSize: '15px', fontWeight: 600,
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'space-between',
                                    fontFamily: 'inherit', transition: 'opacity 0.15s',
                                }}
                            >
                                <span>{w.name}</span>
                                <ArrowRight size={16} />
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                        {[{ icon: Shield, label: 'Encrypted' }, { icon: Lock, label: 'Non-Custodial' }].map(({ icon: Icon, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                <Icon size={13} />
                                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: '1.6', margin: 0 }}>
                    By connecting, you agree to our Protocol Terms and acknowledge the immutable nature of on-chain inheritance.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            height: '4px', borderRadius: '999px',
                            width: i === 0 ? '20px' : '8px',
                            background: i === 0 ? 'var(--primary)' : 'var(--border)',
                        }} />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}