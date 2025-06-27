'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import type { Comment } from '@/types/blog'

export default function AdminDashboard() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }

    // Only allow specific admin users - you can modify this logic
    // For now, allowing all signed-in users. You can add email restrictions here:
    // const adminEmails = ['your-admin-email@example.com']
    // if (!user?.emailAddresses?.[0]?.emailAddress || 
    //     !adminEmails.includes(user.emailAddresses[0].emailAddress)) {
    //   router.push('/')
    //   return
    // }

    fetchPendingComments()
  }, [isSignedIn, user, router])

  const fetchPendingComments = async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Pending comments data:', data) // Debug log
        setPendingComments(data)
      }
    } catch (error) {
      console.error('Error fetching pending comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    setActionLoading(commentId)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setPendingComments(prev => prev.filter(comment => comment.id !== commentId))
      }
    } catch (error) {
      console.error('Error approving comment:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (commentId: string) => {
    setActionLoading(commentId)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setPendingComments(prev => prev.filter(comment => comment.id !== commentId))
      }
    } catch (error) {
      console.error('Error rejecting comment:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (!isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Moderate and manage blog comments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Comments</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingComments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approved Today</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Rejected Today</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Comments</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading comments...</p>
            </div>
          ) : pendingComments.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending comments</h3>
              <p className="mt-1 text-sm text-gray-500">All comments have been moderated.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingComments.map((comment) => (
                <div key={comment.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <span className="font-medium text-gray-900">{comment.authorName}</span>
                        <span>•</span>
                        <span>{comment.authorEmail}</span>
                        <span>•</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{comment.content}</p>
                      
                      {/* Blog Information */}
                      {comment.blog ? (
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                <a 
                                  href={`/blog/${comment.blog.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {comment.blog.title}
                                </a>
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {comment.blog.excerpt || (comment.blog.content?.substring(0, 150) + '...')}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>By {comment.blog.authorName}</span>
                                <span>•</span>
                                <span>{comment.blog.viewCount || 0} views</span>
                                <span>•</span>
                                <span>{comment.blog.likeCount || 0} likes</span>
                                {comment.blog.tags && comment.blog.tags.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <div className="flex space-x-1">
                                      {comment.blog.tags.slice(0, 2).map((tag) => (
                                        <span key={tag} className="bg-gray-200 px-2 py-1 rounded text-xs">
                                          {tag}
                                        </span>
                                      ))}
                                      {comment.blog.tags.length > 2 && (
                                        <span className="text-gray-400">+{comment.blog.tags.length - 2} more</span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <a 
                                href={`/blog/${comment.blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Blog
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 bg-red-50 p-2 rounded">
                          ⚠️ Blog not found (ID: {comment.blogId})
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {actionLoading === comment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleReject(comment.id)}
                        disabled={actionLoading === comment.id}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {actionLoading === comment.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 