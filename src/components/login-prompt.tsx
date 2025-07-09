'use client'

import { useState } from 'react'
import { X, Heart, History, Star, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LoginPromptProps {
  isOpen: boolean
  onClose: () => void
  feature: 'favorites' | 'history' | 'collections'
  onLogin: () => void
  onSignup: () => void
}

const featureConfig = {
  favorites: {
    icon: Heart,
    title: 'Save Your Favorites',
    description: 'Keep track of the resources you love most',
    benefits: [
      'Save resources for later',
      'Quick access to your favorites',
      'Sync across all devices'
    ]
  },
  history: {
    icon: History,
    title: 'Track Your Searches',
    description: 'Never lose a great search result again',
    benefits: [
      'View your search history',
      'Revisit past discoveries',
      'See trending searches'
    ]
  },
  collections: {
    icon: Bookmark,
    title: 'Organize Collections',
    description: 'Create custom collections of resources',
    benefits: [
      'Group related resources',
      'Share collections with others',
      'Export your collections'
    ]
  }
}

export function LoginPrompt({ isOpen, onClose, feature, onLogin, onSignup }: LoginPromptProps) {
  const config = featureConfig[feature]
  const Icon = config.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">{config.title}</DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <CardContent className="p-0">
          <div className="space-y-3 mb-6">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button onClick={onSignup} className="w-full">
              Sign Up Free
            </Button>
            <Button onClick={onLogin} variant="outline" className="w-full">
              Login
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            You can continue using the app without an account, but you'll miss out on these features.
          </p>
        </CardContent>
      </DialogContent>
    </Dialog>
  )
} 