package handlers

import (
	"net/http"
	"strconv"

	"ai-blog-backend/internal/models"
	"ai-blog-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct {
	blogService *services.BlogService
	aiService   *services.AIService
}

func NewBlogHandler(blogService *services.BlogService, aiService *services.AIService) *BlogHandler {
	return &BlogHandler{
		blogService: blogService,
		aiService:   aiService,
	}
}

func (h *BlogHandler) GetBlogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	blogs, total, err := h.blogService.GetBlogs(page, limit, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"blogs": blogs,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

func (h *BlogHandler) GetBlog(c *gin.Context) {
	id := c.Param("id")

	blog, err := h.blogService.GetBlogByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

func (h *BlogHandler) GetBlogBySlug(c *gin.Context) {
	slug := c.Param("slug")

	blog, err := h.blogService.GetBlogBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

func (h *BlogHandler) GetUserDrafts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	blogs, err := h.blogService.GetUserDrafts(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"blogs": blogs})
}

func (h *BlogHandler) CreateDraft(c *gin.Context) {
	var req models.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Safely get user context values
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userName, exists := c.Get("userName")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User name not found in context"})
		return
	}

	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	// Type assert safely
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	userNameStr, ok := userName.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user name format"})
		return
	}

	userEmailStr, ok := userEmail.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user email format"})
		return
	}

	blog, err := h.blogService.CreateDraft(req, userIDStr, userNameStr, userEmailStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, blog)
}

func (h *BlogHandler) PublishBlog(c *gin.Context) {
	var req models.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Force status to published
	req.Status = "published"

	// Safely get user context values
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userName, exists := c.Get("userName")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User name not found in context"})
		return
	}

	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	// Type assert safely
	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	userNameStr, ok := userName.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user name format"})
		return
	}

	userEmailStr, ok := userEmail.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user email format"})
		return
	}

	blog, err := h.blogService.CreateDraft(req, userIDStr, userNameStr, userEmailStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, blog)
}

func (h *BlogHandler) UpdateBlog(c *gin.Context) {
	id := c.Param("id")

	var req models.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	blog, err := h.blogService.UpdateBlog(id, req, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blog)
}

func (h *BlogHandler) DeleteBlog(c *gin.Context) {
	id := c.Param("id")

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	err := h.blogService.DeleteBlog(id, userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}
