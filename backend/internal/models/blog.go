package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Blog struct {
	ID              string         `json:"id" gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	Title           string         `json:"title" gorm:"not null"`
	Content         string         `json:"content" gorm:"type:text"`
	Excerpt         string         `json:"excerpt"`
	Slug            string         `json:"slug" gorm:"uniqueIndex;not null"`
	AuthorID        string         `json:"authorId" gorm:"not null"`
	AuthorName      string         `json:"authorName"`
	AuthorEmail     string         `json:"authorEmail"`
	Status          string         `json:"status" gorm:"default:'draft'"` // draft, published, archived
	Tags            pq.StringArray `json:"tags" gorm:"type:text[]"`
	MetaTitle       string         `json:"metaTitle"`
	MetaDescription string         `json:"metaDescription"`
	FeaturedImage   string         `json:"featuredImage"`
	ViewCount       int            `json:"viewCount" gorm:"default:0"`
	LikeCount       int            `json:"likeCount" gorm:"default:0"`
	ShareCount      int            `json:"shareCount" gorm:"default:0"`
	PublishedAt     *time.Time     `json:"publishedAt"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

func (b *Blog) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}

type CreateBlogRequest struct {
	Title           string   `json:"title" binding:"required"`
	Content         string   `json:"content" binding:"required"`
	Description     string   `json:"description"`
	Tags            []string `json:"tags"`
	Status          string   `json:"status" binding:"required,oneof=draft published"`
	MetaTitle       string   `json:"metaTitle"`
	MetaDescription string   `json:"metaDescription"`
	FeaturedImage   string   `json:"featuredImage"`
}
