'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { SparklesIcon, EyeIcon, PencilIcon, BookmarkIcon, ShareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import BlogEditor from '@/components/BlogEditor'
import BlogPreview from '@/components/BlogPreview'
import TagInput from '@/components/TagInput'
import ImageUpload from '@/components/ImageUpload'
import Header from '@/components/Header'

interface BlogForm {
  title: string
  description: string
  tags: string[]
  content: string
  featuredImage?: string
}

export default function CreateBlog() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<BlogForm>({
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      content: '',
      featuredImage: ''
    }
  })

  useEffect(() => {
    register('content', { required: 'Content cannot be empty.' })
  }, [register])

  if (!isSignedIn) {
    router.push('/')
    return null
  }

  const generateAIContent = async () => {
    const title = watch('title')
    const description = watch('description')
    
    if (!title || !description) {
      toast.error('Please provide a title and description first')
      return
    }

    setIsGenerating(true)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          tone: 'professional',
          length: 'medium'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Failed to generate content: ${errorData.error || response.statusText}`
        )
      }

      const data = await response.json()
      setValue('content', data.content)
      toast.success('AI content generated successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(errorMessage)
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveDraft = async (data: BlogForm) => {
    setIsSavingDraft(true)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          status: 'draft',
          authorId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to save draft: ${errorData.error || response.statusText}`)
      }

      toast.success('Draft saved successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(errorMessage)
      console.error('Error saving draft:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const publishBlog = async (data: BlogForm) => {
    setIsPublishing(true)
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          status: 'published',
          authorId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to publish blog: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      toast.success('Blog published successfully!')
      router.push(`/blog/${result.slug}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(errorMessage)
      console.error('Error publishing blog:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const watchedTitle = watch('title')
  const watchedContent = watch('content')
  const hasContent = watchedTitle || watchedContent

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      {/* Top Navigation Bar */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - Back button and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
              <div className="h-6 border-l border-gray-200"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Post</h1>
                <p className="text-sm text-gray-500">Draft auto-saves as you type</p>
              </div>
            </div>

            {/* Right side - View toggle and actions */}
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    !showPreview 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    showPreview 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleSubmit(saveDraft)}
                disabled={isSavingDraft || !hasContent}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingDraft ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </button>
              
              <button
                type="submit"
                onClick={handleSubmit(publishBlog)}
                disabled={isPublishing || !hasContent}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <ShareIcon className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showPreview ? (
          <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="card p-8">
                <BlogPreview
                  title={watch('title')}
                  content={watch('content')}
                  tags={watch('tags')}
                  author={user?.fullName || 'Anonymous'}
                  featuredImage={watch('featuredImage')}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <form className="space-y-8">
              {/* Header Section */}
              <div className="card p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">Post Details</h2>
                  <p className="text-gray-600">Add the basic information about your blog post</p>
                </div>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="input text-xl font-semibold"
                      placeholder="Enter an engaging title for your post..."
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={3}
                      className="input resize-none"
                      placeholder="Brief description that summarizes your post..."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Tags and Featured Image Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tags */}
                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                          <TagInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Add relevant tags..."
                          />
                        )}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Press Enter to add tags that help categorize your post
                      </p>
                    </div>

                    {/* Featured Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <ImageUpload
                        onUploadSuccess={(url) => setValue('featuredImage', url)}
                        folder="featured-images"
                        placeholder="Upload featured image"
                        maxSize={10}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        High-quality image that represents your post
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="card p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                    <p className="text-gray-600">Write your blog post content or use AI to help generate it</p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={generateAIContent}
                    disabled={isGenerating}
                    className="btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <BlogEditor
                    content={watch('content')}
                    onChange={(content) => setValue('content', content)}
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
} 