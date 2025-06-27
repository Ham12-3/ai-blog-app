package services

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"

	"ai-blog-backend/internal/models"

	"gorm.io/gorm"
)

type LikeService struct {
	db *gorm.DB
}

func NewLikeService(db *gorm.DB) *LikeService {
	return &LikeService{db: db}
}

// GetUserID creates a hashed user ID from IP address for anonymous users
func (s *LikeService) GetUserID(ipAddress, clerkUserID string) string {
	if clerkUserID != "" {
		return fmt.Sprintf("clerk_%s", clerkUserID)
	}

	// Hash IP address with salt for anonymous users
	salt := os.Getenv("IP_SALT")
	if salt == "" {
		salt = "default_salt_change_in_production"
	}

	hasher := sha256.New()
	hasher.Write([]byte(ipAddress + salt))
	return hex.EncodeToString(hasher.Sum(nil))
}

// ToggleLike toggles a like for a blog post
func (s *LikeService) ToggleLike(blogID, ipAddress, clerkUserID string) (bool, error) {
	userID := s.GetUserID(ipAddress, clerkUserID)
	userType := "anonymous"
	if clerkUserID != "" {
		userType = "authenticated"
	}

	// Check if like already exists
	var existingLike models.Like
	err := s.db.Where("blog_id = ? AND user_id = ?", blogID, userID).First(&existingLike).Error

	if err == gorm.ErrRecordNotFound {
		// Create new like
		like := models.Like{
			BlogID:   blogID,
			UserID:   userID,
			UserType: userType,
		}

		err = s.db.Transaction(func(tx *gorm.DB) error {
			// Create the like
			if err := tx.Create(&like).Error; err != nil {
				return err
			}

			// Increment blog like count
			return tx.Model(&models.Blog{}).Where("id = ?", blogID).
				Update("like_count", gorm.Expr("like_count + 1")).Error
		})

		if err != nil {
			return false, err
		}
		return true, nil // Liked
	} else if err != nil {
		return false, err
	}

	// Remove existing like
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Delete the like
		if err := tx.Delete(&existingLike).Error; err != nil {
			return err
		}

		// Decrement blog like count
		return tx.Model(&models.Blog{}).Where("id = ?", blogID).
			Update("like_count", gorm.Expr("like_count - 1")).Error
	})

	if err != nil {
		return false, err
	}
	return false, nil // Unliked
}

// HasUserLiked checks if a user has liked a specific blog
func (s *LikeService) HasUserLiked(blogID, ipAddress, clerkUserID string) (bool, error) {
	userID := s.GetUserID(ipAddress, clerkUserID)

	var like models.Like
	err := s.db.Select("id").Where("blog_id = ? AND user_id = ?", blogID, userID).First(&like).Error

	if err == gorm.ErrRecordNotFound {
		return false, nil
	}
	return err == nil, err
}

// GetBlogLikeCount gets the total like count for a blog
func (s *LikeService) GetBlogLikeCount(blogID string) (int, error) {
	var blog models.Blog
	err := s.db.Select("like_count").Where("id = ?", blogID).First(&blog).Error
	return blog.LikeCount, err
}

// IncrementShareCount increments the share count for a blog
func (s *LikeService) IncrementShareCount(blogID string) error {
	return s.db.Model(&models.Blog{}).Where("id = ?", blogID).
		Update("share_count", gorm.Expr("share_count + 1")).Error
}
