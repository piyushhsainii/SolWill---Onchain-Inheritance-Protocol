'use client'

import { useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { PublicKey } from '@solana/web3.js'
import { ConnectedStandardSolanaWallet, useWallets } from '@privy-io/react-auth/solana'

type UnifiedWallet = {
    ready: boolean
    loading: boolean
    connected: boolean
    address: string | null
    publicKey: PublicKey | null
    source: 'wallet-adapter' | 'privy' | null
    raw: ConnectedStandardSolanaWallet | null
}

export function useSollWillWallet(): UnifiedWallet {
    const { ready, authenticated } = usePrivy()
    const { wallets } = useWallets()

    return useMemo(() => {
        const wallet = wallets?.[0]
        // Privy still booting
        if (!ready) {
            return {
                ready: false,
                loading: true,
                connected: false,
                address: null,
                publicKey: null,
                source: null,
                raw: null,
            }
        }

        // User logged in but wallets still being hydrated
        if (authenticated && !wallet) {
            return {
                ready: true,
                loading: true,
                connected: false,
                address: null,
                publicKey: null,
                source: null,
                raw: null,
            }
        }

        // Wallet exists
        if (wallet?.address) {
            return {
                ready: true,
                loading: false,
                connected: true,
                address: wallet.address,
                publicKey: new PublicKey(wallet.address),
                source: 'wallet-adapter',
                raw: wallet,
            }
        }

        // No wallet connected
        return {
            ready: true,
            loading: false,
            connected: false,
            address: null,
            publicKey: null,
            source: null,
            raw: null,
        }
    }, [ready, authenticated, wallets])
}