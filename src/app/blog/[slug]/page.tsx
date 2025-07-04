'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Header from '@/components/Header'
import LikeButton from '@/components/LikeButton'
import ShareButton from '@/components/ShareButton'
import CommentSection from '@/components/CommentSection'
import { blogAPI } from '@/lib/api'
import type { Blog } from '@/types/blog'

export default function BlogPost() {
  const params = useParams()
  const slug = params.slug as string
  
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const blogData = await blogAPI.getBlogBySlug(slug)
        setBlog(blogData)
      } catch (err) {
        setError('Failed to load blog post')
        console.error('Error fetching blog:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBlog()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-2/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
            <p className="text-gray-600">The blog post you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow overflow-hidden">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img 
                src={blog.featuredImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Article Header */}
          <div className="p-8">
            <div className="mb-6">
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              
              {/* Meta Information */}
              <div className="flex items-center text-gray-600 text-sm">
                <span>By {blog.authorName}</span>
                <span className="mx-2">•</span>
                <span>
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="mx-2">•</span>
                <span>{blog.viewCount} views</span>
              </div>
            </div>
            
            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>
                {blog.content}
              </ReactMarkdown>
            </div>
            
            {/* Article Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <LikeButton 
                    blogId={blog.id}
                    initialLikeCount={blog.likeCount}
                  />
                  
                  <ShareButton 
                    blogId={blog.id}
                    title={blog.title}
                    slug={blog.slug}
                    initialShareCount={blog.shareCount}
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(blog.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </article>
        <CommentSection blogId={blog.id} />
      </main>
    </div>
  )
} 