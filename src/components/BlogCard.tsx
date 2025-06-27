import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, UserIcon, EyeIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline'

interface BlogCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  likeCount: number
  shareCount: number
  viewCount: number
  featuredImage?: string
}

export default function BlogCard({ 
  id, 
  slug, 
  title, 
  excerpt, 
  author, 
  publishedAt, 
  tags, 
  likeCount, 
  shareCount, 
  viewCount,
  featuredImage
}: BlogCardProps) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <article className="card group animate-fade-in overflow-hidden">
      {/* Featured Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Link href={`/blog/${slug}`}>
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium">Blog Article</p>
              </div>
            </div>
          )}
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 space-y-4">
        {/* Header with Author and Date */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-gray-700">{author}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={publishedAt}>{formattedDate}</time>
          </div>
        </div>

        {/* Title and Excerpt */}
        <div className="space-y-3">
          <h3 className="heading-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            <Link href={`/blog/${slug}`} className="hover:underline decoration-2 underline-offset-2">
              {title}
            </Link>
          </h3>
          
          <p className="body-medium line-clamp-3">{excerpt}</p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="badge-primary hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="badge text-xs text-gray-400 bg-gray-50">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer with Stats and Read More */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* View Count */}
            <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200">
              <EyeIcon className="w-4 h-4" />
              <span className="font-medium">{viewCount.toLocaleString()}</span>
            </div>
            
            {/* Like Count */}
            <div className="flex items-center space-x-1 hover:text-red-500 transition-colors duration-200">
              <HeartIcon className="w-4 h-4" />
              <span className="font-medium">{likeCount.toLocaleString()}</span>
            </div>
            
            {/* Share Count */}
            <div className="flex items-center space-x-1 hover:text-green-600 transition-colors duration-200">
              <ShareIcon className="w-4 h-4" />
              <span className="font-medium">{shareCount.toLocaleString()}</span>
            </div>
          </div>
          
          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-1 transition-all duration-200"
          >
            Read article
            <svg 
              className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </article>
  )
} 