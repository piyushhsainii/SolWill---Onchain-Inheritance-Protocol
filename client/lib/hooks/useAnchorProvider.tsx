import { useCallback, useEffect, useRef, useState } from 'react'
import {
    AnchorProvider,
    BN,
    Program,
    type IdlAccounts,
} from '@coral-xyz/anchor'
import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
} from '@solana/web3.js'
import { getMint } from '@solana/spl-token'

import { useWillStore, type Asset } from '../../app/store/useWillStore'
import IDL from '../idl/idl.json'
import { DeadWallet } from '../idl/idl'
import { useSollWillWallet } from './useSolWillWallet'
import { UseAnchorProviderReturn } from '../utils/helper'

const PROGRAM_ID = new PublicKey('uJ5ujCBYYNJ7V4Fpurewj9cDSPT3jHnEKLnaxYPYss9')
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://api.devnet.solana.com'

const WILL_SEED = Buffer.from('will')
const VAULT_SEED = Buffer.from('vault')
const HEIR_DISCRIMINATOR = Buffer.from([102, 55, 217, 17, 95, 202, 14, 93])

const TOKEN_META: Record<string, { symbol: string; decimals: number; icon?: string }> = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { symbol: 'USDC', decimals: 6, icon: '/icons/usdc.svg' },
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: { symbol: 'USDT', decimals: 6, icon: '/icons/usdt.svg' },
    So11111111111111111111111111111111111111112: { symbol: 'wSOL', decimals: 9 },
    mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: { symbol: 'mSOL', decimals: 9 },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: { symbol: 'BONK', decimals: 5 },
    JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: { symbol: 'JUP', decimals: 6 },
}

type WillAccountData = IdlAccounts<DeadWallet>['willAccount']
type VaultData = IdlAccounts<DeadWallet>['vault']
type HeirData = IdlAccounts<DeadWallet>['heir']
type WillStatus = 'Active' | 'Grace Period' | 'Triggered' | 'Paused'

function deriveWillStatus(lastCheckIn: number, interval: number, claimed: boolean): WillStatus {
    if (claimed) return 'Triggered'
    const lateBy = Math.floor(Date.now() / 1000) - (lastCheckIn + interval)
    if (lateBy <= 0) return 'Active'
    if (lateBy <= 3 * 24 * 60 * 60) return 'Grace Period'
    return 'Triggered'
}


const storeActions = () => useWillStore.getState()

export function useAnchorProvider(): UseAnchorProviderReturn {
    const wallet = useSollWillWallet()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [program, setProgram] = useState<Program<DeadWallet> | null>(null)

    const willPdaRef = useRef<PublicKey | null>(null)
    const vaultPdaRef = useRef<PublicKey | null>(null)
    const [Heirs, setHeirs] = useState<any[]>([])

    useEffect(() => {

        if (!wallet.ready || wallet.loading) {
            setLoading(true)
            return
        }

        if (wallet.address) {
            storeActions().setConnected(true)
            storeActions().setWallet(wallet.address)
        }

        if (!wallet.address || !wallet.publicKey || !wallet.raw) {
            setLoading(false)
            return
        }
        console.log(`Wallet`, wallet)
        const init = async () => {
            try {
                setLoading(true)
                setError(null)

                const conn = new Connection(RPC_URL, 'confirmed')
                const provider = new AnchorProvider(conn, wallet.raw as any, { commitment: 'confirmed' })
                const prog = new Program<DeadWallet>(IDL as any, provider)

                const [willPda] = PublicKey.findProgramAddressSync(
                    [WILL_SEED, wallet.publicKey!.toBuffer()],
                    PROGRAM_ID,
                )
                const [vaultPda] = PublicKey.findProgramAddressSync(
                    [VAULT_SEED, willPda.toBuffer()],
                    PROGRAM_ID,
                )
                const heirAccounts = await prog?.account.heir.all()
                console.log(`heir accounts`, heirAccounts)
                heirAccounts && storeActions().setHeirs(heirAccounts.map(({ publicKey, account }: any) => ({
                    id: publicKey.toBase58(),
                    walletAddress: (account.walletAddress as PublicKey).toBase58(),
                    shareBps: (account.bps / 100) as number,
                    onChain: true,
                })))
                willPdaRef.current = willPda
                vaultPdaRef.current = vaultPda
                setHeirs(heirAccounts.map(({ publicKey, account }: any) => ({
                    id: publicKey.toBase58(),
                    walletAddress: (account.walletAddress as PublicKey).toBase58(),
                    shareBps: (account.bps / 100) as number,
                    onChain: true,
                })))
                willPdaRef.current = willPda
                vaultPdaRef.current = vaultPda
                console.log(`xxxx`, vaultPda.toBase58())
                setProgram(prog)
            } catch (e) {
                console.error('[useAnchorProvider] init error:', e)
                setProgram(null)
                setError(e as Error)
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [wallet.ready, wallet.address])

    async function fetchUsdPrices(mints: string[]): Promise<Record<string, number>> {
        // SOL mint address for Jupiter
        const SOL_MINT = 'So11111111111111111111111111111111111111112'
        const allMints = [SOL_MINT, ...mints].join(',')
        try {
            const res = await fetch(`https://api.jup.ag/price/v2?ids=${allMints}`)
            const json = await res.json()
            const prices: Record<string, number> = {}
            for (const [mint, data] of Object.entries(json.data as Record<string, any>)) {
                prices[mint] = parseFloat(data?.price ?? '0')
            }
            return prices
        } catch {
            return {}
        }
    }

    const refresh = useCallback(async () => {
        if (!wallet.ready || !program || !wallet.publicKey || !willPdaRef.current || !vaultPdaRef.current) return

        const willPda = willPdaRef.current
        const vaultPda = vaultPdaRef.current
        const conn = program.provider.connection

        setLoading(true)
        setError(null)

        try {
            let willData: WillAccountData | null = null
            try {
                willData = await (program.account as any).willAccount.fetch(willPda) as WillAccountData
            } catch {
                storeActions().setWillAccount(null)
            }

            if (willData) {
                const lastCheckIn = (willData.lastCheckIn as BN).toNumber()
                const interval = (willData.interval as BN).toNumber()
                storeActions().setWillAccount({
                    lastCheckin: lastCheckIn,
                    interval,
                    nextCheckin: lastCheckIn + interval,
                    createdAt: lastCheckIn,
                    status: deriveWillStatus(lastCheckIn, interval, willData.claimed as boolean),
                })
            }

            let solBalance = 0
            try {
                const vaultData = await program.account.vault.fetch(vaultPda);
                const vaultbalance = await conn.getBalance(vaultPda);
                console.log('raw sol balance', vaultbalance.toFixed())
                console.log(vaultData.solBalance.toNumber())
                solBalance = vaultbalance / LAMPORTS_PER_SOL
            } catch { }

            const SOL_MINT = 'So11111111111111111111111111111111111111112'

            // collect spl mints
            const splAssets: Asset[] = []
            if (willData && Array.isArray((willData as any).assets)) {
                const rawAssets = (willData as any).assets as Array<{ mint: PublicKey; balance: BN }>
                await Promise.allSettled(rawAssets.map(async ({ mint, balance }) => {
                    const mintStr = mint.toBase58()
                    const meta = TOKEN_META[mintStr]
                    let decimals = meta?.decimals ?? 6
                    try { decimals = (await getMint(conn, mint)).decimals } catch { }
                    const amount = balance.toNumber() / Math.pow(10, decimals)
                    splAssets.push({
                        symbol: meta?.symbol ?? mintStr.slice(0, 6),
                        mint: mintStr,
                        amount,
                        usdPrice: 0,   // filled below
                        usdValue: 0,   // filled below
                        icon: meta?.icon,
                    })
                }))
            }

            // ✅ Fetch all prices in one call
            const splMints = splAssets.map(a => a.mint!)
            const prices = await fetchUsdPrices(splMints)

            const solPrice = prices[SOL_MINT] ?? 0
            const solUsdValue = solBalance * solPrice

            const solAsset: Asset = {
                symbol: 'SOL',
                amount: solBalance,
                usdPrice: solPrice,
                usdValue: solUsdValue,
            }

            // Hydrate spl prices
            const hydratedSpl = splAssets.map(a => ({
                ...a,
                usdPrice: prices[a.mint!] ?? 0,
                usdValue: (prices[a.mint!] ?? 0) * a.amount,
            }))

            const allAssets = [solAsset, ...hydratedSpl].filter(a => a.amount > 0)
            const totalUsdValue = allAssets.reduce((sum, a) => sum + a.usdValue, 0)  // ✅ now accumulates

            storeActions().setVaultAccount({
                sol: solBalance,
                usdc: hydratedSpl.find(a => a.symbol === 'USDC')?.amount ?? 0,
                totalUsdValue,   // ✅ real value now
                assets: allAssets,
            })

            const heirAccounts = await (program.account as any).heir.all()
            storeActions().setHeirs(heirAccounts.map(({ publicKey, account }: any) => ({
                id: publicKey.toBase58(),
                walletAddress: (account.walletAddress as PublicKey).toBase58(),
                shareBps: (account.bps / 100) as number,
                onChain: true,
            })))

        } catch (err) {
            const e = err instanceof Error ? err : new Error(String(err))
            setError(e)
            console.error('[useAnchorProvider] refresh failed:', e)
        } finally {
            setLoading(false)
        }
    }, [wallet.ready, wallet.publicKey, program])
    const hasRefreshedRef = useRef(false)

    useEffect(() => {
        if (
            wallet.ready &&
            wallet.connected &&
            program &&
            wallet.address &&
            willPdaRef.current &&
            vaultPdaRef.current &&
            !hasRefreshedRef.current  // ← only refresh once on mount
        ) {
            hasRefreshedRef.current = true
            refresh()
        }
    }, [wallet.ready, wallet.connected, wallet.address, program])

    return { loading, error, refresh, program, pdas: { willPda: willPdaRef.current, vaultPda: vaultPdaRef.current }, Heirs }
}

/* ─── bs58 encode ───────────────────────────────────────────────── */
function bs58Encode(buf: Buffer): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const digits = [0]
    for (let i = 0; i < buf.length; i++) {
        let carry = buf[i]
        for (let j = 0; j < digits.length; j++) {
            carry += digits[j] << 8
            digits[j] = carry % 58
            carry = (carry / 58) | 0
        }
        while (carry > 0) {
            digits.push(carry % 58)
            carry = (carry / 58) | 0
        }
    }
    let str = ''
    for (let k = 0; buf[k] === 0 && k < buf.length - 1; k++) str += '1'
    for (let k = digits.length - 1; k >= 0; k--) str += ALPHABET[digits[k]]
    return str
}