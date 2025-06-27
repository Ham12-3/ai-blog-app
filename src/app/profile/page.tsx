'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogCard from '@/components/BlogCard'
import type { Blog } from '@/types/blog'
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon, 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BookmarkIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

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

      console.log('Fetching user data with token:', token ? 'Present' : 'Missing')
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...')
      }

      const [profileRes, statsRes, readingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/stats`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reading-list`, { headers })
      ])

      console.log('Profile response status:', profileRes.status)
      console.log('Stats response status:', statsRes.status)

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        console.log('Profile data:', profileData)
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
        console.log('Stats data:', statsData)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="card p-8">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="space-y-3">
                  <div className="h-8 bg-gray-300 rounded w-48"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-64"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-12 bg-gray-300 rounded mb-3"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const joinedDate = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }) : 'Recently'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="card p-8 mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || 'User'}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                />
                {profile?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <h1 className="heading-2">{user?.fullName || 'Anonymous User'}</h1>
                  {profile?.isVerified && (
                    <span className="badge-primary">
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {profile?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Joined {joinedDate}</span>
                  </div>
                  {profile?.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                    >
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="body-medium max-w-2xl">{profile.bio}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-secondary"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Form */}
          {editing && (
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="input resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="input"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="input"
                    placeholder="https://your-website.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter Handle</label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    className="input"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBlogs || 0}</p>
                <p className="text-sm text-gray-600">Blog Posts</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalViews?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLikes?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6 hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.followerCount || 0}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-2 shadow-soft">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
                { id: 'reading-list', name: 'Reading List', icon: BookmarkIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="card p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                <div className="text-center py-12">
                  <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600 mb-6">Start creating content to see your activity here</p>
                  <a href="/create" className="btn-primary">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reading-list' && (
            <div>
              {readingList.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {readingList.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      id={blog.id}
                      slug={blog.slug}
                      title={blog.title}
                      excerpt={blog.excerpt || blog.content?.substring(0, 200) + '...' || ''}
                      author={blog.authorName || 'Unknown'}
                      publishedAt={blog.publishedAt || blog.createdAt}
                      tags={blog.tags || []}
                      likeCount={blog.likeCount || 0}
                      shareCount={blog.shareCount || 0}
                      viewCount={blog.viewCount || 0}
                      featuredImage={blog.featuredImage}
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-8">
                  <div className="text-center py-12">
                    <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your reading list is empty</h3>
                    <p className="text-gray-600 mb-6">Save interesting articles to read later</p>
                    <a href="/" className="btn-secondary">
                      Browse Articles
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 