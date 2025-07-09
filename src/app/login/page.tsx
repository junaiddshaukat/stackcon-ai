'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/components/auth-provider'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn(email, password)
      
      if (result?.user) {
        console.log('Login successful, redirecting...')
        router.push('/')
      } else {
        setError('Invalid email or password')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  // Show error from URL params (like auth callback errors)
  const urlError = searchParams.get('error')

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">StackCon</span>
        </Link>
      </div>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-700/60 rounded-3xl shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome back</CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Sign in to your account to continue searching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(error || urlError) && (
            <div className="bg-red-900/40 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error || 'Authentication error occurred'}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-800/60 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-gray-800/60 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoginFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <Suspense fallback={<LoginFallback />}>
        <LoginContent />
      </Suspense>
    </div>
  )
} 