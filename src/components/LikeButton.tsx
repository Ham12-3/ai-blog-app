'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface LikeButtonProps {
  blogId: string
  initialLikeCount: number
  className?: string
}

export default function LikeButton({ blogId, initialLikeCount, className = '' }: LikeButtonProps) {
  const { getToken } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)

  // Fetch initial like status
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/like-status`)
        if (response.ok) {
          const data = await response.json()
          setLiked(data.liked)
          setLikeCount(data.likeCount)
        }
      } catch (error) {
        console.error('Error fetching like status:', error)
      }
    }

    if (blogId) {
      fetchLikeStatus()
    }
  }, [blogId])

  const handleLike = async () => {
    if (loading) return

    setLoading(true)
    setAnimating(true)

    // Optimistic UI update
    const wasLiked = liked
    const newLiked = !liked
    const newCount = newLiked ? likeCount + 1 : likeCount - 1

    setLiked(newLiked)
    setLikeCount(newCount)

    try {
      const token = await getToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/like`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const data = await response.json()
      setLiked(data.liked)
      setLikeCount(data.likeCount)
    } catch (error) {
      // Revert optimistic update on error
      setLiked(wasLiked)
      setLikeCount(likeCount)
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
      setTimeout(() => setAnimating(false), 300)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 transition-all duration-200 group ${
        loading ? 'opacity-75 cursor-not-allowed' : 'hover:text-red-500'
      } ${className}`}
    >
      <div className="relative">
        <svg
          className={`w-6 h-6 transition-all duration-300 ${
            liked ? 'text-red-500 fill-red-500' : 'text-gray-600 group-hover:text-red-500'
          } ${animating ? 'scale-125' : 'scale-100'}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        
        {/* Animated particles effect */}
        {animating && liked && (
          <>
            <div className="absolute inset-0 animate-ping">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            {/* Small heart particles */}
            <div className="absolute -top-2 -left-1 animate-bounce text-red-400">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-2 animate-bounce text-red-400 animation-delay-100">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </>
        )}
      </div>
      
      <span className={`text-sm font-medium transition-all duration-300 ${
        animating ? 'scale-110' : 'scale-100'
      }`}>
        {likeCount}
      </span>
    </button>
  )
} 