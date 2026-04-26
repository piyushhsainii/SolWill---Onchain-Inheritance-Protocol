'use client'

import { useCallback, useState } from 'react'
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import toast from 'react-hot-toast'
import IDL from '../idl/idl.json'
import { DeadWallet } from '../idl/idl'
import { useAnchorProvider } from './useAnchorProvider'
import { useWillStore } from '@/app/store/useWillStore'
import { useSollWillWallet } from './useSolWillWallet'
import { buildAndSend } from '../utils/helper'

const PROGRAM_ID = new PublicKey('6Qu5vc8BYaBetkA9gkmy7D2JCQmyVyR6CCcaQjyA4sCx')
const RPC_URL = clusterApiUrl('devnet')

export function useUpdateInterval() {
    const { raw: wallet } = useSollWillWallet()
    const { refresh } = useAnchorProvider()
    const setTxPending = useWillStore((s) => s.setTxPending)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const updateInterval = useCallback(
        async (intervalDays: number): Promise<boolean> => {
            // Guard — only runs when user actually clicks, never on render
            if (!wallet?.address || !wallet.signTransaction) {
                toast.error('Wallet not connected.')
                return false
            }

            if (typeof wallet.signAndSendTransaction !== 'function') {
                toast.error('Wallet does not support signing. Please reconnect.')
                return false
            }

            if (intervalDays < 1) {
                toast.error('Minimum interval is 1 day.')
                return false
            }

            if (intervalDays > 1825) {
                toast.error('Maximum interval is 5 years (1825 days).')
                return false
            }

            setLoading(true)
            setTxPending(true)
            setError(null)

            const toastId = toast.loading('Updating interval…')

            try {
                // Lazy — built only when user triggers the action
                const connection = new Connection(RPC_URL, 'confirmed')
                const anchorWallet = {
                    publicKey: wallet.address,
                    signTransaction: (tx: any) => wallet.signTransaction!(tx),
                }
                const provider = new AnchorProvider(connection, anchorWallet as any, { commitment: 'confirmed' })
                const program = new Program<DeadWallet>(IDL as any, provider)

                const intervalSeconds = new BN(intervalDays * 86400)

                const ix = await program.methods
                    .updateWillFun(intervalSeconds)
                    .accounts({ signer: wallet.address })
                    .instruction()

                const sig = await buildAndSend(wallet, connection, ix, new PublicKey(wallet.address))
                console.log('Update interval sig:', sig)

                toast.success(`Interval updated to ${intervalDays} days`, { id: toastId })
                await refresh()
                return true
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err))
                setError(e)
                toast.error(parseError(e), { id: toastId })
                return false
            } finally {
                setLoading(false)
                setTxPending(false)
            }
        },
        [wallet, refresh, setTxPending]
    )

    return { updateInterval, loading, error }
}

function parseError(err: Error) {
    const msg = err.message || ''
    if (msg.includes('User rejected')) return 'Transaction cancelled.'
    if (msg.includes('WillTriggered') || msg.includes('triggered')) return 'Will has been triggered and cannot be modified.'
    if (msg.includes('insufficient funds')) return 'Not enough SOL for fees.'
    return msg
}