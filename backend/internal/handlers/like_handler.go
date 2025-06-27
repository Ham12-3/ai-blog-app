package handlers

import (
	"net/http"

	"ai-blog-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type LikeHandler struct {
	likeService *services.LikeService
}

func NewLikeHandler(likeService *services.LikeService) *LikeHandler {
	return &LikeHandler{likeService: likeService}
}

// ToggleLike handles POST /api/blogs/:id/like
func (h *LikeHandler) ToggleLike(c *gin.Context) {
	blogID := c.Param("id")
	if blogID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blog ID is required"})
		return
	}

	// Get IP address
	ipAddress := c.ClientIP()
	if forwardedIP := c.GetHeader("X-Forwarded-For"); forwardedIP != "" {
		ipAddress = forwardedIP
	}

	// Get Clerk user ID if authenticated
	clerkUserID := ""
	if userCtx, exists := c.Get("user"); exists {
		if userMap, ok := userCtx.(map[string]interface{}); ok {
			if userID, ok := userMap["user_id"].(string); ok {
				clerkUserID = userID
			}
		}
	}

	liked, err := h.likeService.ToggleLike(blogID, ipAddress, clerkUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to toggle like"})
		return
	}

	// Get updated like count
	likeCount, err := h.likeService.GetBlogLikeCount(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get like count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"liked":     liked,
		"likeCount": likeCount,
	})
}

// GetLikeStatus handles GET /api/blogs/:id/like-status
func (h *LikeHandler) GetLikeStatus(c *gin.Context) {
	blogID := c.Param("id")
	if blogID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blog ID is required"})
		return
	}

	// Get IP address
	ipAddress := c.ClientIP()
	if forwardedIP := c.GetHeader("X-Forwarded-For"); forwardedIP != "" {
		ipAddress = forwardedIP
	}

	// Get Clerk user ID if authenticated
	clerkUserID := ""
	if userCtx, exists := c.Get("user"); exists {
		if userMap, ok := userCtx.(map[string]interface{}); ok {
			if userID, ok := userMap["user_id"].(string); ok {
				clerkUserID = userID
			}
		}
	}

	hasLiked, err := h.likeService.HasUserLiked(blogID, ipAddress, clerkUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get like status"})
		return
	}

	likeCount, err := h.likeService.GetBlogLikeCount(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get like count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"liked":     hasLiked,
		"likeCount": likeCount,
	})
}

// IncrementShare handles POST /api/blogs/:id/share
func (h *LikeHandler) IncrementShare(c *gin.Context) {
	blogID := c.Param("id")
	if blogID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blog ID is required"})
		return
	}

	err := h.likeService.IncrementShareCount(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to increment share count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Share count incremented"})
}
