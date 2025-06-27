package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
)

func ClerkAuth(secretKey string) gin.HandlerFunc {
	// Set the Clerk secret key globally
	clerk.SetKey(secretKey)

	// Debug: Log if secret key is present
	if secretKey == "" {
		println("WARNING: Clerk secret key is empty!")
	} else {
		println("Clerk secret key loaded, length:", len(secretKey))
		println("Secret key prefix:", secretKey[:15], "...")
	}

	return func(c *gin.Context) {
		// Get the session token from the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		// Extract the token from "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		sessionToken := tokenParts[1]

		// Verify the session token using JWT verification (v2 SDK networkless approach)
		ctx := context.Background()

		// Debug: Log token details
		println("=== JWT Verification Debug ===")
		println("Token length:", len(sessionToken))
		println("Token prefix:", sessionToken[:50], "...")

		claims, err := jwt.Verify(ctx, &jwt.VerifyParams{
			Token: sessionToken,
		})
		if err != nil {
			// Add debug logging
			println("JWT verification failed:", err.Error())
			println("Error type:", err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":       "User not authenticated",
				"debug":       err.Error(),
				"tokenLength": len(sessionToken),
			})
			c.Abort()
			return
		}

		println("JWT verification successful, subject:", claims.Subject)

		// Get user information using the subject from the token
		usr, err := user.Get(ctx, claims.Subject)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user information"})
			c.Abort()
			return
		}

		// Helper function to safely get string from pointer
		getStringValue := func(s *string) string {
			if s != nil {
				return *s
			}
			return ""
		}

		// Set user information in context with safe string handling
		c.Set("userID", usr.ID)
		if len(usr.EmailAddresses) > 0 {
			c.Set("userEmail", usr.EmailAddresses[0].EmailAddress)
		} else {
			c.Set("userEmail", "")
		}

		firstName := getStringValue(usr.FirstName)
		lastName := getStringValue(usr.LastName)
		fullName := strings.TrimSpace(firstName + " " + lastName)
		if fullName == "" {
			fullName = "Anonymous User"
		}
		c.Set("userName", fullName)

		c.Next()
	}
}
