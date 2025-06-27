package services

import (
	"fmt"
	"strings"
	"time"

	"ai-blog-backend/internal/models"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type BlogService struct {
	db *gorm.DB
}

func NewBlogService(db *gorm.DB) *BlogService {
	return &BlogService{db: db}
}

func (s *BlogService) GetBlogs(page, limit int, status string) ([]models.Blog, int64, error) {
	var blogs []models.Blog
	var total int64

	query := s.db.Model(&models.Blog{})

	// Only filter by status if specifically requested
	if status != "" {
		query = query.Where("status = ?", status)
	}
	// Otherwise, show ALL blogs regardless of status

	// Get total count
	query.Count(&total)

	// Get paginated results
	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&blogs).Error

	return blogs, total, err
}

func (s *BlogService) GetBlogByID(id string) (*models.Blog, error) {
	var blog models.Blog
	err := s.db.Where("id = ?", id).First(&blog).Error
	if err != nil {
		return nil, err
	}

	// Increment view count asynchronously to avoid blocking the response
	go func() {
		s.db.Model(&models.Blog{}).Where("id = ?", id).
			Update("view_count", gorm.Expr("view_count + 1"))
	}()

	return &blog, nil
}

func (s *BlogService) GetBlogBySlug(slug string) (*models.Blog, error) {
	var blog models.Blog
	err := s.db.Where("slug = ?", slug).First(&blog).Error
	if err != nil {
		return nil, err
	}

	// Increment view count asynchronously to avoid blocking the response
	go func() {
		s.db.Model(&models.Blog{}).Where("id = ?", blog.ID).
			Update("view_count", gorm.Expr("view_count + 1"))
	}()

	return &blog, nil
}

func (s *BlogService) GetUserDrafts(authorID string) ([]models.Blog, error) {
	var blogs []models.Blog
	err := s.db.Where("author_id = ? AND status IN ?", authorID, []string{"draft", "published"}).
		Order("updated_at DESC").Find(&blogs).Error
	return blogs, err
}

func (s *BlogService) CreateDraft(req models.CreateBlogRequest, authorID, authorName, authorEmail string) (*models.Blog, error) {
	slug := s.generateSlug(req.Title)

	// Ensure slug is unique
	originalSlug := slug
	counter := 1
	for {
		var existingBlog models.Blog
		err := s.db.Where("slug = ?", slug).First(&existingBlog).Error
		if err == gorm.ErrRecordNotFound {
			break
		}
		slug = fmt.Sprintf("%s-%d", originalSlug, counter)
		counter++
	}

	blog := &models.Blog{
		Title:           req.Title,
		Content:         req.Content,
		Excerpt:         s.generateExcerpt(req.Content, req.Description),
		Slug:            slug,
		AuthorID:        authorID,
		AuthorName:      authorName,
		AuthorEmail:     authorEmail,
		Status:          req.Status,
		Tags:            pq.StringArray(req.Tags),
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		FeaturedImage:   req.FeaturedImage,
	}

	if req.Status == "published" {
		now := time.Now()
		blog.PublishedAt = &now
	}

	err := s.db.Create(blog).Error
	return blog, err
}

func (s *BlogService) UpdateBlog(id string, req models.CreateBlogRequest, authorID string) (*models.Blog, error) {
	var blog models.Blog
	err := s.db.Where("id = ? AND author_id = ?", id, authorID).First(&blog).Error
	if err != nil {
		return nil, err
	}

	// Update slug if title changed
	if blog.Title != req.Title {
		blog.Slug = s.generateSlug(req.Title)
	}

	blog.Title = req.Title
	blog.Content = req.Content
	blog.Excerpt = s.generateExcerpt(req.Content, req.Description)
	blog.Tags = pq.StringArray(req.Tags)
	blog.MetaTitle = req.MetaTitle
	blog.MetaDescription = req.MetaDescription
	blog.FeaturedImage = req.FeaturedImage

	// Handle status change to published
	if blog.Status != "published" && req.Status == "published" {
		now := time.Now()
		blog.PublishedAt = &now
	}
	blog.Status = req.Status

	err = s.db.Save(&blog).Error
	return &blog, err
}

func (s *BlogService) DeleteBlog(id, authorID string) error {
	result := s.db.Where("id = ? AND author_id = ?", id, authorID).Delete(&models.Blog{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (s *BlogService) generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func (s *BlogService) generateExcerpt(content, description string) string {
	if description != "" {
		if len(description) > 200 {
			return description[:200] + "..."
		}
		return description
	}

	// Generate from content
	if len(content) > 200 {
		return content[:200] + "..."
	}
	return content
}
