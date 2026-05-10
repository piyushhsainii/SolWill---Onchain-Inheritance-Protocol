'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Wallet,
    LogOut,
    User2Icon,
    Settings,
    Coins,
} from 'lucide-react'
import { useWillStore } from '@/app/store/useWillStore'
import { usePrivy } from '@privy-io/react-auth'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Funds', href: '/manage-funds', icon: Wallet },
    { label: 'Heirs', href: '/manage-heirs', icon: User2Icon },
    { label: 'Claim', href: '/claim-will', icon: Coins },
    { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { publicKey, connected, setConnected } = useWillStore()
    const { logout } = usePrivy()
    const shortAddr = publicKey
        ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
        : '0x00...0000'

    return (
        <>
            {/* ── DESKTOP SIDEBAR ── */}
            <aside
                className="hidden md:flex"
                style={{
                    width: '232px',
                    minWidth: '232px',
                    height: '100vh',
                    background: 'linear-gradient(180deg, #FAFAF8 0%, #F7F7F4 100%)',
                    borderRight: '1px solid rgba(0,0,0,0.06)',
                    flexDirection: 'column',
                    padding: '20px 12px',
                    position: 'sticky',
                    top: 0,
                    boxShadow: '1px 0 0 0 rgba(0,0,0,0.04), 4px 0 24px rgba(0,0,0,0.03)',
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '11px',
                            padding: '8px 10px',
                            marginBottom: '28px',
                            borderRadius: '14px',
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.08, rotate: -4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '11px',
                                background: '#FFFFFF',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}
                        >
                            <img src="/solwillicon.jpeg" className="h-full w-full object-cover" alt="SolWill" />
                        </motion.div>
                        <div>
                            <div style={{
                                fontSize: '14px',
                                color: '#111110',
                                fontWeight: 500,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.2,
                            }}>
                                SolWill
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#999994',
                                marginTop: '2px',
                                fontWeight: 400,
                                letterSpacing: '-0.01em',
                            }}>
                                Secure Legacy Vault
                            </div>
                        </div>
                    </motion.div>
                </Link>

                {/* Section label */}
                <div style={{
                    fontSize: '10px',
                    color: '#BBBBB5',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0 10px',
                    marginBottom: '6px',
                }}>
                    Navigation
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <Link key={href} href={href} style={{ textDecoration: 'none', position: 'relative' }}>
                                <AnimatePresence>
                                    {active && (
                                        <motion.div
                                            layoutId="activeNavPill"
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '10px',
                                                background: '#FFFFFF',
                                                border: '1px solid rgba(0,0,0,0.07)',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.03)',
                                                zIndex: 0,
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                                <motion.div
                                    whileHover={{ x: active ? 0 : 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '9px 10px',
                                        borderRadius: '10px',
                                        color: active ? '#111110' : '#888882',
                                        fontSize: '13.5px',
                                        fontWeight: active ? 500 : 400,
                                        letterSpacing: '-0.01em',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        zIndex: 1,
                                        transition: 'color 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = '#333330'
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.color = '#888882'
                                        }
                                    }}
                                >
                                    <motion.div
                                        animate={active ? { scale: 1.1 } : { scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '22px',
                                            height: '22px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon
                                            size={16}
                                            color={active ? '#111110' : 'currentColor'}
                                            strokeWidth={active ? 2 : 1.7}
                                        />
                                    </motion.div>
                                    {label}

                                    {/* Active left indicator dot */}
                                    {active && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{
                                                marginLeft: 'auto',
                                                width: '5px',
                                                height: '5px',
                                                borderRadius: '50%',
                                                background: '#111110',
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 30%, rgba(0,0,0,0.06) 70%, transparent)',
                    margin: '12px 4px',
                }} />

                {/* Wallet Card */}
                <motion.div
                    whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                    transition={{ duration: 0.2 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '10px 10px',
                        borderRadius: '14px',
                        border: '1px solid rgba(0,0,0,0.07)',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                >
                    <div style={{
                        borderRadius: '50%',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                        flexShrink: 0,
                        overflow: 'hidden',
                        width: '34px',
                        height: '34px',
                    }}>
                        <img
                            src="/solwill-user-pfp.png"
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '12px',
                            color: '#111110',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            letterSpacing: '-0.01em',
                        }}>
                            {connected ? 'Connected' : 'Guest User'}
                        </div>
                        <div style={{
                            fontSize: '10.5px',
                            color: '#AAAAA6',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '1px',
                            fontWeight: 400,
                            letterSpacing: '0.01em',
                            fontVariantNumeric: 'tabular-nums',
                        }}>
                            {shortAddr}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.06, background: '#F0F0ED' }}
                        whileTap={{ scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        onClick={async () => {
                            await logout()
                            window.location.href = '/connect'
                            setConnected(false)
                        }}
                        title="Disconnect"
                        style={{
                            background: '#F5F5F2',
                            border: '1px solid rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '8px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#888882',
                        }}
                    >
                        <LogOut size={13} strokeWidth={1.8} />
                    </motion.button>
                </motion.div>
            </aside>

            {/* ── MOBILE TOP BAR ── */}
            <div
                className="flex md:hidden mb-56"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                    height: '52px',
                    background: 'rgba(250,250,248,0.9)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img src="/solwillicon.jpeg" className="h-full w-full object-cover" alt="SolWill" />
                    </div>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#111110',
                        letterSpacing: '-0.02em',
                    }}>
                        SolWill
                    </span>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '5px 10px 5px 7px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(0,0,0,0.07)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                    <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#1A1A18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '8px', color: '#FFFFFF', fontWeight: 600,
                        letterSpacing: '0.02em',
                    }}>
                        {connected ? publicKey?.slice(0, 2).toUpperCase() : 'SW'}
                    </div>
                    <span style={{
                        fontSize: '11px',
                        color: '#555550',
                        fontWeight: 500,
                        letterSpacing: '0.01em',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {shortAddr}
                    </span>
                </div>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav
                className="flex md:hidden"
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                    height: '68px',
                    background: 'rgba(250,250,248,0.94)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    alignItems: 'center',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    boxShadow: '0 -1px 0 rgba(0,0,0,0.04)',
                }}
            >
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                flex: 1,
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '3px',
                                padding: '8px 0',
                                color: active ? '#111110' : '#C0C0BA',
                                transition: 'color 0.15s ease',
                            }}
                        >
                            <motion.div
                                animate={active ? { scale: 1.05, y: -1 } : { scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                style={{
                                    width: '40px', height: '26px',
                                    borderRadius: '9999px',
                                    background: active ? '#FFFFFF' : 'transparent',
                                    border: active ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
                                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.18s ease',
                                }}
                            >
                                <Icon
                                    size={16}
                                    strokeWidth={active ? 2 : 1.6}
                                    color={active ? '#111110' : '#C0C0BA'}
                                />
                            </motion.div>
                            <span style={{
                                fontSize: '9.5px',
                                fontWeight: active ? 600 : 400,
                                letterSpacing: '0.01em',
                                transition: 'font-weight 0.15s ease',
                            }}>
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}