'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // For OAuth flows, Supabase automatically handles the session
        // We just need to check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=auth_callback_error')
          return
        }

        if (session?.user) {
          console.log('Auth callback successful for:', session.user.email)
          // Successful authentication, redirect to home
          router.push('/')
        } else {
          console.log('Auth callback: No session found')
          // Try to wait a bit for the session to be established
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session?.user) {
                router.push('/')
              } else {
                router.push('/login?error=no_session')
              }
            })
          }, 1000)
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
} 