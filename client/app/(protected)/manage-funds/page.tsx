'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownToLine, ArrowUpFromLine, ChevronDown, Check } from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import { useDepositSOL, useDepositSPL } from '@/lib/hooks/useDeposit'

/* ─── Token registry ─────────────────────────────────────────────── */
type Token = {
    symbol: string
    name: string
    mint: string
    decimals: number
    logo: string
}

const SOL_LOGO = '/sol-logo.png' // local file in public/

const TOKENS: Token[] = [
    {
        symbol: 'SOL',
        name: 'Solana',
        mint: 'So11111111111111111111111111111111111111112',
        decimals: 9,
        logo: SOL_LOGO,
    },
    {
        symbol: 'USDC',
        name: 'USD Coin',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        decimals: 6,
        logo: '/usdc-logo.png',
    },
    {
        symbol: 'USDT',
        name: 'Tether',
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        decimals: 6,
        logo: '/USDT_LOGO.png',
    },
    {
        symbol: 'BONK',
        name: 'Bonk',
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        decimals: 5,
        logo: '/bonk-logo.png',
    },
]

const SPL_TOKENS = TOKENS.filter(t => t.symbol !== 'SOL')

/* ─── Debounce hook ──────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}

/* ─── Live SOL price — tries Jupiter v2, falls back to CoinGecko ── */
function useSolPrice() {
    const [price, setPrice] = useState<number | null>(null)
    const controllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        let cancelled = false

        const fetchPrice = async () => {
            controllerRef.current?.abort()
            controllerRef.current = new AbortController()

            // Try Jupiter lite API (v2 — current stable)
            try {
                const res = await fetch(
                    'https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112',
                    { signal: controllerRef.current.signal }
                )
                const json = await res.json()
                const p = json?.data?.['So11111111111111111111111111111111111111112']?.price
                if (!cancelled && p != null) {
                    setPrice(Number(p))
                    return
                }
            } catch (err: any) {
                if (err?.name === 'AbortError') return
            }

            // Fallback: CoinGecko public API
            try {
                const res = await fetch(
                    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
                )
                const json = await res.json()
                if (!cancelled && json?.solana?.usd) setPrice(Number(json.solana.usd))
            } catch { }
        }

        fetchPrice()
        const interval = setInterval(fetchPrice, 30_000)
        return () => {
            cancelled = true
            clearInterval(interval)
            controllerRef.current?.abort()
        }
    }, [])

    return price
}

/* ─── Section label ──────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            margin: '0 0 10px',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8A8A82',
        }}>
            {children}
        </p>
    )
}

/* ─── Animated input ─────────────────────────────────────────────── */
function AmountInput({
    value,
    onChange,
    placeholder,
    suffix,
    usdValue,
    tokenLogo,
}: {
    value: string
    onChange: (v: string) => void
    placeholder: string
    suffix?: string
    usdValue?: string | null
    tokenLogo?: string
}) {
    const [focused, setFocused] = useState(false)

    return (
        <div>
            <motion.div
                animate={{
                    borderColor: focused ? '#242B35' : '#E4E4DF',
                    boxShadow: focused
                        ? '0 0 0 3px rgba(36,43,53,0.07)'
                        : '0 0 0 0px transparent',
                }}
                transition={{ duration: 0.18 }}
                style={{
                    borderRadius: 14,
                    border: '1px solid #E4E4DF',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    overflow: 'hidden',
                    padding: '0 14px',
                }}
            >
                {tokenLogo && (
                    <img src={tokenLogo} alt="" style={{
                        width: 20, height: 20, borderRadius: '50%',
                        marginRight: 10, flexShrink: 0,
                        objectFit: 'cover',
                    }} />
                )}
                <input
                    type="number"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        flex: 1,
                        padding: '13px 0',
                        border: 'none',
                        background: 'transparent',
                        color: '#1A1A18',
                        fontSize: 14,
                        outline: 'none',
                        letterSpacing: '-0.02em',
                        fontWeight: 300,
                        fontFamily: 'inherit',
                        minWidth: 0,
                    }}
                />
                {suffix && (
                    <span style={{
                        fontSize: 12, color: '#8A8A82',
                        letterSpacing: '-0.01em', flexShrink: 0,
                        marginLeft: 8,
                    }}>
                        {suffix}
                    </span>
                )}
            </motion.div>

            <AnimatePresence>
                {usdValue && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            marginTop: 6, paddingLeft: 4,
                            fontSize: 12, color: '#8A8A82',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        ≈ {usdValue}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── Token selector dropdown ────────────────────────────────────── */
function TokenSelector({
    tokens,
    selected,
    onSelect,
}: {
    tokens: Token[]
    selected: Token
    onSelect: (t: Token) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ borderColor: '#242B35' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setOpen(v => !v)}
                style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 14,
                    border: '1px solid #E4E4DF',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.18s',
                }}
            >
                <img src={selected.logo} alt={selected.symbol} style={{
                    width: 24, height: 24, borderRadius: '50%', objectFit: 'cover',
                }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 14, color: '#1A1A18', fontWeight: 300, letterSpacing: '-0.02em' }}>
                        {selected.symbol}
                    </div>
                    <div style={{ fontSize: 11, color: '#8A8A82', letterSpacing: '-0.01em' }}>{selected.name}</div>
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} color="#8A8A82" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0, right: 0,
                            background: '#fff',
                            border: '1px solid #E4E4DF',
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(36,43,53,0.1)',
                            zIndex: 20,
                            overflow: 'hidden',
                        }}
                    >
                        {tokens.map((token, i) => (
                            <motion.button
                                key={token.symbol}
                                whileHover={{ background: '#F7F7F4' }}
                                onClick={() => { onSelect(token); setOpen(false) }}
                                style={{
                                    width: '100%',
                                    padding: '11px 14px',
                                    border: 'none',
                                    borderBottom: i < tokens.length - 1 ? '1px solid #F0F0EB' : 'none',
                                    background: 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <img src={token.logo} alt={token.symbol} style={{
                                    width: 24, height: 24, borderRadius: '50%', objectFit: 'cover',
                                }} />
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <div style={{ fontSize: 13, color: '#1A1A18', fontWeight: 300, letterSpacing: '-0.02em' }}>
                                        {token.symbol}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#8A8A82' }}>{token.name}</div>
                                </div>
                                {selected.symbol === token.symbol && (
                                    <Check size={14} color="#242B35" strokeWidth={2.5} />
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── Primary CTA button ─────────────────────────────────────────── */
function PrimaryButton({
    children,
    onClick,
    disabled,
    loading,
}: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
}) {
    return (
        <motion.button
            whileHover={!disabled ? { y: -1, boxShadow: '0 10px 28px rgba(36,43,53,0.18)' } : {}}
            whileTap={!disabled ? { scale: 0.985 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            style={{
                width: '100%',
                padding: '13px',
                borderRadius: 14,
                border: 'none',
                background: disabled || loading ? '#E4E4DF' : '#242B35',
                color: disabled || loading ? '#8A8A82' : '#fff',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 300,
                letterSpacing: '-0.02em',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, color 0.2s',
            }}
        >
            {children}
        </motion.button>
    )
}

/* ─── Divider ────────────────────────────────────────────────────── */
function Divider() {
    return <div style={{ height: 1, background: '#F0F0EB', margin: '20px 0' }} />
}

/* ─── Accordion card ─────────────────────────────────────────────── */
function AccordionCard({
    open,
    onToggle,
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    children,
}: {
    open: boolean
    onToggle: () => void
    icon: React.ReactNode
    iconBg: string
    iconColor: string
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid #E4E4DF',
            borderRadius: 22,
            boxShadow: '0 2px 12px rgba(36,43,53,0.06)',
            overflow: 'hidden',
        }}>
            {/* Header — clickable toggle */}
            <motion.button
                whileHover={{ background: open ? '#fff' : '#FAFAF8' }}
                onClick={onToggle}
                style={{
                    width: '100%',
                    padding: '20px 22px',
                    border: 'none',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderBottom: open ? '1px solid #F0F0EB' : 'none',
                    transition: 'border-color 0.2s',
                }}
            >
                {/* Icon */}
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: iconBg,
                    border: `1px solid ${iconColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>

                {/* Title */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{
                        fontSize: 17,
                        fontWeight: 500,
                        color: '#1A1A18',
                        letterSpacing: '-0.035em',
                        lineHeight: 1.2,
                    }}>
                        {title}
                    </div>
                    <div style={{
                        fontSize: 12,
                        color: '#8A8A82',
                        letterSpacing: '-0.01em',
                        marginTop: 2,
                    }}>
                        {subtitle}
                    </div>
                </div>

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    style={{ flexShrink: 0 }}
                >
                    <ChevronDown size={18} color="#8A8A82" strokeWidth={1.8} />
                </motion.div>
            </motion.button>

            {/* Body — animated collapse */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '20px 22px' }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════════ */
export default function ManageFundsPage() {
    const solPrice = useSolPrice()
    const { depositSOL, loading: depositSolLoading } = useDepositSOL()
    const { depositSPL, loading: depositSplLoading } = useDepositSPL()

    // accordion state — deposit open by default
    const [depositOpen, setDepositOpen] = useState(true)
    const [withdrawOpen, setWithdrawOpen] = useState(false)

    // deposit state
    const [depositTab, setDepositTab] = useState<'sol' | 'spl'>('sol')
    const [depositSolAmt, setDepositSolAmt] = useState('')
    const [depositSplToken, setDepositSplToken] = useState<Token>(SPL_TOKENS[0])
    const [depositSplAmt, setDepositSplAmt] = useState('')

    // withdraw state
    const [withdrawSolAmt, setWithdrawSolAmt] = useState('')
    const [withdrawSplToken, setWithdrawSplToken] = useState<Token>(SPL_TOKENS[0])
    const [withdrawSplAmt, setWithdrawSplAmt] = useState('')

    // debounced amounts for USD conversion
    const debouncedDepositSol = useDebounce(depositSolAmt, 300)
    const debouncedWithdrawSol = useDebounce(withdrawSolAmt, 300)

    const formatUsd = useCallback((solAmt: string): string | null => {
        if (!solPrice || !solAmt || isNaN(Number(solAmt)) || Number(solAmt) <= 0) return null
        const usd = Number(solAmt) * solPrice
        return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }, [solPrice])

    const depositUsd = formatUsd(debouncedDepositSol)
    const withdrawUsd = formatUsd(debouncedWithdrawSol)

    const stagger = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
    }
    const fadeUp = {
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] } },
    }

    return (
        <>
            <style>{`
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>

            <div style={{
                maxWidth: 640,
                margin: '0 auto',
                padding: '28px 20px',
                background: '#EEEEE9',
                minHeight: '100vh',
                boxSizing: 'border-box',
            }}>
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >

                    {/* ═══ DEPOSIT ACCORDION ═══ */}
                    <motion.div variants={fadeUp}>
                        <AccordionCard
                            open={depositOpen}
                            onToggle={() => setDepositOpen(v => !v)}
                            icon={<ArrowDownToLine size={18} color="#242B35" strokeWidth={1.8} />}
                            iconBg="rgba(36,43,53,0.06)"
                            iconColor="#242B35"
                            title="Deposit funds"
                            subtitle="Add assets to your estate vault"
                        >
                            {/* Tab switcher */}
                            <div style={{
                                display: 'flex', gap: 4, padding: 4,
                                borderRadius: 13, background: '#F4F4F0',
                                border: '1px solid #E4E4DF', marginBottom: 18,
                            }}>
                                {(['sol', 'spl'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setDepositTab(tab)}
                                        style={{
                                            flex: 1, padding: '9px 12px',
                                            border: 'none', borderRadius: 9,
                                            background: depositTab === tab ? '#fff' : 'transparent',
                                            color: depositTab === tab ? '#1A1A18' : '#8A8A82',
                                            fontSize: 13, fontWeight: 300,
                                            cursor: 'pointer', letterSpacing: '-0.02em',
                                            fontFamily: 'inherit',
                                            boxShadow: depositTab === tab
                                                ? '0 1px 4px rgba(36,43,53,0.08)'
                                                : 'none',
                                            transition: 'all 0.18s ease',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: 7,
                                        }}
                                    >
                                        {tab === 'sol' ? (
                                            <>
                                                <img src={SOL_LOGO} alt="SOL" style={{
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    objectFit: 'cover',
                                                }} />
                                                SOL
                                            </>
                                        ) : 'SPL Token'}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {depositTab === 'sol' ? (
                                    <motion.div
                                        key="deposit-sol"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                                    >
                                        <div>
                                            <SectionLabel>Amount</SectionLabel>
                                            <AmountInput
                                                value={depositSolAmt}
                                                onChange={setDepositSolAmt}
                                                placeholder="0.00"
                                                suffix="SOL"
                                                tokenLogo={SOL_LOGO}
                                                usdValue={depositUsd}
                                            />
                                        </div>
                                        <PrimaryButton
                                            disabled={!depositSolAmt || Number(depositSolAmt) <= 0 || depositSolLoading}
                                            loading={depositSolLoading}
                                            onClick={() => depositSOL(Number(depositSolAmt))}
                                        >
                                            <ArrowDownToLine size={15} strokeWidth={2} />
                                            {depositSolLoading ? 'Depositing…' : 'Deposit SOL'}
                                        </PrimaryButton>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="deposit-spl"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                                    >
                                        <div>
                                            <SectionLabel>Token</SectionLabel>
                                            <TokenSelector
                                                tokens={SPL_TOKENS}
                                                selected={depositSplToken}
                                                onSelect={t => setDepositSplToken(t)}
                                            />
                                        </div>
                                        <div>
                                            <SectionLabel>Amount</SectionLabel>
                                            <AmountInput
                                                value={depositSplAmt}
                                                onChange={setDepositSplAmt}
                                                placeholder="0.00"
                                                suffix={depositSplToken.symbol}
                                                tokenLogo={depositSplToken.logo}
                                            />
                                        </div>
                                        <PrimaryButton
                                            disabled={!depositSplAmt || Number(depositSplAmt) <= 0 || depositSplLoading}
                                            loading={depositSplLoading}
                                            onClick={() => {
                                                const rawAmt = Math.floor(Number(depositSplAmt) * Math.pow(10, depositSplToken.decimals))
                                                depositSPL(new PublicKey(depositSplToken.mint), rawAmt)
                                            }}
                                        >
                                            <ArrowDownToLine size={15} strokeWidth={2} />
                                            {depositSplLoading ? 'Depositing…' : `Deposit ${depositSplToken.symbol}`}
                                        </PrimaryButton>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </AccordionCard>
                    </motion.div>

                    {/* ═══ WITHDRAW ACCORDION ═══ */}
                    <motion.div variants={fadeUp}>
                        <AccordionCard
                            open={withdrawOpen}
                            onToggle={() => setWithdrawOpen(v => !v)}
                            icon={<ArrowUpFromLine size={18} color="#dc2626" strokeWidth={1.8} />}
                            iconBg="rgba(239,68,68,0.07)"
                            iconColor="#dc2626"
                            title="Withdraw funds"
                            subtitle="Remove assets from your vault"
                        >
                            {/* Withdraw SOL */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <img src={SOL_LOGO} alt="SOL" style={{
                                        width: 16, height: 16, borderRadius: '50%', objectFit: 'cover',
                                    }} />
                                    <SectionLabel>Withdraw SOL</SectionLabel>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <AmountInput
                                        value={withdrawSolAmt}
                                        onChange={setWithdrawSolAmt}
                                        placeholder="0.00"
                                        suffix="SOL"
                                        tokenLogo={SOL_LOGO}
                                        usdValue={withdrawUsd}
                                    />
                                    <PrimaryButton disabled={!withdrawSolAmt || Number(withdrawSolAmt) <= 0}>
                                        <ArrowUpFromLine size={15} strokeWidth={2} />
                                        Withdraw SOL
                                    </PrimaryButton>
                                </div>
                            </div>

                            <Divider />

                            {/* Withdraw SPL */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                    <img src={withdrawSplToken.logo} alt={withdrawSplToken.symbol} style={{
                                        width: 16, height: 16, borderRadius: '50%', objectFit: 'cover',
                                    }} />
                                    <SectionLabel>Withdraw SPL Token</SectionLabel>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <TokenSelector
                                        tokens={SPL_TOKENS}
                                        selected={withdrawSplToken}
                                        onSelect={setWithdrawSplToken}
                                    />
                                    <AmountInput
                                        value={withdrawSplAmt}
                                        onChange={setWithdrawSplAmt}
                                        placeholder="0.00"
                                        suffix={withdrawSplToken.symbol}
                                        tokenLogo={withdrawSplToken.logo}
                                    />
                                    <PrimaryButton disabled={!withdrawSplAmt || Number(withdrawSplAmt) <= 0}>
                                        <ArrowUpFromLine size={15} strokeWidth={2} />
                                        Withdraw {withdrawSplToken.symbol}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </AccordionCard>
                    </motion.div>

                    {/* ═══ Live SOL price chip ═══ */}
                    <motion.div variants={fadeUp}>
                        <AnimatePresence>
                            {solPrice != null ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 7,
                                        padding: '8px 16px',
                                        borderRadius: 999,
                                        background: '#fff',
                                        border: '1px solid #E4E4DF',
                                        width: 'fit-content',
                                        margin: '4px auto 0',
                                        boxShadow: '0 1px 6px rgba(36,43,53,0.06)',
                                    }}
                                >
                                    <img src={SOL_LOGO} alt="SOL" style={{
                                        width: 14, height: 14, borderRadius: '50%', objectFit: 'cover',
                                    }} />
                                    <span style={{ fontSize: 12, color: '#555550', letterSpacing: '-0.01em' }}>
                                        1 SOL = ${solPrice.toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                    <span style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#43d17a', flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: 11, color: '#8A8A82' }}>live</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 6,
                                        padding: '8px 16px',
                                        borderRadius: 999,
                                        background: '#fff',
                                        border: '1px solid #E4E4DF',
                                        width: 'fit-content',
                                        margin: '4px auto 0',
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: '#8A8A82' }}>Fetching SOL price…</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </motion.div>
            </div>
        </>
    )
}