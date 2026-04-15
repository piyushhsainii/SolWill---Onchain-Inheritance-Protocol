'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

type DepositTab = 'sol' | 'spl'
type DialogType = 'withdraw-sol' | 'withdraw-spl' | null

const TOKENS = [
    {
        symbol: 'USDC',
        name: 'USD Coin',
        image:
            'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040',
    },
    {
        symbol: 'USDT',
        name: 'Tether',
        image:
            'https://cryptologos.cc/logos/tether-usdt-logo.png?v=040',
    },
    {
        symbol: 'BONK',
        name: 'Bonk',
        image:
            'https://cryptologos.cc/logos/bonk-bonk-logo.png?v=040',
    },
    {
        symbol: 'JUP',
        name: 'Jupiter',
        image:
            'https://cryptologos.cc/logos/jupiter-jup-logo.png?v=040',
    },
]

export default function ManageFundsPage() {
    const [activeTab, setActiveTab] =
        useState<DepositTab>('sol')

    const [solAmount, setSolAmount] = useState('')
    const [splAddress, setSplAddress] = useState('')
    const [splAmount, setSplAmount] = useState('')

    const [dialog, setDialog] =
        useState<DialogType>(null)

    const [withdrawSolAmt, setWithdrawSolAmt] =
        useState('')
    const [withdrawSplAmt, setWithdrawSplAmt] =
        useState('')

    const [selectedToken, setSelectedToken] =
        useState(TOKENS[0])

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid #E4E4DF',
        background: '#FFFFFF',
        color: '#1A1A18',
        fontSize: 14,
        boxSizing: 'border-box',
        outline: 'none',
        fontWeight: 300,
        letterSpacing: '-0.02em',
    }

    const primaryBtn: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: 14,
        border: '1px solid #242B35',
        background: '#242B35',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontWeight: 300,
        letterSpacing: '-0.02em',
    }

    const outlineBtn: React.CSSProperties = {
        flex: 1,
        padding: '12px',
        borderRadius: 14,
        border: '1px solid #E4E4DF',
        background: '#FFFFFF',
        color: '#1A1A18',
        cursor: 'pointer',
        fontWeight: 300,
        letterSpacing: '-0.02em',
    }

    return (
        <div
            style={{
                maxWidth: 760,
                margin: '0 auto',
                padding: '24px 16px',
                display: 'grid',
                gap: 22,
                background: '#EEEEE9',
                minHeight: '100vh',
            }}
        >
            <Card>
                <Title>Deposit Funds</Title>
                <Desc>
                    Add assets into your vault for future heirs.
                </Desc>

                <Tabs
                    active={activeTab}
                    setActive={setActiveTab}
                />

                {activeTab === 'sol' ? (
                    <div style={{ display: 'grid', gap: 14 }}>
                        <input
                            type="number"
                            placeholder="Amount (SOL)"
                            value={solAmount}
                            onChange={(e) =>
                                setSolAmount(e.target.value)
                            }
                            style={inputStyle}
                            className="tracking-tight"
                        />
                        <button
                            style={primaryBtn}
                            className="tracking-tight"
                        >
                            Deposit SOL
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 14 }}>
                        <input
                            placeholder="Token Mint Address"
                            value={splAddress}
                            onChange={(e) =>
                                setSplAddress(e.target.value)
                            }
                            style={inputStyle}
                            className="tracking-tight"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={splAmount}
                            onChange={(e) =>
                                setSplAmount(e.target.value)
                            }
                            style={inputStyle}
                            className="tracking-tight"
                        />
                        <button
                            style={primaryBtn}
                            className="tracking-tight"
                        >
                            Deposit SPL Token
                        </button>
                    </div>
                )}
            </Card>

            <Card>
                <Title>Withdraw Funds</Title>
                <Desc>
                    Remove assets from your vault anytime.
                </Desc>

                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        flexWrap: 'wrap',
                    }}
                >
                    <button
                        style={outlineBtn}
                        className="tracking-tight"
                        onClick={() =>
                            setDialog('withdraw-sol')
                        }
                    >
                        Withdraw SOL
                    </button>

                    <button
                        style={outlineBtn}
                        className="tracking-tight"
                        onClick={() =>
                            setDialog('withdraw-spl')
                        }
                    >
                        Withdraw SPL Token
                    </button>
                </div>
            </Card>

            {dialog === 'withdraw-sol' && (
                <Overlay>
                    <Modal>
                        <Header
                            title="Withdraw SOL"
                            close={() => setDialog(null)}
                        />

                        <input
                            type="number"
                            placeholder="Amount (SOL)"
                            value={withdrawSolAmt}
                            onChange={(e) =>
                                setWithdrawSolAmt(e.target.value)
                            }
                            style={{
                                ...inputStyle,
                                marginBottom: 14,
                            }}
                            className="tracking-tight"
                        />

                        <button
                            style={{
                                ...primaryBtn,
                                background: '#242B35',
                            }}
                            className="tracking-tight"
                        >
                            Confirm Withdraw
                        </button>
                    </Modal>
                </Overlay>
            )}

            {dialog === 'withdraw-spl' && (
                <Overlay>
                    <Modal>
                        <Header
                            title="Withdraw SPL Token"
                            close={() => setDialog(null)}
                        />

                        <div
                            style={{
                                display: 'grid',
                                gap: 10,
                                marginBottom: 14,
                            }}
                        >
                            {TOKENS.map((token) => {
                                const active =
                                    selectedToken.symbol ===
                                    token.symbol

                                return (
                                    <button
                                        key={token.symbol}
                                        onClick={() =>
                                            setSelectedToken(token)
                                        }
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: 14,
                                            border: active
                                                ? '1px solid #242B35'
                                                : '1px solid #E4E4DF',
                                            background: active
                                                ? '#F7F7F4'
                                                : '#FFFFFF',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <img
                                            src={token.image}
                                            alt={token.symbol}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                            }}
                                        />

                                        <div
                                            style={{
                                                textAlign: 'left',
                                                flex: 1,
                                            }}
                                        >
                                            <div
                                                className="tracking-tight"
                                                style={{
                                                    fontSize: 14,
                                                    color: '#1A1A18',
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {token.symbol}
                                            </div>
                                            <div
                                                className="tracking-tight"
                                                style={{
                                                    fontSize: 12,
                                                    color: '#555550',
                                                    fontWeight: 300,
                                                }}
                                            >
                                                {token.name}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        <input
                            type="number"
                            placeholder={`Amount (${selectedToken.symbol})`}
                            value={withdrawSplAmt}
                            onChange={(e) =>
                                setWithdrawSplAmt(e.target.value)
                            }
                            style={{
                                ...inputStyle,
                                marginBottom: 14,
                            }}
                            className="tracking-tight"
                        />

                        <button
                            style={primaryBtn}
                            className="tracking-tight"
                        >
                            Confirm Withdraw
                        </button>
                    </Modal>
                </Overlay>
            )}
        </div>
    )
}

/* Helpers */

function Card({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                padding: 22,
                background: '#FFFFFF',
                border: '1px solid #E4E4DF',
                borderRadius: 22,
                boxShadow:
                    '0 2px 12px rgba(36,43,53,0.06)',
            }}
        >
            {children}
        </div>
    )
}

function Title({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <h2
            className="tracking-tight"
            style={{
                fontSize: 11,
                fontWeight: 300,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8A8A82',
                marginBottom: 8,
            }}
        >
            {children}
        </h2>
    )
}

function Desc({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <p
            className="tracking-tight"
            style={{
                fontSize: 14,
                color: '#555550',
                lineHeight: 1.6,
                marginBottom: 18,
                fontWeight: 300,
            }}
        >
            {children}
        </p>
    )
}

function Tabs({
    active,
    setActive,
}: {
    active: DepositTab
    setActive: (v: DepositTab) => void
}) {
    return (
        <div
            style={{
                display: 'flex',
                gap: 6,
                padding: 4,
                borderRadius: 14,
                background: '#EEEEE9',
                border: '1px solid #E4E4DF',
                marginBottom: 18,
            }}
        >
            {(['sol', 'spl'] as DepositTab[]).map(
                (tab) => (
                    <button
                        key={tab}
                        onClick={() => setActive(tab)}
                        className="tracking-tight"
                        style={{
                            flex: 1,
                            padding: 10,
                            border: 'none',
                            borderRadius: 10,
                            background:
                                active === tab
                                    ? '#FFFFFF'
                                    : 'transparent',
                            color:
                                active === tab
                                    ? '#1A1A18'
                                    : '#555550',
                            fontWeight: 300,
                            cursor: 'pointer',
                        }}
                    >
                        {tab === 'sol'
                            ? 'Deposit SOL'
                            : 'Deposit SPL'}
                    </button>
                )
            )}
        </div>
    )
}

function Overlay({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(26,26,24,.45)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
                zIndex: 50,
            }}
        >
            {children}
        </div>
    )
}

function Modal({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: 420,
                background: '#FFFFFF',
                border: '1px solid #E4E4DF',
                borderRadius: 20,
                padding: 22,
                boxShadow:
                    '0 20px 50px rgba(36,43,53,.12)',
            }}
        >
            {children}
        </div>
    )
}

function Header({
    title,
    close,
}: {
    title: string
    close: () => void
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}
        >
            <h3
                className="tracking-tight"
                style={{
                    fontSize: 16,
                    fontWeight: 300,
                    color: '#1A1A18',
                }}
            >
                {title}
            </h3>

            <button
                onClick={close}
                style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#555550',
                }}
            >
                <X size={16} />
            </button>
        </div>
    )
}