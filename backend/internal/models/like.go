package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Like struct {
	ID        string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	BlogID    string         `json:"blogId" gorm:"not null;index"`
	UserID    string         `json:"userId" gorm:"not null;index"`        // Hashed IP or Clerk user ID
	UserType  string         `json:"userType" gorm:"default:'anonymous'"` // anonymous, authenticated
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Foreign key relationship
	Blog Blog `json:"-" gorm:"foreignKey:BlogID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func (l *Like) BeforeCreate(tx *gorm.DB) error {
	if l.ID == "" {
		l.ID = uuid.New().String()
	}
	return nil
}

// Unique constraint on BlogID + UserID to prevent duplicate likes
func (Like) TableName() string {
	return "likes"
}

// Create unique index on blog_id and user_id combination
type LikeIndex struct {
	BlogID string `gorm:"uniqueIndex:idx_blog_user"`
	UserID string `gorm:"uniqueIndex:idx_blog_user"`
}
