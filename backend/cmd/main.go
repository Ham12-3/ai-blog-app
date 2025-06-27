package main

import (
	"log"
	"os"
	"time"

	"ai-blog-backend/internal/handlers"
	"ai-blog-backend/internal/middleware"
	"ai-blog-backend/internal/models"
	"ai-blog-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Database connection
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// Configure GORM for better cloud database support
	config := &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true, // Better compatibility with cloud DBs
		PrepareStmt:                              true, // Cache prepared statements
		QueryFields:                              true, // Select only necessary fields
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Configure connection pool for cloud databases
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}

	// Set connection pool settings (optimized for cloud databases)
	sqlDB.SetMaxIdleConns(5)                  // Reduced idle connections for cloud DB
	sqlDB.SetMaxOpenConns(25)                 // Reduced max connections for cloud DB
	sqlDB.SetConnMaxLifetime(5 * time.Minute) // 5 minutes (shorter for cloud stability)
	sqlDB.SetConnMaxIdleTime(1 * time.Minute) // Close idle connections after 1 minute

	// Ensure uuid extension exists (for uuid_generate_v4())
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

	// Auto-migrate database schema
	err = db.AutoMigrate(
		&models.Blog{},
		&models.Comment{},
		&models.Like{},
		&models.UserProfile{},
		&models.UserFollow{},
		&models.UserActivity{},
		&models.ReadingList{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Create unique indexes manually (GORM might not handle these properly)
	err = db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_blog_user ON likes (blog_id, user_id) WHERE deleted_at IS NULL").Error
	if err != nil {
		log.Printf("Warning: Could not create unique index for likes: %v", err)
	}

	err = db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_follows_unique ON user_follows (follower_id, following_id) WHERE deleted_at IS NULL").Error
	if err != nil {
		log.Printf("Warning: Could not create unique index for user_follows: %v", err)
	}

	err = db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_list_unique ON reading_lists (clerk_user_id, blog_id) WHERE deleted_at IS NULL").Error
	if err != nil {
		log.Printf("Warning: Could not create unique index for reading_lists: %v", err)
	}

	// Create performance indexes for frequently queried fields
	performanceIndexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_blogs_author_status ON blogs (author_id, status) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs (created_at DESC) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_comments_blog_status ON comments (blog_id, status) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at ASC) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_likes_blog_id ON likes (blog_id) WHERE deleted_at IS NULL",
		"CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes (user_id) WHERE deleted_at IS NULL",
	}

	for _, indexSQL := range performanceIndexes {
		err = db.Exec(indexSQL).Error
		if err != nil {
			log.Printf("Warning: Could not create performance index: %v", err)
		}
	}

	// Initialize services
	aiService := services.NewAIService(os.Getenv("OPENAI_API_KEY"))
	blogService := services.NewBlogService(db)
	commentService := services.NewCommentService(db)
	likeService := services.NewLikeService(db)
	userService := services.NewUserService(db)

	// Initialize handlers
	aiHandler := handlers.NewAIHandler(aiService)
	blogHandler := handlers.NewBlogHandler(blogService, aiService)
	commentHandler := handlers.NewCommentHandler(commentService)
	likeHandler := handlers.NewLikeHandler(likeService)
	userHandler := handlers.NewUserHandler(userService)

	// Initialize Gin router
	r := gin.Default()

	// Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://your-domain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
	}))

	// Public routes
	api := r.Group("/api")
	{
		// Blog routes (public)
		api.GET("/blogs", blogHandler.GetBlogs)
		api.GET("/blogs/:id", blogHandler.GetBlog)
		api.GET("/blogs/slug/:slug", blogHandler.GetBlogBySlug)
		api.GET("/blogs/:id/comments", commentHandler.GetComments)
		api.POST("/blogs/:id/comments", commentHandler.AddComment)

		// Like routes (public)
		api.GET("/blogs/:id/like-status", likeHandler.GetLikeStatus)
		api.POST("/blogs/:id/like", likeHandler.ToggleLike)
		api.POST("/blogs/:id/share", likeHandler.IncrementShare)

		// Debug endpoint (temporarily public)
		api.GET("/users/debug", userHandler.GetCurrentUser)

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.ClerkAuth(os.Getenv("CLERK_SECRET_KEY")))
		{
			// Blog management
			protected.GET("/blogs/drafts", blogHandler.GetUserDrafts)
			protected.POST("/blogs/draft", blogHandler.CreateDraft)
			protected.POST("/blogs/publish", blogHandler.PublishBlog)
			protected.PUT("/blogs/:id", blogHandler.UpdateBlog)
			protected.DELETE("/blogs/:id", blogHandler.DeleteBlog)

			// AI content generation
			protected.POST("/ai/generate-content", aiHandler.GenerateContent)
			protected.POST("/ai/generate-meta", aiHandler.GenerateMeta)

			// Comment moderation
			protected.GET("/comments/pending", commentHandler.GetPendingComments)
			protected.PUT("/comments/:id/approve", commentHandler.ApproveComment)
			protected.PUT("/comments/:id/reject", commentHandler.RejectComment)

			// User profile and features
			protected.GET("/users/me", userHandler.GetCurrentUser) // Debug endpoint
			protected.GET("/users/profile", userHandler.GetProfile)
			protected.PUT("/users/profile", userHandler.UpdateProfile)
			protected.GET("/users/stats", userHandler.GetUserStats)
			protected.POST("/users/:id/follow", userHandler.FollowUser)
			protected.DELETE("/users/:id/follow", userHandler.UnfollowUser)
			protected.GET("/users/:id/follow-status", userHandler.CheckFollowStatus)
			protected.POST("/users/reading-list/:blogId", userHandler.AddToReadingList)
			protected.DELETE("/users/reading-list/:blogId", userHandler.RemoveFromReadingList)
			protected.GET("/users/reading-list", userHandler.GetReadingList)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}
