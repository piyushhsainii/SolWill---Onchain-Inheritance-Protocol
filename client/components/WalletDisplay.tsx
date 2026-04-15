'use client'

import { useWallet } from '@solana/wallet-adapter-react'

export default function WalletDisplay() {
    const { publicKey, disconnect } = useWallet()

    if (!publicKey) return null

    const addr = publicKey.toBase58()

    return (
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">{addr.slice(0, 4)}...{addr.slice(-4)}</span>
            <button onClick={disconnect} className="text-xs">Disconnect</button>
        </div>
    )
}