'use client'

import { useWillStore } from '@/app/store/useWillStore'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
    const { connected, publicKey } = useWillStore()

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

            {/* Sidebar */}
            <aside
                className="w-64 hidden md:flex flex-col p-5 border-r"
                style={{ borderColor: 'var(--border)' }}
            >
                <div className="mb-8">
                    <h1 className="text-lg font-bold">Will Protocol</h1>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Decentralized Estate Layer
                    </p>
                </div>

                <nav className="flex flex-col gap-3 text-sm">
                    <a href="/dashboard" className="hover:opacity-80">Dashboard</a>
                    <a href="/setup" className="hover:opacity-80">Setup</a>
                    <a href="/activity" className="hover:opacity-80">Activity</a>
                    <a href="/settings" className="hover:opacity-80">Settings</a>
                </nav>

                {/* Wallet */}
                <div className="mt-auto pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    {connected ? (
                        <div className="text-xs">
                            <div style={{ color: 'var(--text-secondary)' }}>Connected</div>
                            <div className="font-mono truncate">
                                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            Not Connected
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    )
}