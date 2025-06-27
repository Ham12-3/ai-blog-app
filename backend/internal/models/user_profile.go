package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type UserProfile struct {
	ID              string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ClerkUserID     string         `json:"clerkUserId" gorm:"uniqueIndex;not null"` // Links to Clerk user
	Bio             string         `json:"bio" gorm:"type:text"`
	Website         string         `json:"website"`
	Location        string         `json:"location"`
	TwitterHandle   string         `json:"twitterHandle"`
	LinkedInProfile string         `json:"linkedInProfile"`
	Interests       pq.StringArray `json:"interests" gorm:"type:text[]"`
	BlogCount       int            `json:"blogCount" gorm:"default:0"`
	TotalLikes      int            `json:"totalLikes" gorm:"default:0"` // Total likes received on their blogs
	TotalViews      int            `json:"totalViews" gorm:"default:0"` // Total views on their blogs
	FollowerCount   int            `json:"followerCount" gorm:"default:0"`
	FollowingCount  int            `json:"followingCount" gorm:"default:0"`
	IsVerified      bool           `json:"isVerified" gorm:"default:false"`
	JoinedAt        time.Time      `json:"joinedAt"`
	LastActiveAt    *time.Time     `json:"lastActiveAt"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *UserProfile) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	if u.JoinedAt.IsZero() {
		u.JoinedAt = time.Now()
	}
	return nil
}

// UserFollow represents the follow relationship between users
type UserFollow struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	FollowerID  string         `json:"followerId" gorm:"not null;index"`  // ClerkUserID of the follower
	FollowingID string         `json:"followingId" gorm:"not null;index"` // ClerkUserID of the user being followed
	CreatedAt   time.Time      `json:"createdAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

func (f *UserFollow) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.New().String()
	}
	return nil
}

// Create unique constraint to prevent duplicate follows
func (UserFollow) TableName() string {
	return "user_follows"
}

// UserActivity tracks user actions for analytics
type UserActivity struct {
	ID           string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ClerkUserID  string         `json:"clerkUserId" gorm:"not null;index"`
	ActivityType string         `json:"activityType" gorm:"not null"` // blog_created, blog_liked, comment_posted, etc.
	EntityType   string         `json:"entityType"`                   // blog, comment, user
	EntityID     string         `json:"entityId"`
	Metadata     string         `json:"metadata" gorm:"type:jsonb"` // Additional data as JSON
	CreatedAt    time.Time      `json:"createdAt"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (a *UserActivity) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	return nil
}

// Reading list for users to save blogs
type ReadingList struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ClerkUserID string         `json:"clerkUserId" gorm:"not null;index"`
	BlogID      string         `json:"blogId" gorm:"not null;index"`
	CreatedAt   time.Time      `json:"createdAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Foreign key relationship
	Blog Blog `json:"blog,omitempty" gorm:"foreignKey:BlogID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (r *ReadingList) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

// Unique constraint on ClerkUserID + BlogID
func (ReadingList) TableName() string {
	return "reading_lists"
}
