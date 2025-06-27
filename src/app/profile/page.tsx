'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import BlogCard from '@/components/BlogCard'
import type { Blog } from '@/types/blog'

interface UserProfile {
  id: string
  clerkUserId: string
  bio: string
  website: string
  location: string
  twitterHandle: string
  linkedInProfile: string
  interests: string[]
  blogCount: number
  totalLikes: number
  totalViews: number
  followerCount: number
  followingCount: number
  isVerified: boolean
  joinedAt: string
}

interface UserStats {
  profile: UserProfile
  totalBlogs: number
  totalViews: number
  totalLikes: number
  followerCount: number
  followingCount: number
}

export default function ProfilePage() {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [readingList, setReadingList] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    bio: '',
    website: '',
    location: '',
    twitterHandle: '',
    linkedInProfile: '',
    interests: [] as string[]
  })

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/')
      return
    }
    fetchUserData()
  }, [isSignedIn, router])

  const fetchUserData = async () => {
    try {
      const token = await getToken()
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      console.log('Fetching user data with token:', token ? 'Present' : 'Missing') // Debug
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...') // Show first 20 chars
      }

      const [profileRes, statsRes, readingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reading-list`, { headers })
      ])

      console.log('Profile response status:', profileRes.status) // Debug
      console.log('Stats response status:', statsRes.status) // Debug

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        console.log('Profile data:', profileData) // Debug
        setProfile(profileData)
        setFormData({
          bio: profileData.bio || '',
          website: profileData.website || '',
          location: profileData.location || '',
          twitterHandle: profileData.twitterHandle || '',
          linkedInProfile: profileData.linkedInProfile || '',
          interests: profileData.interests || []
        })
      } else {
        const errorData = await profileRes.text()
        console.error('Profile fetch error:', errorData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        console.log('Stats data:', statsData) // Debug
        setStats(statsData)
      } else {
        const errorData = await statsRes.text()
        console.error('Stats fetch error:', errorData)
      }

      if (readingRes.ok) {
        const readingData = await readingRes.json()
        setReadingList(readingData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAddInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }))
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  if (!isSignedIn) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user?.imageUrl}
                alt={user?.fullName || 'User'}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.fullName || user?.firstName || 'Anonymous User'}
                  </h1>
                  {profile?.isVerified && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600">{user?.emailAddresses?.[0]?.emailAddress}</p>
                {profile?.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  {profile?.location && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile?.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 hover:text-blue-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Website</span>
                    </a>
                  )}
                  
                  <span>Joined {new Date(profile?.joinedAt || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        {editing && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://your-website.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
                <input
                  type="text"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@username"
                />
              </div>
            </div>

            {/* Interests */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {interest}
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add an interest..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddInterest((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Posts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalBlogs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Views</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalViews || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Likes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalLikes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Followers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.followerCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('reading-list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reading-list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reading List ({readingList.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Overview</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
                    <p className="text-sm text-gray-600">
                      Member since {new Date(profile?.joinedAt || '').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Activity Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Published {stats?.totalBlogs || 0} blog posts</p>
                      <p>• Received {stats?.totalLikes || 0} total likes</p>
                      <p>• Generated {stats?.totalViews || 0} total views</p>
                      <p>• Following {stats?.followingCount || 0} users</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reading-list' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reading List</h3>
                {readingList.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved articles</h3>
                    <p className="mt-1 text-sm text-gray-500">Start exploring and save articles to read later.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {readingList.map((blog) => (
                      <BlogCard
                        key={blog.id}
                        id={blog.id}
                        slug={blog.slug}
                        title={blog.title}
                        excerpt={blog.excerpt}
                        author={blog.authorName}
                        publishedAt={blog.publishedAt || blog.createdAt}
                        tags={blog.tags}
                        likeCount={blog.likeCount}
                        shareCount={blog.shareCount}
                        viewCount={blog.viewCount}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 