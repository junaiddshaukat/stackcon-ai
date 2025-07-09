'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as AppUser } from '@/lib/types'

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get user profile from database
  const getUserProfile = async (authUser: User): Promise<AppUser | null> => {
    try {
      console.log('AuthProvider: Getting user profile for:', authUser.email)
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, create new profile
          console.log('AuthProvider: Creating new user profile')
          
          const newUser = {
            id: authUser.id,
            email: authUser.email || '',
            role: 'user' as const
          }

          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single()

          if (createError) {
            console.error('AuthProvider: Error creating user:', createError)
            return null
          }

          console.log('AuthProvider: New user created:', newProfile.email)
          return newProfile
        }
        
        console.error('AuthProvider: Error fetching user profile:', error)
        return null
      }

      console.log('AuthProvider: User profile loaded:', profile.email, 'Role:', profile.role)
      return profile
    } catch (error) {
      console.error('AuthProvider: Exception getting user profile:', error)
      return null
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error)
      throw error
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('AuthProvider: Getting initial session...')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!mounted) return
      
      if (error) {
        console.error('AuthProvider: Session error:', error)
        setUser(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        console.log('AuthProvider: Initial session found for:', session.user.email)
        const profile = await getUserProfile(session.user)
        if (mounted) {
          setUser(profile)
        }
      } else {
        console.log('AuthProvider: No initial session')
        setUser(null)
      }
      
      if (mounted) {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('AuthProvider: Auth state change:', event)

        if (event === 'INITIAL_SESSION') {
          // Already handled above
          return
        }

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: User signed in:', session.user.email)
          const profile = await getUserProfile(session.user)
          setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out')
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('AuthProvider: Token refreshed for:', session.user.email)
          // Keep existing user data, no need to refetch profile
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 