const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}, token?: string) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new APIError(errorData.message || `HTTP ${response.status}`, response.status)
  }

  return response.json()
}

export const blogAPI = {
  // Get all published blogs
  getBlogs: async (page = 1, limit = 10) => {
    return fetchWithAuth(`/blogs?page=${page}&limit=${limit}`)
  },

  // Get single blog by ID
  getBlog: async (id: string) => {
    return fetchWithAuth(`/blogs/${id}`)
  },

  // Get single blog by slug
  getBlogBySlug: async (slug: string) => {
    return fetchWithAuth(`/blogs/slug/${slug}`)
  },

  // Get user's drafts
  getDrafts: async (token: string) => {
    return fetchWithAuth('/blogs/drafts', {}, token)
  },

  // Create draft
  createDraft: async (data: any, token: string) => {
    return fetchWithAuth('/blogs/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  },

  // Publish blog
  publishBlog: async (data: any, token: string) => {
    return fetchWithAuth('/blogs/publish', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  },

  // Update blog
  updateBlog: async (id: string, data: any, token: string) => {
    return fetchWithAuth(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token)
  },

  // Delete blog
  deleteBlog: async (id: string, token: string) => {
    return fetchWithAuth(`/blogs/${id}`, {
      method: 'DELETE',
    }, token)
  },
}

export const aiAPI = {
  // Generate AI content
  generateContent: async (data: any, token: string) => {
    return fetchWithAuth('/ai/generate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  },

  // Generate meta information
  generateMeta: async (content: string, token: string) => {
    return fetchWithAuth('/ai/generate-meta', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, token)
  },
}

export const commentAPI = {
  // Get comments for a blog
  getComments: async (blogId: string) => {
    return fetchWithAuth(`/blogs/${blogId}/comments`)
  },

  // Add comment
  addComment: async (blogId: string, data: any) => {
    return fetchWithAuth(`/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Get pending comments (admin)
  getPendingComments: async (token: string) => {
    return fetchWithAuth('/comments/pending', {}, token)
  },

  // Approve/reject comment (admin)
  moderateComment: async (commentId: string, action: 'approve' | 'reject', token: string) => {
    return fetchWithAuth(`/comments/${commentId}/${action}`, {
      method: 'PUT',
    }, token)
  },
} 