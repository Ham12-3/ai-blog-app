'use client'

import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import ImageUpload from './ImageUpload'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your blog content here... Use markdown syntax for formatting.',
  className = ''
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertImage = (url: string, fileName: string) => {
    const imageMarkdown = `![${fileName}](${url})\n\n`
    const textarea = textareaRef.current
    
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + imageMarkdown + value.substring(end)
      onChange(newValue)
      
      // Set cursor position after the inserted image
      setTimeout(() => {
        const newPosition = start + imageMarkdown.length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }, 10)
    } else {
      onChange(value + imageMarkdown)
    }
    
    setShowImageUpload(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Ctrl+V for pasting images (handled by ImageUpload component)
    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2)
      }, 10)
    }
  }

  return (
    <div className={`markdown-editor ${className}`}>
      {/* Editor Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'write'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preview
          </button>
        </nav>
      </div>

      {/* Editor Content */}
      {activeTab === 'write' ? (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setShowImageUpload(!showImageUpload)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="Insert Image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Image</span>
            </button>
            
            <div className="text-xs text-gray-500">
              Use markdown syntax: **bold**, *italic*, `code`, [link](url)
            </div>
          </div>

          {/* Image Upload Modal */}
          {showImageUpload && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Upload Image</h3>
                <button
                  type="button"
                  onClick={() => setShowImageUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <ImageUpload
                onUploadSuccess={insertImage}
                folder="blog-content"
                placeholder="Upload image for your blog content"
                maxSize={10}
              />
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
        </div>
      ) : (
        <div className="prose prose-lg max-w-none">
          <div className="border border-gray-300 rounded-lg p-6 min-h-96 bg-white">
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
              {value || '*Nothing to preview yet. Start writing in the Write tab.*'}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
} 