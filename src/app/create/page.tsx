'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'
import { SparklesIcon, EyeIcon } from '@heroicons/react/24/outline'
import BlogEditor from '@/components/BlogEditor'
import BlogPreview from '@/components/BlogPreview'
import TagInput from '@/components/TagInput'
import ImageUpload from '@/components/ImageUpload'

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
    }
  }

  const publishBlog = async (data: BlogForm) => {
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
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="mt-2 text-gray-600">Use AI to help generate amazing content</p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-md font-medium ${
              !showPreview 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-md font-medium flex items-center ${
              showPreview 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </button>
        </div>

        {showPreview ? (
          <BlogPreview
            title={watch('title')}
            content={watch('content')}
            tags={watch('tags')}
            author={user?.fullName || 'Anonymous'}
            featuredImage={watch('featuredImage')}
          />
        ) : (
          <form onSubmit={handleSubmit(publishBlog)} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your blog title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Brief description of your blog post"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Add tags..."
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  <ImageUpload
                    onUploadSuccess={(url) => setValue('featuredImage', url)}
                    folder="featured-images"
                    placeholder="Upload a featured image for your blog post"
                    maxSize={10}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a high-quality image that represents your blog post. This will be displayed as the main image.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <button
                      type="button"
                      onClick={generateAIContent}
                      disabled={isGenerating}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                  <BlogEditor
                    content={watch('content')}
                    onChange={(content) => setValue('content', content)}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleSubmit(saveDraft)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Publish
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 