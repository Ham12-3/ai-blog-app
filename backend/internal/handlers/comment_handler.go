package handlers

import (
	"net/http"

	"ai-blog-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	commentService *services.CommentService
}

func NewCommentHandler(commentService *services.CommentService) *CommentHandler {
	return &CommentHandler{commentService: commentService}
}

func (h *CommentHandler) GetComments(c *gin.Context) {
	blogID := c.Param("id")

	comments, err := h.commentService.GetComments(blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments})
}

func (h *CommentHandler) AddComment(c *gin.Context) {
	// Get blog ID from URL parameter first
	blogID := c.Param("id")
	if blogID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Blog ID is required"})
		return
	}

	var req services.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set the blog ID from the URL parameter
	req.BlogID = blogID

	comment, err := h.commentService.AddComment(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"comment": comment,
		"message": "Comment submitted for approval",
	})
}

func (h *CommentHandler) GetPendingComments(c *gin.Context) {
	comments, err := h.commentService.GetPendingComments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) ApproveComment(c *gin.Context) {
	commentID := c.Param("id")

	err := h.commentService.ApproveComment(commentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment approved successfully"})
}

func (h *CommentHandler) RejectComment(c *gin.Context) {
	commentID := c.Param("id")

	err := h.commentService.RejectComment(commentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Comment rejected successfully"})
}
