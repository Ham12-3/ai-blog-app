import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { PlusIcon, Cog6ToothIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-colored group-hover:scale-105 transition-transform duration-200">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">AI Blog Platform</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Powered by AI</p>
              </div>
            </Link>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            <SignedIn>
              {/* Create Post Button */}
              <Link
                href="/create"
                className="btn-primary group"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                <span className="hidden sm:inline">Create Post</span>
                <span className="sm:hidden">Create</span>
              </Link>

              {/* Navigation Pills */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 group"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Admin
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 group"
                >
                  <UserIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Profile
                </Link>
              </div>

              {/* Mobile Navigation Menu */}
              <div className="md:hidden flex items-center space-x-1">
                <Link
                  href="/admin"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  title="Admin Panel"
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                </Link>
                
                <Link
                  href="/profile"
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                  title="Profile"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
              </div>

              {/* User Button with Custom Styling */}
              <div className="relative">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-blue-100 hover:ring-blue-200 transition-all duration-200",
                      userButtonPopoverCard: "shadow-xl border-0 bg-white/95 backdrop-blur-xl",
                      userButtonPopoverActions: "bg-gray-50/50"
                    }
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary group">
                  <svg className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
} 