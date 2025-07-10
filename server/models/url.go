package models

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/SagarSreekumarPillai/web-crawler/server/db"
	"github.com/SagarSreekumarPillai/web-crawler/server/utils"
	"github.com/gin-gonic/gin"
)

type Url struct {
	ID             int       `json:"id"`
	Url            string    `json:"url"`
	Title          string    `json:"title"`
	HTMLVersion    string    `json:"html_version"`
	H1Count        int       `json:"h1_count"`
	H2Count        int       `json:"h2_count"`
	H3Count        int       `json:"h3_count"`
	InternalLinks  int       `json:"internal_links"`
	ExternalLinks  int       `json:"external_links"`
	BrokenLinks    []string  `json:"broken_links"`
	HasLoginForm   bool      `json:"has_login_form"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	LastCrawledAt  time.Time `json:"last_crawled_at"`
}

func NormalizeUrl(raw string) string {
	parsed, err := url.Parse(raw)
	if err != nil {
		return raw
	}
	if parsed.Scheme == "" {
		parsed.Scheme = "https"
	}
	parsed.Host = strings.TrimPrefix(parsed.Host, "www.")
	parsed.Path = strings.TrimSuffix(parsed.Path, "/")
	return parsed.String()
}


// Crawl and save new or updated metadata
func CreateOrUpdateWithMetadata(rawUrl string) (map[string]interface{}, error) {
	normalized := NormalizeUrl(rawUrl)

	// Check for existing entry
	var existing Url
	var brokenLinksStr string
	row := db.DB.QueryRow(`SELECT id FROM urls WHERE url = ?`, normalized)
	err := row.Scan(&existing.ID)
	isNew := err == sql.ErrNoRows

	// Crawl site
	meta, crawlErr := utils.Crawl(normalized)
	status := "done"
	if crawlErr != nil {
		log.Println("❌ Crawl failed:", crawlErr)
		status = "failed"
	}

	// Prepare metadata fields
	brokenLinksJSON, _ := json.Marshal(meta.BrokenLinks)
	now := time.Now()

	if isNew {
		// INSERT new row
		_, err := db.DB.Exec(`INSERT INTO urls (
			url, title, html_version, h1_count, h2_count, h3_count,
			internal_links, external_links, broken_links, has_login_form,
			status, created_at, last_crawled_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			normalized, meta.Title, meta.HTMLVersion, meta.H1Count, meta.H2Count, meta.H3Count,
			meta.InternalLinks, meta.ExternalLinks, brokenLinksJSON, meta.HasLoginForm,
			status, now, now,
		)
		if err != nil {
			return nil, err
		}
	} else {
		// UPDATE existing row
		_, err := db.DB.Exec(`UPDATE urls SET
			title=?, html_version=?, h1_count=?, h2_count=?, h3_count=?,
			internal_links=?, external_links=?, broken_links=?, has_login_form=?,
			status=?, last_crawled_at=?
			WHERE url=?`,
			meta.Title, meta.HTMLVersion, meta.H1Count, meta.H2Count, meta.H3Count,
			meta.InternalLinks, meta.ExternalLinks, brokenLinksJSON, meta.HasLoginForm,
			status, now, normalized,
		)
		if err != nil {
			return nil, err
		}
	}

	// Fetch full row to return
	row = db.DB.QueryRow(`SELECT id, url, title, html_version, h1_count, h2_count, h3_count,
		internal_links, external_links, broken_links, has_login_form, status, created_at, last_crawled_at
		FROM urls WHERE url = ?`, normalized)

	err = row.Scan(&existing.ID, &existing.Url, &existing.Title, &existing.HTMLVersion, &existing.H1Count,
		&existing.H2Count, &existing.H3Count, &existing.InternalLinks, &existing.ExternalLinks,
		&brokenLinksStr, &existing.HasLoginForm, &existing.Status, &existing.CreatedAt, &existing.LastCrawledAt)

	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal([]byte(brokenLinksStr), &existing.BrokenLinks)

	return gin.H{
		"url":      existing,
		"metadata": meta,
	}, nil
}

func GetAllUrls() ([]Url, error) {
	rows, err := db.DB.Query(`SELECT id, url, title, html_version, h1_count, h2_count, h3_count,
		internal_links, external_links, broken_links, has_login_form, status, created_at, last_crawled_at 
		FROM urls ORDER BY last_crawled_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []Url
	for rows.Next() {
		var u Url
		var brokenLinksStr string
		err := rows.Scan(&u.ID, &u.Url, &u.Title, &u.HTMLVersion, &u.H1Count, &u.H2Count, &u.H3Count,
			&u.InternalLinks, &u.ExternalLinks, &brokenLinksStr, &u.HasLoginForm, &u.Status, &u.CreatedAt, &u.LastCrawledAt)
		if err != nil {
			return nil, err
		}
		_ = json.Unmarshal([]byte(brokenLinksStr), &u.BrokenLinks)
		urls = append(urls, u)
	}
	return urls, nil
}

func GetUrlByID(id string) (*Url, error) {
	var u Url
	var brokenLinksStr string

	row := db.DB.QueryRow(`SELECT id, url, title, html_version, h1_count, h2_count, h3_count,
		internal_links, external_links, broken_links, has_login_form, status, created_at, last_crawled_at 
		FROM urls WHERE id = ?`, id)

	err := row.Scan(&u.ID, &u.Url, &u.Title, &u.HTMLVersion, &u.H1Count, &u.H2Count, &u.H3Count,
		&u.InternalLinks, &u.ExternalLinks, &brokenLinksStr, &u.HasLoginForm, &u.Status, &u.CreatedAt, &u.LastCrawledAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	_ = json.Unmarshal([]byte(brokenLinksStr), &u.BrokenLinks)
	return &u, nil
}
