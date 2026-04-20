import { Program } from "@coral-xyz/anchor";
import { DeadWallet } from "../idl/idl";
import {
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

export const STEPS = [
  { label: "Create Will" },
  { label: "Add Heirs" },
  { label: "Fund Vault" },
];

export type Heir = {
  id: string;
  walletAddress: string;
  shareBps: number;
  onChain: boolean;
};

export type Phase = 0 | 1 | 2 | "dashboard";

export interface UseAnchorProviderReturn {
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  program: Program<DeadWallet> | null;
  pdas: { willPda: PublicKey | null; vaultPda: PublicKey | null };
  Heirs: Heir[];
}

export async function buildAndSend(
  raw: any,
  connection: Connection,
  ix: any,
  ownerPk: PublicKey,
): Promise<string> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");

  // ✅ Build as VersionedTransaction — what Privy expects
  const message = new TransactionMessage({
    payerKey: ownerPk,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message();

  const tx = new VersionedTransaction(message);

  // Privy's signAndSendTransaction with versioned tx
  const { signature: rawSig } = await raw.signAndSendTransaction({
    transaction: tx,
    chain: "solana:devnet",
  });

  const signature = typeof rawSig === "string" ? rawSig : bs58.encode(rawSig);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  return signature;
}
