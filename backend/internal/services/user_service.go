package services

import (
	"encoding/json"
	"time"

	"ai-blog-backend/internal/models"

	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

type CreateUserProfileRequest struct {
	ClerkUserID     string   `json:"clerkUserId" binding:"required"`
	Bio             string   `json:"bio"`
	Website         string   `json:"website"`
	Location        string   `json:"location"`
	TwitterHandle   string   `json:"twitterHandle"`
	LinkedInProfile string   `json:"linkedInProfile"`
	Interests       []string `json:"interests"`
}

type UpdateUserProfileRequest struct {
	Bio             string   `json:"bio"`
	Website         string   `json:"website"`
	Location        string   `json:"location"`
	TwitterHandle   string   `json:"twitterHandle"`
	LinkedInProfile string   `json:"linkedInProfile"`
	Interests       []string `json:"interests"`
}

// GetOrCreateUserProfile gets existing profile or creates one
func (s *UserService) GetOrCreateUserProfile(clerkUserID string) (*models.UserProfile, error) {
	var profile models.UserProfile
	err := s.db.Where("clerk_user_id = ?", clerkUserID).First(&profile).Error

	if err == gorm.ErrRecordNotFound {
		// Create new profile
		profile = models.UserProfile{
			ClerkUserID: clerkUserID,
			JoinedAt:    time.Now(),
		}
		err = s.db.Create(&profile).Error
		return &profile, err
	}

	return &profile, err
}

// UpdateUserProfile updates user profile
func (s *UserService) UpdateUserProfile(clerkUserID string, req UpdateUserProfileRequest) (*models.UserProfile, error) {
	var profile models.UserProfile
	err := s.db.Where("clerk_user_id = ?", clerkUserID).First(&profile).Error
	if err != nil {
		return nil, err
	}

	// Update fields
	profile.Bio = req.Bio
	profile.Website = req.Website
	profile.Location = req.Location
	profile.TwitterHandle = req.TwitterHandle
	profile.LinkedInProfile = req.LinkedInProfile
	profile.Interests = req.Interests

	err = s.db.Save(&profile).Error
	return &profile, err
}

// UpdateLastActivity updates user's last active timestamp
func (s *UserService) UpdateLastActivity(clerkUserID string) error {
	now := time.Now()
	return s.db.Model(&models.UserProfile{}).
		Where("clerk_user_id = ?", clerkUserID).
		Update("last_active_at", now).Error
}

// FollowUser creates a follow relationship
func (s *UserService) FollowUser(followerID, followingID string) error {
	if followerID == followingID {
		return gorm.ErrInvalidValue // Can't follow yourself
	}

	// Check if already following
	var existing models.UserFollow
	err := s.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).First(&existing).Error
	if err == nil {
		return nil // Already following
	}

	// Create follow relationship
	follow := models.UserFollow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Create the follow
		if err := tx.Create(&follow).Error; err != nil {
			return err
		}

		// Update follower count
		if err := tx.Model(&models.UserProfile{}).
			Where("clerk_user_id = ?", followingID).
			Update("follower_count", gorm.Expr("follower_count + 1")).Error; err != nil {
			return err
		}

		// Update following count
		return tx.Model(&models.UserProfile{}).
			Where("clerk_user_id = ?", followerID).
			Update("following_count", gorm.Expr("following_count + 1")).Error
	})
}

// UnfollowUser removes follow relationship
func (s *UserService) UnfollowUser(followerID, followingID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Delete the follow
		result := tx.Where("follower_id = ? AND following_id = ?", followerID, followingID).
			Delete(&models.UserFollow{})

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 0 {
			return nil // Wasn't following anyway
		}

		// Update follower count
		if err := tx.Model(&models.UserProfile{}).
			Where("clerk_user_id = ?", followingID).
			Update("follower_count", gorm.Expr("follower_count - 1")).Error; err != nil {
			return err
		}

		// Update following count
		return tx.Model(&models.UserProfile{}).
			Where("clerk_user_id = ?", followerID).
			Update("following_count", gorm.Expr("following_count - 1")).Error
	})
}

// IsFollowing checks if user is following another user
func (s *UserService) IsFollowing(followerID, followingID string) (bool, error) {
	var count int64
	err := s.db.Model(&models.UserFollow{}).
		Where("follower_id = ? AND following_id = ?", followerID, followingID).
		Count(&count).Error
	return count > 0, err
}

// AddToReadingList adds a blog to user's reading list
func (s *UserService) AddToReadingList(clerkUserID, blogID string) error {
	// Check if already in reading list
	var existing models.ReadingList
	err := s.db.Where("clerk_user_id = ? AND blog_id = ?", clerkUserID, blogID).First(&existing).Error
	if err == nil {
		return nil // Already in reading list
	}

	readingItem := models.ReadingList{
		ClerkUserID: clerkUserID,
		BlogID:      blogID,
	}

	return s.db.Create(&readingItem).Error
}

// RemoveFromReadingList removes blog from reading list
func (s *UserService) RemoveFromReadingList(clerkUserID, blogID string) error {
	return s.db.Where("clerk_user_id = ? AND blog_id = ?", clerkUserID, blogID).
		Delete(&models.ReadingList{}).Error
}

// GetReadingList gets user's reading list
func (s *UserService) GetReadingList(clerkUserID string) ([]models.Blog, error) {
	var blogs []models.Blog
	err := s.db.Table("blogs").
		Joins("JOIN reading_lists ON blogs.id = reading_lists.blog_id").
		Where("reading_lists.clerk_user_id = ? AND reading_lists.deleted_at IS NULL", clerkUserID).
		Where("blogs.status = ?", "published").
		Order("reading_lists.created_at DESC").
		Find(&blogs).Error

	return blogs, err
}

// LogActivity logs user activity for analytics
func (s *UserService) LogActivity(clerkUserID, activityType, entityType, entityID string, metadata map[string]interface{}) error {
	var metadataJSON string
	if metadata != nil {
		data, _ := json.Marshal(metadata)
		metadataJSON = string(data)
	}

	activity := models.UserActivity{
		ClerkUserID:  clerkUserID,
		ActivityType: activityType,
		EntityType:   entityType,
		EntityID:     entityID,
		Metadata:     metadataJSON,
	}

	return s.db.Create(&activity).Error
}

// GetUserStats gets comprehensive user statistics
func (s *UserService) GetUserStats(clerkUserID string) (map[string]interface{}, error) {
	profile, err := s.GetOrCreateUserProfile(clerkUserID)
	if err != nil {
		return nil, err
	}

	// Get blog stats
	var blogStats struct {
		TotalBlogs int
		TotalViews int
		TotalLikes int
	}

	err = s.db.Model(&models.Blog{}).
		Select("COUNT(*) as total_blogs, COALESCE(SUM(view_count), 0) as total_views, COALESCE(SUM(like_count), 0) as total_likes").
		Where("author_id = ?", clerkUserID).
		Scan(&blogStats).Error

	if err != nil {
		return nil, err
	}

	// Update profile with latest stats
	s.db.Model(profile).Updates(map[string]interface{}{
		"blog_count":  blogStats.TotalBlogs,
		"total_views": blogStats.TotalViews,
		"total_likes": blogStats.TotalLikes,
	})

	return map[string]interface{}{
		"profile":        profile,
		"totalBlogs":     blogStats.TotalBlogs,
		"totalViews":     blogStats.TotalViews,
		"totalLikes":     blogStats.TotalLikes,
		"followerCount":  profile.FollowerCount,
		"followingCount": profile.FollowingCount,
	}, nil
}
