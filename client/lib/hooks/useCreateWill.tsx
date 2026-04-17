'use client'

import { useCallback, useState } from 'react'
import {
    AnchorProvider,
    BN,
    Program,
    type Idl,
} from '@coral-xyz/anchor'
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
} from '@solana/web3.js'
import toast from 'react-hot-toast'

import IDL from '../idl/idl.json'
import type { DeadWallet } from '../idl/idl'
import { useAnchorProvider } from './useAnchorProvider'
import { useWillStore } from '@/app/store/useWillStore'
import { useSollWillWallet } from './useSolWillWallet'


type AnchorWallet = {
    publicKey: PublicKey
    signTransaction(tx: Transaction): Promise<Transaction>
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>
}

const PROGRAM_ID = new PublicKey(
    'Mxa8zNFzuZdNAcoRuJDXMD5XccdmJrarcAyrW24DuQa'
)

const WILL_SEED = Buffer.from('will')
const VAULT_SEED = Buffer.from('vault')
const RPC_URL = clusterApiUrl('devnet')

type WalletStandard = {
    accounts?: Array<{ address: string }>
    features?: Record<string, any>
}

function toAnchorWallet(
    wallet: WalletStandard,
    publicKey: PublicKey
): AnchorWallet {
    return {
        publicKey,

        async signTransaction(tx: Transaction): Promise<Transaction> {
            const signer = wallet.features?.['solana:signTransaction']

            if (!signer) {
                throw new Error('Wallet does not support signTransaction')
            }

            const account = wallet.accounts?.[0]
            if (!account) {
                throw new Error('No wallet account found')
            }

            const result = await signer.signTransaction({
                account,
                transaction: tx,
            })

            return result.signedTransaction as Transaction
        },

        async signAllTransactions(
            txs: Transaction[]
        ): Promise<Transaction[]> {
            const signer = wallet.features?.['solana:signTransaction']

            if (!signer) {
                throw new Error('Wallet does not support signAllTransactions')
            }

            const account = wallet.accounts?.[0]
            if (!account) {
                throw new Error('No wallet account found')
            }

            const signed = await Promise.all(
                txs.map(async (tx) => {
                    const result = await signer.signTransaction({
                        account,
                        transaction: tx,
                    })

                    return result.signedTransaction as Transaction
                })
            )

            return signed
        },
    }
}

export function useCreateWill() {
    const {
        raw,
        ready,
        loading: walletLoading,
        connected,
        publicKey,
    } = useSollWillWallet()

    const { refresh } = useAnchorProvider()
    const setTxPending = useWillStore((s) => s.setTxPending)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const createWill = useCallback(
        async (intervalDays: number): Promise<boolean> => {
            try {
                if (!ready || walletLoading) {
                    toast.error('Wallet still loading...')
                    return false
                }

                if (!connected || !publicKey || !raw) {
                    toast.error('Please connect wallet.')
                    return false
                }

                const connection = new Connection(RPC_URL, 'confirmed')

                const anchorWallet = toAnchorWallet(
                    raw as WalletStandard,
                    publicKey
                )

                const provider = new AnchorProvider(
                    connection,
                    raw,
                    { commitment: 'confirmed' }
                )

                const program = new Program<DeadWallet>(
                    IDL as Idl,
                    provider
                )

                const ownerPk = publicKey
                const intervalSeconds = new BN(
                    Math.floor(intervalDays * 86400)
                )

                const [willPda] = PublicKey.findProgramAddressSync(
                    [WILL_SEED, ownerPk.toBuffer()],
                    PROGRAM_ID
                )

                const [vaultPda] = PublicKey.findProgramAddressSync(
                    [VAULT_SEED, willPda.toBuffer()],
                    PROGRAM_ID
                )

                setLoading(true)
                setTxPending(true)
                setError(null)

                const toastId = toast.loading('Creating will...')

                const sig = await program.methods
                    .initialize(intervalSeconds)
                    .accounts({
                        signer: ownerPk,
                    } as any)
                    .rpc()

                toast.success('Will created!', { id: toastId })

                console.log('TX:', sig)

                await refresh()

                return true
            } catch (err) {
                const e =
                    err instanceof Error
                        ? err
                        : new Error(String(err))

                console.error(e)
                setError(e)
                toast.error(parseAnchorError(e))

                return false
            } finally {
                setLoading(false)
                setTxPending(false)
            }
        },
        [
            raw,
            ready,
            walletLoading,
            connected,
            publicKey,
            refresh,
            setTxPending,
        ]
    )

    return {
        createWill,
        loading,
        error,
    }
}

function parseAnchorError(err: Error): string {
    const msg = err.message || ''

    if (msg.includes('User rejected')) {
        return 'Transaction cancelled.'
    }

    if (msg.includes('already in use')) {
        return 'Will already exists.'
    }

    if (msg.includes('insufficient funds')) {
        return 'Not enough SOL for fees.'
    }

    if (msg.includes('signTransaction')) {
        return 'Wallet cannot sign transaction.'
    }

    return msg
}