package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/sashabaranov/go-openai"
)

type AIService struct {
	client *openai.Client
}

func NewAIService(apiKey string) *AIService {
	client := openai.NewClient(apiKey)
	return &AIService{client: client}
}

type GenerateContentRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	Tone        string `json:"tone"` // professional, casual, technical, friendly
	Length      string `json:"length"` // short, medium, long
}

type GenerateContentResponse struct {
	Content string   `json:"content"`
	Tags    []string `json:"tags"`
}

type GenerateMetaRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
}

type GenerateMetaResponse struct {
	MetaTitle       string   `json:"metaTitle"`
	MetaDescription string   `json:"metaDescription"`
	Tags            []string `json:"tags"`
}

func (s *AIService) GenerateContent(req GenerateContentRequest) (*GenerateContentResponse, error) {
	tone := req.Tone
	if tone == "" {
		tone = "professional"
	}
	
	length := req.Length
	if length == "" {
		length = "medium"
	}

	var wordCount string
	switch length {
	case "short":
		wordCount = "500-800 words"
	case "medium":
		wordCount = "800-1500 words"
	case "long":
		wordCount = "1500-2500 words"
	default:
		wordCount = "800-1500 words"
	}

	prompt := fmt.Sprintf(`Write a comprehensive blog post with the following details:

Title: %s
Description: %s
Tone: %s
Length: %s

Please write a well-structured blog post that:
1. Has an engaging introduction
2. Is organized with clear headings and subheadings
3. Includes practical examples or insights
4. Has a strong conclusion
5. Uses a %s tone throughout
6. Is approximately %s in length

Format the response as a complete blog post in markdown format.`, 
		req.Title, req.Description, tone, wordCount, tone, wordCount)

	resp, err := s.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			MaxTokens: 3000,
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %w", err)
	}

	content := resp.Choices[0].Message.Content

	// Generate tags
	tags, err := s.generateTags(req.Title, content)
	if err != nil {
		// If tag generation fails, continue with empty tags
		tags = []string{}
	}

	return &GenerateContentResponse{
		Content: content,
		Tags:    tags,
	}, nil
}

func (s *AIService) GenerateMeta(req GenerateMetaRequest) (*GenerateMetaResponse, error) {
	prompt := fmt.Sprintf(`Based on the following blog post title and content, generate SEO-optimized meta information:

Title: %s
Content: %s

Please provide:
1. A compelling meta title (50-60 characters)
2. A descriptive meta description (150-160 characters)
3. 5-7 relevant tags/keywords

Format your response as:
Meta Title: [title]
Meta Description: [description]
Tags: [tag1, tag2, tag3, ...]`, req.Title, req.Content)

	resp, err := s.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			MaxTokens: 300,
		},
	)

	if err != nil {
		return nil, fmt.Errorf("failed to generate meta: %w", err)
	}

	content := resp.Choices[0].Message.Content
	
	// Parse the response
	metaTitle, metaDescription, tags := s.parseMetaResponse(content)

	return &GenerateMetaResponse{
		MetaTitle:       metaTitle,
		MetaDescription: metaDescription,
		Tags:            tags,
	}, nil
}

func (s *AIService) generateTags(title, content string) ([]string, error) {
	prompt := fmt.Sprintf(`Based on the following blog post title and content, suggest 5-7 relevant tags/keywords:

Title: %s
Content: %s

Respond with only the tags separated by commas.`, title, content)

	resp, err := s.client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			MaxTokens: 100,
		},
	)

	if err != nil {
		return nil, err
	}

	tagsStr := resp.Choices[0].Message.Content
	tags := strings.Split(tagsStr, ",")
	
	// Clean up tags
	for i, tag := range tags {
		tags[i] = strings.TrimSpace(tag)
	}

	return tags, nil
}

func (s *AIService) parseMetaResponse(response string) (string, string, []string) {
	lines := strings.Split(response, "\n")
	
	var metaTitle, metaDescription string
	var tags []string

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "Meta Title:") {
			metaTitle = strings.TrimSpace(strings.TrimPrefix(line, "Meta Title:"))
		} else if strings.HasPrefix(line, "Meta Description:") {
			metaDescription = strings.TrimSpace(strings.TrimPrefix(line, "Meta Description:"))
		} else if strings.HasPrefix(line, "Tags:") {
			tagsStr := strings.TrimSpace(strings.TrimPrefix(line, "Tags:"))
			tagsStr = strings.Trim(tagsStr, "[]")
			tagsList := strings.Split(tagsStr, ",")
			for _, tag := range tagsList {
				tags = append(tags, strings.TrimSpace(tag))
			}
		}
	}

	return metaTitle, metaDescription, tags
} 