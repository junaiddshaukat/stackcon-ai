'use client'

import { useAuth } from '@/components/auth-provider'
import { useState } from 'react'

export function AuthStatus() {
  const { user, loading } = useAuth()
  const [expanded, setExpanded] = useState(false)

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-md shadow-sm z-50 cursor-pointer"
           onClick={() => setExpanded(!expanded)}>
        🔄 Loading auth...
        {expanded && (
          <div className="mt-2 text-xs">
            Checking authentication state...
          </div>
        )}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded-md shadow-sm z-50 cursor-pointer"
           onClick={() => setExpanded(!expanded)}>
        ❌ No user
        {expanded && (
          <div className="mt-2 text-xs">
            User not authenticated<br/>
            Click to go to login page
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-800 px-3 py-2 rounded-md shadow-sm z-50 cursor-pointer"
         onClick={() => setExpanded(!expanded)}>
      ✅ {user.email} ({user.role})
      {expanded && (
        <div className="mt-2 text-xs">
          ID: {user.id}<br/>
          Email: {user.email}<br/>
          Role: {user.role}<br/>
          Created: {new Date(user.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
