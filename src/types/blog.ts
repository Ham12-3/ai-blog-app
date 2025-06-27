export interface Blog {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  authorId: string
  authorName: string
  authorEmail: string
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  viewCount: number
  likeCount: number
  shareCount: number
}

export interface Comment {
  id: string
  content: string
  authorName: string
  authorEmail: string
  blogId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  parentId?: string
  replies?: Comment[]
  blog?: Blog // Include blog information for admin purposes
}

export interface CreateBlogRequest {
  title: string
  content: string
  description: string
  tags: string[]
  status: 'draft' | 'published'
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
}

export interface AIGenerateRequest {
  title: string
  description: string
  tone: 'professional' | 'casual' | 'technical' | 'friendly'
  length: 'short' | 'medium' | 'long'
}

export interface AIGenerateResponse {
  content: string
  metaTitle: string
  metaDescription: string
  suggestedTags: string[]
} 