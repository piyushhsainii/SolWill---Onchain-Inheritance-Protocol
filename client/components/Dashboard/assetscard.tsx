'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ExternalLink, Copy, Check, Loader2 } from 'lucide-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { Asset, useWillStore, VaultAccount } from '@/app/store/useWillStore'

// interface TokenAsset {
//     mint: string
//     symbol: string
//     amount: number
//     icon?: string
//     usdValue?: number
// }

// const MOCK_ASSETS: TokenAsset[] = [
//     {
//         mint: '4ohwDPjnsyKuk9HpsghAE7X8BzxVSCZTXFXcjRK1LK8o',
//         symbol: 'Solana',
//         amount: 1,
//         icon: 'https://cryptologos.cc/logos/solana-sol-logo.png',
//         usdValue: 142.5,
//     },
//     {
//         mint: '4ohwDPjnsyKuk9HpsghAE7X8BzxVSCZTXFXcjRK1LK8o',
//         symbol: 'USDC',
//         amount: 2000,
//         icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
//         usdValue: 2000,
//     },
// ]

interface MintDetails {
    address: string
    decimals: number
    supply: string
    isInitialized: boolean
    freezeAuthority: string | null
    mintAuthority: string | null
}

function shortAddr(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`
}

function TokenDialog({ token, onClose }: { token: Asset; onClose: () => void }) {
    const [details, setDetails] = useState<MintDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        async function fetchMint() {
            try {
                const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
                const mintPubkey = new PublicKey(token.mint)
                const mintInfo = await getMint(connection, mintPubkey)
                setDetails({
                    address: token.mint,
                    decimals: mintInfo.decimals,
                    supply: mintInfo.supply.toString(),
                    isInitialized: mintInfo.isInitialized,
                    freezeAuthority: mintInfo.freezeAuthority?.toBase58() ?? null,
                    mintAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
                })
            } catch (e) {
                setError('Could not fetch mint data from blockchain.')
            } finally {
                setLoading(false)
            }
        }
        fetchMint()
    }, [token.mint])

    function copyAddr() {
        navigator.clipboard.writeText(token.mint)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(26,26,24,0.38)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '420px',
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 24px 64px rgba(36,43,53,0.16)',
                    overflow: 'hidden',
                }}
            >
                {/* Dialog header */}
                <div style={{
                    padding: '20px 20px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {token.icon
                            ? <img src={token.icon} style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt={token.symbol} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            : <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{token.symbol[0]}</span>
                        }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '17px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{token.symbol}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Token details</div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text-secondary)',
                            flexShrink: 0,
                            transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)' }}
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Mint address row */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Mint Address
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span style={{
                            fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace',
                            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
                        }}>
                            {token.mint}
                        </span>
                        <button
                            onClick={copyAddr}
                            style={{
                                flexShrink: 0, padding: '5px 10px', borderRadius: '8px',
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                        <a
                            href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                flexShrink: 0, padding: '5px 8px', borderRadius: '8px',
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center',
                                cursor: 'pointer', color: 'var(--text-secondary)',
                                transition: 'all 0.15s ease', textDecoration: 'none',
                            }}
                        >
                            <ExternalLink size={12} />
                        </a>
                    </div>
                </div>

                {/* Mint details body */}
                <div style={{ padding: '20px' }}>
                    {loading && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', padding: '24px 0', color: 'var(--text-muted)',
                        }}>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '14px' }}>Fetching on-chain data…</span>
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '14px', borderRadius: 'var(--radius-md)',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            color: 'var(--danger)', fontSize: '13px',
                        }}>
                            {error}
                        </div>
                    )}

                    {details && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {([
                                { label: 'Decimals', value: details.decimals.toString(), mono: true },
                                { label: 'Total Supply', value: Number(details.supply).toLocaleString(), mono: true },
                                { label: 'Initialized', value: details.isInitialized ? '✓ Yes' : '✗ No', mono: false },
                                { label: 'Mint Authority', value: details.mintAuthority ? shortAddr(details.mintAuthority) : 'None (frozen)', mono: false },
                                { label: 'Freeze Authority', value: details.freezeAuthority ? shortAddr(details.freezeAuthority) : 'None', mono: false },
                            ] as { label: string; value: string; mono: boolean }[]).map(({ label, value, mono }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '11px 14px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg)', border: '1px solid var(--border)',
                                        gap: '12px',
                                    }}
                                >
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                                    <span style={{
                                        fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
                                        fontFamily: mono ? 'monospace' : 'inherit',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {value}
                                    </span>
                                </div>
                            ))}

                            {/* Holdings row */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '11px 14px', borderRadius: 'var(--radius-md)',
                                background: 'var(--primary)',
                                marginTop: '4px', gap: '12px',
                            }}>
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>Your holdings</span>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', fontFamily: 'monospace' }}>
                                    {token.amount.toLocaleString()} {token.symbol}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    )
}

export default function LockedAssets() {
    const router = useRouter()
    const [selected, setSelected] = useState<Asset | null>(null)

    const {
        vaultAccount
    } = useWillStore()

    return (
        <>
            <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-card)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                contain: 'layout',  // hard browser-level containment
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 20px 14px',
                    gap: '12px', minWidth: 0,
                }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em',
                            textTransform: 'uppercase', fontWeight: 500,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            Locked Assets Architecture
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {vaultAccount?.assets.length} token{vaultAccount?.assets.length !== 1 ? 's' : ''} secured in vault
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/manage-funds')}
                        style={{
                            flexShrink: 0,
                            padding: '7px 16px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            fontSize: '13px', fontWeight: 400, color: 'var(--text-primary)',
                            cursor: 'pointer', letterSpacing: '-0.01em',
                            transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)' }}
                    >
                        Manage
                    </button>
                </div>

                {/* Token list */}
                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
                    {vaultAccount?.assets.map((asset, i) => (
                        <motion.div
                            key={i}
                            onClick={() => setSelected(asset)}
                            whileHover={{ scale: 1.008, boxShadow: 'var(--shadow-hover)' }}
                            whileTap={{ scale: 0.995 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '13px 14px', borderRadius: 'var(--radius-lg)',
                                background: 'var(--surface)', border: '1px solid var(--border)',
                                cursor: 'pointer', boxShadow: 'var(--shadow-card)',
                                minWidth: 0, overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#c8c8c2' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'var(--bg)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, overflow: 'hidden',
                            }}>
                                {asset.icon
                                    ? <img src={asset.icon} style={{ width: '26px', height: '26px', objectFit: 'contain' }} alt={asset.symbol} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                    : <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{asset.symbol[0]}</span>
                                }
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                    {asset.symbol}
                                </div>
                                <div style={{
                                    fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    fontFamily: 'monospace',
                                }}>
                                    {shortAddr(asset.mint ?? "")}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                    {asset.amount.toLocaleString()}
                                </div>
                                {asset.usdValue !== undefined && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        ${asset.usdValue.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div style={{ color: 'var(--border)', flexShrink: 0 }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                    marginTop: '14px',
                    minWidth: 0,
                }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                            Total Managed Estate Value
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginTop: '2px' }}>
                            ${ }
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => router.push('/manage-funds')}
                        style={{
                            flexShrink: 0,
                            width: '42px', height: '42px', borderRadius: '50%',
                            background: 'var(--primary)', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#ffffff',
                            boxShadow: '0 4px 16px rgba(36,43,53,0.22)',
                        }}
                    >
                        <Plus size={18} strokeWidth={2} />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {selected && <TokenDialog token={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </>
    )
}