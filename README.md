# AI Blog Platform

A modern, AI-powered blogging platform built with Next.js, Go, and OpenAI. Features include AI content generation, user authentication with Clerk, comment moderation, and a beautiful responsive design.

## Features

✨ **AI-Powered Content Generation**
- Generate blog posts with OpenAI GPT
- AI-generated meta titles and descriptions
- Smart tag suggestions
- Multiple writing tones and lengths

🔐 **Secure Authentication**
- User authentication with Clerk
- Protected routes for blog management
- Author-based content ownership

📝 **Rich Blog Management**
- Create, edit, and publish blog posts
- Draft mode with preview functionality
- Markdown support with syntax highlighting
- SEO-optimized URLs and meta information

💬 **Comment System**
- Public commenting with moderation
- Reply to comments (nested structure)
- Admin approval workflow
- Email validation for commenters

🎨 **Modern UI/UX**
- Responsive design with Tailwind CSS
- Beautiful blog cards and layouts
- Real-time preview while writing
- Toast notifications for user feedback

📊 **Analytics & Engagement**
- View counts for blog posts
- Like and share tracking
- Tag-based categorization

## Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Clerk** - Authentication
- **React Hook Form** - Form management
- **React Markdown** - Markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting

### Backend
- **Go** - Server language
- **Gin** - HTTP framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Database
- **OpenAI API** - AI content generation
- **Clerk SDK** - Authentication verification

## Project Structure

```
ai-blog-app/
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # Reusable UI components
│   │   ├── lib/                 # Utility functions
│   │   └── types/               # TypeScript definitions
├── backend/
│   ├── cmd/                     # Application entrypoints
│   ├── internal/
│   │   ├── handlers/            # HTTP handlers
│   │   ├── middleware/          # Custom middleware
│   │   ├── models/              # Database models
│   │   └── services/            # Business logic
│   └── config/                  # Configuration files
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL database
- OpenAI API key
- Clerk account and API keys

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd ai-blog-app
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# For production, add your domain
# NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### 3. Backend Setup

```bash
cd backend

# Initialize Go modules (if needed)
go mod init ai-blog-backend
go mod tidy

# Create environment file
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_blog_db

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Clerk
CLERK_SECRET_KEY=sk_test_your_clerk_secret_here

# Server
PORT=8080
```

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ai_blog_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

The Go application will automatically run migrations on startup.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
go run cmd/main.go
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## API Endpoints

### Public Routes
- `GET /api/blogs` - Get published blogs (paginated)
- `GET /api/blogs/:id` - Get single blog
- `GET /api/blogs/:id/comments` - Get blog comments
- `POST /api/blogs/:id/comments` - Add comment

### Protected Routes (Require Authentication)
- `GET /api/blogs/drafts` - Get user's drafts
- `POST /api/blogs/draft` - Create draft
- `POST /api/blogs/publish` - Publish blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/ai/generate-content` - Generate AI content
- `POST /api/ai/generate-meta` - Generate meta information
- `GET /api/comments/pending` - Get pending comments (admin)
- `PUT /api/comments/:id/approve` - Approve comment
- `PUT /api/comments/:id/reject` - Reject comment

## Key Features Explained

### AI Content Generation

The platform integrates with OpenAI's GPT models to help users create content:

1. **Content Generation**: Users provide a title and description, and AI generates full blog post content
2. **Meta Generation**: AI creates SEO-optimized titles, descriptions, and tags
3. **Customizable Tone**: Professional, casual, technical, or friendly writing styles
4. **Variable Length**: Short (500-800 words), medium (800-1500 words), or long (1500-2500 words)

### Authentication Flow

1. Users sign up/sign in through Clerk
2. Frontend receives JWT tokens
3. Backend validates tokens using Clerk SDK
4. User context is available throughout the application

### Comment Moderation

1. Public users can leave comments (with name and email)
2. Comments start in "pending" status
3. Blog authors can approve/reject comments via admin panel
4. Approved comments appear publicly
5. Supports nested replies

### Blog Management

1. **Draft Mode**: Save work in progress
2. **Preview**: See how the blog will look before publishing
3. **SEO Optimization**: Auto-generated slugs, meta tags
4. **Rich Content**: Markdown support with syntax highlighting

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Railway/Heroku/DigitalOcean)

1. Create a production database
2. Set environment variables
3. Deploy the Go binary

### Environment Variables for Production

Update your environment variables for production:

```env
# Frontend
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api

# Backend
DATABASE_URL=your_production_database_url
CLERK_SECRET_KEY=your_production_clerk_secret
OPENAI_API_KEY=your_openai_key
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help setting up the project, please create an issue in the GitHub repository.

---

**Built with ❤️ using Next.js, Go, and OpenAI**