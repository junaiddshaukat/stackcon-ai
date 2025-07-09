'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Menu, X, Library, Sparkles, User, LogOut, Code, Github, Twitter, Mail, Zap } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showJobStrip, setShowJobStrip] = useState(true)

  const navigation = [
    { name: 'Library', href: '/library', icon: Library },
    { name: 'AI Search', href: '/ai-search', icon: Sparkles },
    { name: 'Agent Search', href: '/agent-search', icon: Zap },
  ]

  // External links for Github and X (Twitter)
  const externalLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/junaiddshaukat/stackcon-ai',
      icon: Github,
      ariaLabel: 'GitHub Repository',
    },
    {
      name: 'X',
      href: 'https://x.com/junaiddshaukat',
      icon: Twitter,
      ariaLabel: 'X (Twitter) Profile',
    },
  ]

  // If the strip is hidden, adjust nav top to 0, else to 33px
  const navTop = showJobStrip ? 'top-[33px]' : 'top-0'

  return (
    <>
      {/* Top job strip */}
      {showJobStrip && (
        <div className="w-full bg-black border-b border-gray-800 text-white text-xs flex items-center justify-center px-2 py-1 fixed top-0 left-0 z-[60]">
          <span className="truncate flex items-center">
            I&apos;m looking for a job!
            <Button
              size="sm"
              className="ml-2 px-3 py-1 h-7 text-xs font-medium bg-gray-800 border border-gray-700 text-white rounded hover:bg-gray-700 transition"
              onClick={() => setShowJobModal(true)}
            >
              More info
            </Button>
          </span>
          <button
            className="ml-2 text-gray-400 hover:text-white"
            aria-label="Close"
            onClick={() => setShowJobStrip(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal for job info */}
      {showJobModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full relative border border-gray-700">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowJobModal(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-2 text-white">Hi, I&apos;m looking for a job!</h2>
            <p className="text-gray-300 mb-4">
              I&apos;m open to new opportunities in software engineering, frontend, or full-stack roles. If you think I&apos;d be a good fit for your team, please reach out!
            </p>
            <div className="flex flex-col space-y-3">
              <a
                href="https://github.com/junaiddshaukat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/junaiddshaukat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white"
              >
                {/* Simple LinkedIn SVG */}
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.57 1.98 3.57 4.56v5.62z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href="mailto:junaidshaukat546@gmail.com"
                className="flex items-center px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                junaidshaukat546@gmail.com
              </a>
              <a
                href="https://x.com/junaiddshaukat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white"
              >
                <Twitter className="w-4 h-4 mr-2" />
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating, rounded header */}
      <nav
        className={`fixed left-1/2 transform -translate-x-1/2 ${navTop} z-50 glass-effect bg-gray-950 border border-white/10 transition-all rounded-2xl shadow-xl w-[95vw] max-w-4xl mx-auto`}
        style={{
          // Add a little margin from the top strip or top of page
          marginTop: showJobStrip ? '12px' : '24px',
        }}
      >
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl text-white font-bold gradient-text">StackCon</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Github and X icons */}
              {externalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.ariaLabel}
                  className="flex items-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 bg-gray-800/60 px-4 py-2 rounded-xl border border-gray-700/50 hover:bg-gray-700/60 transition-colors"
                    title="Go to profile"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-200 font-medium">
                      {user.email?.split('@')[0]}
                    </span>
                  </Link>
                  <Button
                    className="button-secondary"
                    size="sm"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                null
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:bg-gray-800/60"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-effect border-t border-white/10 px-4 pb-6 pt-4 rounded-b-2xl">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/60"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-white">{item.name}</span>
                </Link>
              ))}

              {/* Github and X icons in mobile menu */}
              <div className="flex items-center space-x-6 pt-2 pb-1 px-2">
                {externalLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.ariaLabel}
                    className="flex items-center text-gray-300 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <link.icon className="w-6 h-6" />
                    <span className="sr-only">{link.name}</span>
                  </a>
                ))}
              </div>

              {user ? (
                <div className="flex flex-col space-y-4 pt-4 border-t border-gray-700/50">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 bg-gray-800/60 px-4 py-3 rounded-xl hover:bg-gray-700/60 transition-colors"
                    title="Go to profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </Link>
                  <Button
                    className="button-secondary w-full justify-start text-white"
                    size="sm"
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                null
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}