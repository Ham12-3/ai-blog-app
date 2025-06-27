package services

import (
	"fmt"

	"ai-blog-backend/internal/models"

	"gorm.io/gorm"
)

type CommentService struct {
	db *gorm.DB
}

func NewCommentService(db *gorm.DB) *CommentService {
	return &CommentService{db: db}
}

type CreateCommentRequest struct {
	BlogID      string `json:"blogId"` // Removed required tag since it's set from URL
	AuthorName  string `json:"authorName" binding:"required"`
	AuthorEmail string `json:"authorEmail" binding:"required,email"`
	Content     string `json:"content" binding:"required"`
	ParentID    string `json:"parentId,omitempty"`
}

func (s *CommentService) GetComments(blogID string) ([]models.Comment, error) {
	var comments []models.Comment
	err := s.db.Where("blog_id = ? AND status = ?", blogID, "approved").
		Order("created_at ASC").Find(&comments).Error
	return comments, err
}

func (s *CommentService) AddComment(req CreateCommentRequest) (*models.Comment, error) {
	// Validate that the blog exists (removed status requirement)
	var count int64
	err := s.db.Model(&models.Blog{}).
		Where("id = ?", req.BlogID).
		Count(&count).Error
	if err != nil {
		return nil, fmt.Errorf("error validating blog: %v", err)
	}
	if count == 0 {
		return nil, fmt.Errorf("blog not found")
	}

	var parentID *string
	if req.ParentID != "" {
		// Validate parent comment exists
		var parentCount int64
		err = s.db.Model(&models.Comment{}).
			Where("id = ? AND blog_id = ?", req.ParentID, req.BlogID).
			Count(&parentCount).Error
		if err != nil {
			return nil, fmt.Errorf("error validating parent comment: %v", err)
		}
		if parentCount == 0 {
			return nil, fmt.Errorf("parent comment not found")
		}
		parentID = &req.ParentID
	}

	comment := &models.Comment{
		BlogID:      req.BlogID,
		AuthorName:  req.AuthorName,
		AuthorEmail: req.AuthorEmail,
		Content:     req.Content,
		ParentID:    parentID,
		Status:      "pending", // All comments start as pending
	}

	err = s.db.Create(comment).Error
	if err != nil {
		return nil, fmt.Errorf("error creating comment: %v", err)
	}

	return comment, nil
}

func (s *CommentService) GetPendingComments() ([]models.Comment, error) {
	var comments []models.Comment

	// First get comments
	err := s.db.Where("status = ?", "pending").
		Order("created_at DESC").Find(&comments).Error

	if err != nil {
		return comments, err
	}

	// Manually load blog data for each comment
	for i := range comments {
		var blog models.Blog
		blogErr := s.db.Where("id = ?", comments[i].BlogID).First(&blog).Error
		if blogErr == nil {
			comments[i].Blog = blog
		} else {
			// Log the error for debugging
			fmt.Printf("Failed to load blog %s: %v\n", comments[i].BlogID, blogErr)
		}
	}

	return comments, nil
}

func (s *CommentService) ApproveComment(commentID string) error {
	return s.db.Model(&models.Comment{}).
		Where("id = ?", commentID).
		Update("status", "approved").Error
}

func (s *CommentService) RejectComment(commentID string) error {
	return s.db.Model(&models.Comment{}).
		Where("id = ?", commentID).
		Update("status", "rejected").Error
}

func (s *CommentService) DeleteComment(commentID string) error {
	return s.db.Delete(&models.Comment{}, "id = ?", commentID).Error
}
