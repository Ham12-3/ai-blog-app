'use client'

import { useEffect, useState } from 'react'
import BlogCard from '@/components/BlogCard'
import Header from '@/components/Header'
import { blogAPI } from '@/lib/api'
import { Blog } from '@/types/blog'

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await blogAPI.getBlogs(1, 10)
        console.log('API Response:', response) // Debug log
        setBlogs(response.blogs || [])
      } catch (err) {
        console.error('Error fetching blogs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch blogs')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 font-medium">Error loading blogs</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No blogs found.</p>
          </div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                slug={blog.slug}
                title={blog.title}
                excerpt={blog.excerpt || blog.content?.substring(0, 200) + '...' || ''}
                author={blog.authorName || 'Unknown'}
                publishedAt={blog.publishedAt || blog.createdAt}
                tags={blog.tags || []}
                likeCount={blog.likeCount || 0}
                shareCount={blog.shareCount || 0}
                viewCount={blog.viewCount || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 