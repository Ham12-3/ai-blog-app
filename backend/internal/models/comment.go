package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Content     string    `json:"content" gorm:"not null"`
	AuthorName  string    `json:"authorName" gorm:"not null"`
	AuthorEmail string    `json:"authorEmail" gorm:"not null"`
	BlogID      string    `json:"blogId" gorm:"not null"`
	Status      string    `json:"status" gorm:"default:'pending'"` // pending, approved, rejected
	ParentID    *string   `json:"parentId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Blog     Blog       `json:"blog" gorm:"foreignKey:BlogID"`
	Parent   *Comment   `json:"parent" gorm:"foreignKey:ParentID"`
	Replies  []Comment  `json:"replies" gorm:"foreignKey:ParentID"`
}

func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type CreateCommentRequest struct {
	Content     string `json:"content" binding:"required"`
	AuthorName  string `json:"authorName" binding:"required"`
	AuthorEmail string `json:"authorEmail" binding:"required,email"`
	ParentID    string `json:"parentId"`
} 