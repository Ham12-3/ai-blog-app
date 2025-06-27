'use client'

import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

interface BlogPreviewProps {
  title: string
  content: string
  tags: string[]
  author: string
  featuredImage?: string
}

export default function BlogPreview({ title, content, tags, author, featuredImage }: BlogPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden max-w-4xl mx-auto">
      {featuredImage && (
        <div className="h-64 md:h-96 overflow-hidden">
          <Image 
            src={featuredImage} 
            alt={title || 'Featured image'}
            width={800}
            height={400}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title || 'Untitled Post'}</h1>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <span>By {author}</span>
            <span className="mx-2">•</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

        <article className="prose prose-lg max-w-none">
          {content ? (
            <ReactMarkdown
              components={{
                img: ({ src, alt, ...props }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    {...props}
                  />
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <pre className="bg-gray-100 rounded p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">Start writing your content to see the preview...</p>
          )}
        </article>
      </div>
    </div>
  )
} 