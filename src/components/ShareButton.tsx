'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

interface ShareButtonProps {
  blogId: string
  title: string
  slug: string
  initialShareCount: number
  className?: string
}

interface SharePlatform {
  name: string
  icon: JSX.Element
  getUrl: (url: string, title: string) => string
  color: string
}

export default function ShareButton({ 
  blogId, 
  title, 
  slug, 
  initialShareCount, 
  className = '' 
}: ShareButtonProps) {
  const { getToken } = useAuth()
  const [shareCount, setShareCount] = useState(initialShareCount)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/blog/${slug}` 
    : ''

  const sharePlatforms: SharePlatform[] = [
    {
      name: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      ),
      getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: 'hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      getUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'hover:text-blue-800'
    },
    {
      name: 'Copy Link',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      getUrl: () => '',
      color: 'hover:text-gray-600'
    }
  ]

  const handleShare = async (platform: SharePlatform) => {
    setLoading(true)

    try {
      // Increment share count on backend
      const token = await getToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/share`, {
        method: 'POST',
        headers,
      })

      // Optimistically update share count
      setShareCount(prev => prev + 1)

      if (platform.name === 'Copy Link') {
        // Copy to clipboard
        await navigator.clipboard.writeText(currentUrl)
        // You could show a toast notification here
        alert('Link copied to clipboard!')
      } else {
        // Open share window
        const shareUrl = platform.getUrl(currentUrl, title)
        window.open(shareUrl, '_blank', 'width=600,height=400')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setLoading(false)
      setShowDropdown(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className={`flex items-center space-x-2 transition-all duration-200 group ${
          loading ? 'opacity-75 cursor-not-allowed' : 'hover:text-blue-500'
        }`}
      >
        <svg
          className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        <span className="text-sm font-medium">{shareCount}</span>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full mb-2 left-0 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Share this post
            </div>
            {sharePlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className={`w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors ${platform.color}`}
              >
                {platform.icon}
                <span>{platform.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 