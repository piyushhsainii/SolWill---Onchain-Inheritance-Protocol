# SolWill - Your crypto, protected forever

<img width="2515" height="1107" alt="solwill-hero" src="https://github.com/user-attachments/assets/2e6ccd2d-7e51-4862-85ec-056b55536e79" />

---

> Built for the [Solana Colosseum Frontier Hackathon](https://frontier.colosseum.org) — open track submission.

---

## What is SolWill?

SolWill is the first trustless crypto inheritance protocol on Solana. It lets you set up an on-chain will that automatically transfers your SOL, SPL tokens, and NFTs to your chosen heirs — without lawyers, custodians, intermediaries, or any human in the loop.

You check in regularly to prove you're alive. If you stop checking in, the smart contract triggers automatically and your heirs can claim their exact share. Everything is enforced by code, not by trust.

---

## The Problem

Over **$140 billion** in cryptocurrency is estimated to be permanently lost — not hacked, not stolen, just inaccessible after the owner dies or loses capacity. There is no recovery mechanism. No bank to call. No process to follow. The assets simply disappear.

Traditional crypto wallets have no concept of succession. You hold the keys, and when you can't, nobody can. Existing solutions require trusting a lawyer, a multisig committee, or a centralized service — all of which reintroduce the human failure points that crypto was designed to remove.

SolWill eliminates this entirely.

---

## How It Works

### For the will owner

1. **Connect your Solana wallet** — SolWill reads your assets automatically. No sign-up, no email, no password.
2. **Create your will** — Set a check-in interval (30, 90, or 180 days) and deploy your will on-chain. This initializes two PDAs: a `WillAccount` storing your configuration and a `VaultAccount` to hold your assets.
3. **Add heirs** — Enter each heir's wallet address and assign basis point splits. Up to 5 heirs. All heir data is stored in individual `HeirAccount` PDAs on-chain.
4. **Deposit assets** — Lock SOL, USDC, or any SPL token into the vault. The program controls the vault — not you, not anyone else.
5. **Check in** — Tap once every interval to reset the clock. Check-in can be done from any Solana wallet client.

### What happens if you stop checking in

Once the deadline passes, the will transitions to `Triggered` state. At that point, **anyone** can call the `trigger` instruction — the smart contract validates the on-chain clock and flips the state. No admin. No oracle. No trusted party.

### For heirs

1. Visit the SolWill app
2. Connect the wallet address registered as an heir
3. The program verifies the wallet, calculates their basis point share, and transfers assets in a single transaction

---

## On-Chain State Machine

```
Draft → Active → Active (checked in) → Triggered → Settled
```

Every state transition is enforced by the Anchor program. The `trigger` instruction contains a `require!` guard that checks:

```
clock.unix_timestamp > last_checkin + interval
```

It is mathematically impossible to trigger a will before its deadline without the Solana validator lying about the clock.

---

## Who It's For

- **Crypto holders** who want their assets to reach their family, not disappear
- **Long-term HODLers** with significant on-chain wealth and no succession plan
- **DAOs and multisig teams** who need a trustless fallback for inactive signers
- **Anyone** who has ever thought "what happens to my wallet if something happens to me"

You do not need to be technical to use SolWill. The check-in experience is a single tap.

---

## What Makes SolWill Different

### Fully trustless — the program is the law

There is no admin key. No multisig that can override the will. No Adevar Labs, no SolWill team, no anyone who can access your vault. The Anchor program is the only authority. Once deployed, the rules cannot be changed without a new transaction signed by the owner.

### Permissionless trigger

The `trigger` instruction has no privileged caller. Once the deadline passes, any wallet on earth can call it. This means the will executes even if the SolWill frontend goes offline, the team disappears, or the domain expires. The protocol is unstoppable.

### Multi-asset in a single transaction

SOL, SPL tokens, and NFTs (including compressed NFTs via Metaplex) are all locked in a single program-controlled vault and transferred atomically. Heirs do not need to claim each asset separately.

### Sub-cent check-ins

On Solana, a check-in transaction costs less than $0.001. This makes daily or weekly check-ins completely viable — something that would cost dollars in gas on Ethereum and therefore never happen in practice.

### Consumer-grade UX

SolWill is designed to look and feel like a product that could ship on the App Store. The check-in is a hold-to-confirm gesture. The dashboard shows a real-time countdown ring. The heir management page has live BPS validation and confirm dialogs. Complexity is hidden; the interface is calm and clear.

### No custodian, no KYC, no sign-up

SolWill never holds your keys. It never touches your assets outside of what the on-chain program enforces. There is no account to create, no email to verify, no terms of service that can change.

---

## Technology Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Smart contract   | Anchor (Rust)     |
| Frontend         | Next.js 14 · TypeScript · App Router           |
| Animations       | Framer Motion                                  |
| State management | Zustand                                        |
| RPC & data       | Helius — enhanced tx parsing, webhooks         |
| NFT support      | Metaplex — standard + compressed NFTs          |
| Token transfers  | SPL Token program                              |
| Wallet support   | Phantom, Backpack, Solflare via Wallet Adapter |
| Network          | Solana (devnet → mainnet)                      |

---

## Hackathon Context

SolWill was built for the **Solana Colosseum Frontier Hackathon** as an open-track submission under the Consumer Apps category.

It is also submitted to the **Adevar Labs security bounty track** — a $50,000 audit credit prize for projects that demonstrate strong security awareness. SolWill is a natural fit: it handles irreversible asset transfers with no recovery path, making a professional smart contract audit not optional but essential before mainnet launch.

The judging criteria for Frontier — technical execution, innovation, real-world use case, user experience, and completeness — directly shaped every design decision in SolWill. The permissionless trigger is the technical innovation. The $140B lost crypto problem is the real-world use case. The consumer-grade UI is the UX answer. The fully deployed devnet program with working end-to-end flow is the completeness proof.

---


Network: Solana Devnet

---

## License

MIT — open source, forkable, auditable.

---

_SolWill — because your crypto should outlive you._
