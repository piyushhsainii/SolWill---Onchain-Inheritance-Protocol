'use client'

import { useWillStore } from '@/app/store/useWillStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useProtectedRoute() {
  const router = useRouter()
  const { connected } = useWillStore()

  useEffect(() => {
    if (!connected) {
      router.push('/connect')
    }
  }, [connected])
}
