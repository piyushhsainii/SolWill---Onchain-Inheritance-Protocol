'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Users } from 'lucide-react'
import { useWillStore } from '@/app/store/useWillStore'

type Heir = {
    id: string
    address: string
    bps: number
}

export default function ManageHeirsPage() {
    const store = useWillStore() as any

    /* force reactive fallback */
    const heirs: Heir[] = Array.isArray(store.heirs)
        ? store.heirs
        : Array.isArray(store.activeHeirs)
            ? store.activeHeirs
            : []

    const setHeirs = (next: Heir[]) => {
        if (store.setHeirs) store.setHeirs(next)
        if (store.setActiveHeirs) store.setActiveHeirs(next)
    }

    const [draftAddress, setDraftAddress] =
        useState('')
    const [draftBps, setDraftBps] = useState('')
    const [error, setError] = useState('')

    const totalBps = useMemo(
        () =>
            heirs.reduce(
                (sum, h) =>
                    sum +
                    (Number(h?.bps) || 0),
                0
            ),
        [heirs]
    )

    const addHeir = () => {
        const address = draftAddress.trim()
        const bps = Number(draftBps)

        if (!address)
            return setError(
                'Enter wallet address.'
            )

        if (!bps || bps <= 0)
            return setError(
                'Enter valid bps.'
            )

        if (totalBps + bps > 10000)
            return setError(
                'Total bps cannot exceed 10,000.'
            )

        const next: Heir[] = [
            ...heirs,
            {
                id:
                    crypto.randomUUID?.() ||
                    Date.now().toString(),
                address,
                bps,
            },
        ]

        setHeirs(next)
        setDraftAddress('')
        setDraftBps('')
        setError('')
    }

    const removeHeir = (id: string) => {
        setHeirs(
            heirs.filter(
                (h) => h.id !== id
            )
        )
    }

    const updateBps = (
        id: string,
        value: string
    ) => {
        const newBps =
            Number(value) || 0

        const next = heirs.map((h) =>
            h.id === id
                ? {
                    ...h,
                    bps: newBps,
                }
                : h
        )

        const nextTotal = next.reduce(
            (sum, h) =>
                sum +
                (Number(h.bps) || 0),
            0
        )

        if (nextTotal > 10000) {
            setError(
                'Total bps cannot exceed 10,000.'
            )
            return
        }

        setError('')
        setHeirs(next)
    }

    const truncate = (v: string) =>
        v.length > 10
            ? `${v.slice(
                0,
                4
            )}...${v.slice(-4)}`
            : v

    return (
        <div
            style={{
                maxWidth: 1100,
                margin: '0 auto',
                padding: 24,
                display: 'grid',
                gap: 22,
                background: '#EEEEE9',
                minHeight: '100vh',
            }}
        >
            {/* TOP CARD */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                style={card}
            >
                <div
                    className="tracking-tight"
                    style={eyebrow}
                >
                    MANAGE HEIRS
                </div>

                <div
                    className="tracking-tight"
                    style={title}
                >
                    Beneficiary Controls
                </div>

                <p
                    className="tracking-tight"
                    style={desc}
                >
                    Add heirs and assign
                    basis points. Total
                    allocation can never
                    exceed 10,000 bps.
                </p>

                {/* tracker */}
                <div
                    style={{
                        marginBottom: 18,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            marginBottom: 8,
                        }}
                    >
                        <span
                            style={meta}
                            className="tracking-tight"
                        >
                            Allocated
                        </span>
                        <span
                            style={meta}
                            className="tracking-tight"
                        >
                            {totalBps} /
                            10000
                        </span>
                    </div>

                    <div
                        style={{
                            height: 8,
                            borderRadius: 999,
                            background:
                                '#E4E4DF',
                            overflow:
                                'hidden',
                        }}
                    >
                        <motion.div
                            animate={{
                                width: `${Math.min(
                                    (totalBps /
                                        10000) *
                                    100,
                                    100
                                )}%`,
                            }}
                            style={{
                                height:
                                    '100%',
                                background:
                                    '#242B35',
                            }}
                        />
                    </div>

                    <div
                        style={{
                            ...meta,
                            marginTop: 8,
                        }}
                        className="tracking-tight"
                    >
                        Remaining:{' '}
                        {10000 -
                            totalBps}
                    </div>
                </div>

                {/* add row */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '1fr 160px 180px',
                        gap: 12,
                    }}
                >
                    <input
                        placeholder="Wallet Address"
                        value={draftAddress}
                        onChange={(e) =>
                            setDraftAddress(
                                e.target.value
                            )
                        }
                        style={input}
                        className="tracking-tight"
                    />

                    <input
                        placeholder="BPS"
                        type="number"
                        value={draftBps}
                        onChange={(e) =>
                            setDraftBps(
                                e.target.value
                            )
                        }
                        style={input}
                        className="tracking-tight"
                    />

                    <button
                        onClick={addHeir}
                        style={primaryBtn}
                        className="tracking-tight"
                    >
                        <Plus size={15} />
                        Add Heir
                    </button>
                </div>

                {error && (
                    <div
                        style={{
                            marginTop: 12,
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: 300,
                        }}
                        className="tracking-tight"
                    >
                        {error}
                    </div>
                )}
            </motion.div>

            {/* CURRENT HEIRS */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    delay: 0.06,
                }}
                style={card}
            >
                <div
                    className="tracking-tight"
                    style={eyebrow}
                >
                    CURRENT HEIRS
                </div>

                {heirs.length === 0 ? (
                    <div
                        style={{
                            padding:
                                '44px 20px',
                            borderRadius: 22,
                            border:
                                '1px dashed #E4E4DF',
                            textAlign:
                                'center',
                        }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius:
                                    '50%',
                                background:
                                    '#F7F7F4',
                                display:
                                    'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                margin:
                                    '0 auto 14px',
                            }}
                        >
                            <Users
                                size={
                                    24
                                }
                                color="#555550"
                            />
                        </div>

                        <div
                            style={{
                                fontSize: 16,
                                color: '#1A1A18',
                                fontWeight: 300,
                            }}
                            className="tracking-tight"
                        >
                            No heirs added yet
                        </div>

                        <div
                            style={{
                                fontSize: 13,
                                color: '#8A8A82',
                                marginTop: 6,
                            }}
                            className="tracking-tight"
                        >
                            Add your first
                            beneficiary above.
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill,minmax(220px,1fr))',
                            gap: 18,
                        }}
                    >
                        <AnimatePresence>
                            {heirs.map(
                                (
                                    heir,
                                    i
                                ) => {
                                    const bps =
                                        Number(
                                            heir.bps
                                        ) ||
                                        0
                                    const percent =
                                        bps /
                                        100
                                    const deg =
                                        (bps /
                                            10000) *
                                        360

                                    return (
                                        <motion.div
                                            key={
                                                heir.id
                                            }
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.9,
                                            }}
                                            transition={{
                                                delay:
                                                    i *
                                                    0.05,
                                            }}
                                            whileHover={{
                                                y: -4,
                                            }}
                                            style={
                                                heirCard
                                            }
                                        >
                                            <div
                                                style={{
                                                    width: 110,
                                                    height: 110,
                                                    borderRadius:
                                                        '50%',
                                                    background: `conic-gradient(#242B35 ${deg}deg,#E4E4DF ${deg}deg)`,
                                                    padding: 4,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius:
                                                            '50%',
                                                        background:
                                                            '#fff',
                                                        display:
                                                            'flex',
                                                        flexDirection:
                                                            'column',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            color: '#1A1A18',
                                                            fontWeight: 300,
                                                        }}
                                                        className="tracking-tight"
                                                    >
                                                        {percent.toFixed(
                                                            2
                                                        )}

                                                        %
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: '#8A8A82',
                                                        }}
                                                        className="tracking-tight"
                                                    >
                                                        {bps}{' '}
                                                        bps
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: '#555550',
                                                }}
                                                className="tracking-tight"
                                            >
                                                {truncate(
                                                    heir.address
                                                )}
                                            </div>

                                            <input
                                                value={
                                                    heir.address
                                                }
                                                onChange={(
                                                    e
                                                ) => {
                                                    setHeirs(
                                                        heirs.map(
                                                            (
                                                                h
                                                            ) =>
                                                                h.id ===
                                                                    heir.id
                                                                    ? {
                                                                        ...h,
                                                                        address:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                    : h
                                                        )
                                                    )
                                                }}
                                                style={
                                                    input
                                                }
                                                className="tracking-tight"
                                            />

                                            <input
                                                type="number"
                                                value={
                                                    bps
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    updateBps(
                                                        heir.id,
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                style={
                                                    input
                                                }
                                                className="tracking-tight"
                                            />

                                            <button
                                                onClick={() =>
                                                    removeHeir(
                                                        heir.id
                                                    )
                                                }
                                                style={
                                                    deleteBtn
                                                }
                                            >
                                                <Trash2
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>
                                        </motion.div>
                                    )
                                }
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

const card = {
    background: '#FFFFFF',
    border: '1px solid #E4E4DF',
    borderRadius: 28,
    padding: 26,
    boxShadow:
        '0 2px 12px rgba(36,43,53,0.06)',
}

const eyebrow = {
    fontSize: 11,
    color: '#8A8A82',
    letterSpacing: '0.14em',
    fontWeight: 300,
    marginBottom: 10,
}

const title = {
    fontSize: 30,
    color: '#1A1A18',
    fontWeight: 300,
    marginBottom: 10,
}

const desc = {
    fontSize: 14,
    color: '#555550',
    lineHeight: 1.6,
    fontWeight: 300,
    marginBottom: 20,
}

const meta = {
    fontSize: 12,
    color: '#8A8A82',
    fontWeight: 300,
}

const input = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 16,
    border: '1px solid #E4E4DF',
    background: '#FFFFFF',
    color: '#1A1A18',
    fontSize: 14,
    fontWeight: 300,
    outline: 'none',
    boxSizing: 'border-box' as const,
}

const primaryBtn = {
    border: '1px solid #242B35',
    background: '#242B35',
    color: '#fff',
    borderRadius: 16,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
}

const heirCard = {
    border: '1px solid #E4E4DF',
    borderRadius: 22,
    padding: 16,
    background: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 12,
}

const deleteBtn = {
    width: '100%',
    height: 42,
    borderRadius: 14,
    border: '1px solid #E4E4DF',
    background: '#F7F7F4',
    cursor: 'pointer',
    color: '#1A1A18',
}