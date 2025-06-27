package handlers

import (
	"net/http"

	"ai-blog-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// Helper function to get clerk user ID from context
func (h *UserHandler) getClerkUserID(c *gin.Context) (string, bool) {
	clerkUserID, exists := c.Get("userID")
	if !exists {
		return "", false
	}

	clerkUserIDStr, ok := clerkUserID.(string)
	if !ok {
		return "", false
	}

	return clerkUserIDStr, true
}

// GetCurrentUser handles GET /api/users/me - returns current user info for debugging
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	// Get all user context from middleware
	userCtx, exists := c.Get("user")
	if !exists {
		// For debugging - show what headers we have
		c.JSON(http.StatusOK, gin.H{
			"error":         "User not authenticated",
			"message":       "No user context found",
			"authHeader":    c.GetHeader("Authorization"),
			"hasAuthHeader": c.GetHeader("Authorization") != "",
			"userAgent":     c.GetHeader("User-Agent"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":      userCtx,
		"message":   "Current user context",
		"clerkUser": userCtx,
	})
}

// GetProfile handles GET /api/users/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	// Get Clerk user ID from middleware
	clerkUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	clerkUserIDStr, ok := clerkUserID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	profile, err := h.userService.GetOrCreateUserProfile(clerkUserIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get profile"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfile handles PUT /api/users/profile
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	clerkUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	clerkUserIDStr, ok := clerkUserID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	var req services.UpdateUserProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profile, err := h.userService.UpdateUserProfile(clerkUserIDStr, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetUserStats handles GET /api/users/stats
func (h *UserHandler) GetUserStats(c *gin.Context) {
	clerkUserID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	clerkUserIDStr, ok := clerkUserID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	stats, err := h.userService.GetUserStats(clerkUserIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// FollowUser handles POST /api/users/:id/follow
func (h *UserHandler) FollowUser(c *gin.Context) {
	followingID := c.Param("id") // User to follow

	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err := h.userService.FollowUser(clerkUserID, followingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User followed successfully"})
}

// UnfollowUser handles DELETE /api/users/:id/follow
func (h *UserHandler) UnfollowUser(c *gin.Context) {
	followingID := c.Param("id") // User to unfollow

	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err := h.userService.UnfollowUser(clerkUserID, followingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User unfollowed successfully"})
}

// CheckFollowStatus handles GET /api/users/:id/follow-status
func (h *UserHandler) CheckFollowStatus(c *gin.Context) {
	followingID := c.Param("id")

	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	isFollowing, err := h.userService.IsFollowing(clerkUserID, followingID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check follow status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isFollowing": isFollowing})
}

// AddToReadingList handles POST /api/users/reading-list/:blogId
func (h *UserHandler) AddToReadingList(c *gin.Context) {
	blogID := c.Param("blogId")

	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err := h.userService.AddToReadingList(clerkUserID, blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to reading list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Added to reading list"})
}

// RemoveFromReadingList handles DELETE /api/users/reading-list/:blogId
func (h *UserHandler) RemoveFromReadingList(c *gin.Context) {
	blogID := c.Param("blogId")

	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err := h.userService.RemoveFromReadingList(clerkUserID, blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from reading list"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from reading list"})
}

// GetReadingList handles GET /api/users/reading-list
func (h *UserHandler) GetReadingList(c *gin.Context) {
	clerkUserID, ok := h.getClerkUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	blogs, err := h.userService.GetReadingList(clerkUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reading list"})
		return
	}

	c.JSON(http.StatusOK, blogs)
}
