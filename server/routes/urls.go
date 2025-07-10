package routes

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/SagarSreekumarPillai/web-crawler/server/db"
	"github.com/SagarSreekumarPillai/web-crawler/server/models"
	
)

func UrlRoutes(rg *gin.RouterGroup) {
	urls := rg.Group("urls") // e.g. /api/urls
	{
		urls.GET("", GetUrls)
		urls.POST("", AddUrl)
		urls.POST("/:id/recrawl", ReCrawl)
		urls.DELETE("/:id", DeleteUrl)
		urls.DELETE("", DeleteAllUrls)

	}
}

// ✅ GET /api/urls
func GetUrls(c *gin.Context) {
	urls, err := models.GetAllUrls()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch URLs"})
		return
	}
	c.JSON(http.StatusOK, urls)
}

// ✅ POST /api/urls
func AddUrl(c *gin.Context) {
	var payload struct {
		Url string `json:"url"`
	}

	if err := c.BindJSON(&payload); err != nil || payload.Url == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing URL"})
		return
	}

	log.Println("🚀 Crawling URL:", payload.Url)

	urlWithMeta, err := models.CreateOrUpdateWithMetadata(payload.Url)
	if err != nil {
		log.Println("❌ Crawl failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Crawl failed"})
		return
	}

	c.JSON(http.StatusCreated, urlWithMeta)
}

// ✅ POST /api/urls/:id/recrawl
func ReCrawl(c *gin.Context) {
	id := c.Param("id")

	existing, err := models.GetUrlByID(id)
	if err != nil || existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	log.Println("🔁 Re-crawling:", existing.Url)

	urlWithMeta, err := models.CreateOrUpdateWithMetadata(existing.Url)
	if err != nil {
		log.Println("❌ Re-crawl failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Re-crawl failed"})
		return
	}

	c.JSON(http.StatusOK, urlWithMeta)
}

// DELETE /api/urls/:id
func DeleteUrl(c *gin.Context) {
	id := c.Param("id")

	// Check if exists
	existing, err := models.GetUrlByID(id)
	if err != nil || existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	// Delete from DB
	_, err = db.DB.Exec(`DELETE FROM urls WHERE id = ?`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// DELETE /api/urls
func DeleteAllUrls(c *gin.Context) {
	_, err := db.DB.Exec(`DELETE FROM urls`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear all URLs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All URLs deleted"})
}

