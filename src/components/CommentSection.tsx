'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import type { Comment } from '@/types/blog'

interface CommentSectionProps {
  blogId: string
}

export default function CommentSection({ blogId }: CommentSectionProps) {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || data) // handler returns {comments: []}
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (blogId) fetchComments()
  }, [blogId])

  const handleSubmit = async () => {
    if (!content.trim()) return

    if (!isSignedIn) {
      toast.error('Please sign in to comment')
      return
    }

    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          authorName: user?.fullName || user?.username || 'Anonymous User',
          authorEmail: user?.emailAddresses?.[0]?.emailAddress || 'no-reply@example.com'
        })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to post comment')
      }

      toast.success('Comment submitted for approval')
      setContent('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <p className="text-sm text-gray-800 whitespace-pre-line">{comment.content}</p>
              <div className="text-xs text-gray-500 mt-1">
                {comment.authorName} • {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={4}
          className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  )
} 