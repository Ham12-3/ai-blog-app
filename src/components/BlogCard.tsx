import Link from 'next/link'
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

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
}

export default function BlogCard({ id, slug, title, excerpt, author, publishedAt, tags, likeCount, shareCount, viewCount }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <UserIcon className="h-4 w-4 mr-1" />
          <span className="mr-4">{author}</span>
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/blog/${slug}`} className="hover:text-indigo-600">
            {title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <Link
            href={`/blog/${slug}`}
            className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
          >
            Read more →
          </Link>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* View Count */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewCount}</span>
            </div>
            
            {/* Like Count */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </div>
            
            {/* Share Count */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{shareCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 