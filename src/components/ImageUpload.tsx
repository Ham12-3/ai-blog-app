'use client'

import { useState, useRef } from 'react'
import { ImageKitProvider, IKUpload } from 'imagekitio-next'
import Image from 'next/image'

interface ImageUploadProps {
  onUploadSuccess: (url: string, fileName: string) => void
  onUploadError?: (error: any) => void
  className?: string
  placeholder?: string
  maxSize?: number // in MB
  accept?: string
  folder?: string // ImageKit folder
}

const authenticator = async () => {
  try {
    const response = await fetch('/api/imagekit-auth')
    if (!response.ok) {
      throw new Error('Authentication failed')
    }
    const data = await response.json()
    const { signature, expire, token } = data
    return { signature, expire, token }
  } catch (error) {
    throw new Error('Authentication failed')
  }
}

export default function ImageUpload({
  onUploadSuccess,
  onUploadError,
  className = '',
  placeholder = 'Click to upload image or drag & drop',
  maxSize = 5,
  accept = 'image/*',
  folder = 'blog-images'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const ikUploadRef = useRef<any>(null)

  const handleUploadStart = () => {
    setUploading(true)
    setUploadProgress(0)
  }

  const handleUploadProgress = (progress: any) => {
    const percent = Math.round((progress.loaded / progress.total) * 100)
    setUploadProgress(percent)
  }

  const handleUploadSuccess = (response: any) => {
    setUploading(false)
    setUploadProgress(0)
    setPreviewUrl(response.url)
    onUploadSuccess(response.url, response.name)
  }

  const handleUploadError = (error: any) => {
    setUploading(false)
    setUploadProgress(0)
    if (onUploadError) {
      onUploadError(error)
    } else {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    }
  }

  const validateFile = (file: File) => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return false
    }

    return true
  }

  const triggerUpload = (file?: File) => {
    if (file && ikUploadRef.current) {
      // Create a custom event to trigger upload
      const input = ikUploadRef.current.querySelector('input[type="file"]')
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    } else if (ikUploadRef.current) {
      ikUploadRef.current.click()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      triggerUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  // Handle paste events for pasting images from clipboard
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (imageItem) {
      const file = imageItem.getAsFile()
      if (file) {
        triggerUpload(file)
      }
    }
  }

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey} authenticator={authenticator}>
      <div className={`image-upload-container ${className}`}>
        {/* Hidden ImageKit Upload Component */}
        <div style={{ display: 'none' }}>
          <IKUpload
            ref={ikUploadRef}
            folder={folder}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            validateFile={validateFile}
            accept={accept}
          />
        </div>

        {/* Custom Upload UI */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-75' : ''}`}
          onClick={() => !uploading && triggerUpload()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onPaste={handlePaste}
          tabIndex={0}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewUrl(null)
                  triggerUpload()
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change image
              </button>
            </div>
          ) : uploading ? (
            <div className="space-y-4">
              <div className="text-gray-600">
                <svg className="mx-auto h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to {maxSize}MB • Ctrl+V to paste
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ImageKitProvider>
  )
} 