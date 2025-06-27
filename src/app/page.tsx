'use client'

import { useEffect, useState } from 'react'
import BlogCard from '@/components/BlogCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogAPI } from '@/lib/api'
import { Blog } from '@/types/blog'
import { SparklesIcon, RocketLaunchIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-sm font-medium">
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI-Powered Content Creation
              </div>
              <h1 className="heading-1 max-w-4xl mx-auto">
                Create <span className="gradient-text">Amazing Content</span> with AI Assistance
              </h1>
              <p className="body-large max-w-2xl mx-auto">
                Discover, create, and share compelling blog posts powered by artificial intelligence. 
                Join our community of writers and unlock your creative potential.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/create" className="btn-primary">
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                Start Writing
              </a>
              <a href="#latest-posts" className="btn-secondary">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Browse Posts
              </a>
            </div>
          </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Main Content */}
      <main id="latest-posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="heading-2">Latest Articles</h2>
            <p className="body-medium max-w-2xl mx-auto">
              Explore our collection of AI-generated and human-crafted articles on various topics.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-600 font-medium">Loading amazing content...</p>
                  <p className="text-gray-400 text-sm">This won't take long</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="card p-8 border-red-200 bg-red-50">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn-primary bg-red-600 hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && blogs.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <DocumentTextIcon className="w-10 h-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">No posts yet</h3>
                  <p className="text-gray-600">Be the first to share your thoughts and create amazing content!</p>
                </div>
                <a href="/create" className="btn-primary">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Create First Post
                </a>
              </div>
            </div>
          )}

          {/* Blog Grid */}
          {!loading && !error && blogs.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <div 
                  key={blog.id} 
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BlogCard
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
                    featuredImage={blog.featuredImage}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 