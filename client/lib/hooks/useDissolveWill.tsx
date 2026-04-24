'use client'

import { useCallback, useState } from 'react'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import toast from 'react-hot-toast'
import IDL from '../idl/idl.json'
import { DeadWallet } from '../idl/idl'
import { useAnchorProvider } from './useAnchorProvider'
import { useWillStore } from '@/app/store/useWillStore'
import { useSollWillWallet } from './useSolWillWallet'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { buildAndSend } from '../utils/helper'

const PROGRAM_ID = new PublicKey('4pHVi1JXM5BL64Z92iH57wBxqdC3DWfsLgyCG9jDnUZx')
const RPC_URL = clusterApiUrl('devnet')

export function useDissolveWill() {
    const { raw: wallet } = useSollWillWallet()
    const { refresh } = useAnchorProvider()
    const setTxPending = useWillStore((s) => s.setTxPending)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const dissolveWill = useCallback(
        async (): Promise<boolean> => {
            // Everything is built here — nothing runs until the user clicks
            if (!wallet?.address || !wallet.signTransaction) {
                toast.error('Wallet not connected.')
                return false
            }

            setLoading(true)
            setTxPending(true)
            setError(null)

            const toastId = toast.loading('Dissolving will…')

            try {
                // Lazy — only created when actually needed
                const connection = new Connection(RPC_URL, 'confirmed')
                const anchorWallet = {
                    publicKey: wallet.address,
                    signTransaction: (tx: any) => wallet.signTransaction!(tx),
                }
                const provider = new AnchorProvider(connection, anchorWallet as any, { commitment: 'confirmed' })
                const program = new Program<DeadWallet>(IDL as any, provider)

                const ix = await program.methods
                    .dissolveWill()
                    .accounts({ signer: wallet.address, tokenProgram: TOKEN_PROGRAM_ID })
                    .instruction()

                const sig = await buildAndSend(wallet, connection, ix, new PublicKey(wallet.address))
                console.log('Dissolve sig:', sig)

                toast.success('Will dissolved successfully.', { id: toastId })

                useWillStore.setState({
                    willAccount: null,
                    vaultAccount: null,
                    heirs: [],
                })

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

    return { dissolveWill, loading, error }
}

function parseError(err: Error) {
    const msg = err.message || ''
    if (msg.includes('User rejected')) return 'Transaction cancelled.'
    if (msg.includes('WillTriggered') || msg.includes('triggered')) return 'Will has been triggered and cannot be dissolved.'
    if (msg.includes('HeirsExist') || msg.includes('heirs')) return 'Remove all heirs before dissolving the will.'
    if (msg.includes('insufficient funds')) return 'Not enough SOL for fees.'
    return msg
}