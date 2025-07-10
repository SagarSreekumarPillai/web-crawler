package routes

import (
	"net/http"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/SagarSreekumarPillai/web-crawler/server/models"
	"github.com/SagarSreekumarPillai/web-crawler/server/utils"
)


func UrlRoutes(rg *gin.RouterGroup) {
	urls := rg.Group("urls") // No leading or trailing slash
	{
		urls.POST("", AddUrl)  // /api/urls
		urls.GET("", GetUrls)  // /api/urls
	}
}


// POST /api/urls
func AddUrl(c *gin.Context) {
	log.Println("🔥 POST /api/urls hit!")

	var input models.Url
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	input.Status = "queued"
	if err := input.Create(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert URL"})
		return
	}

	// Crawl the URL immediately
	meta, err := utils.Crawl(input.Url)
	if err != nil {
		log.Println("⚠️ Failed to crawl:", err)
	}

	// Return both DB entry and extracted metadata
	c.JSON(http.StatusCreated, gin.H{
		"url":      input,
		"metadata": meta,
	})
}

// GET /api/urls
func GetUrls(c *gin.Context) {
	urls, err := models.GetAllUrls()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch URLs"})
		return
	}
	c.JSON(http.StatusOK, urls)
}
