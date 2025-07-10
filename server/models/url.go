package models

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"github.com/SagarSreekumarPillai/web-crawler/server/db"
	"github.com/SagarSreekumarPillai/web-crawler/server/utils"
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

// Get all URLs and their metadata
func GetAllUrls() ([]Url, error) {
	rows, err := db.DB.Query(`SELECT id, url, title, html_version, h1_count, h2_count, h3_count,
		internal_links, external_links, broken_links, has_login_form, status, created_at, last_crawled_at FROM urls ORDER BY last_crawled_at DESC`)
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

// Find a URL entry by ID
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

// Crawl and save new or updated metadata
func CreateOrUpdateWithMetadata(rawUrl string) (*Url, error) {
	// Normalize URL
	normalized, err := utils.NormalizeURL(rawUrl)
	if err != nil {
		return nil, err
	}

	// Crawl it
	meta, err := utils.Crawl(normalized)
	if err != nil {
		return nil, err
	}

	brokenLinksJSON, _ := json.Marshal(meta.BrokenLinks)

	// Insert or update existing
	_, err = db.DB.Exec(`
		INSERT INTO urls (url, title, html_version, h1_count, h2_count, h3_count, internal_links, external_links, broken_links, has_login_form, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'done')
		ON DUPLICATE KEY UPDATE
			title = VALUES(title),
			html_version = VALUES(html_version),
			h1_count = VALUES(h1_count),
			h2_count = VALUES(h2_count),
			h3_count = VALUES(h3_count),
			internal_links = VALUES(internal_links),
			external_links = VALUES(external_links),
			broken_links = VALUES(broken_links),
			has_login_form = VALUES(has_login_form),
			last_crawled_at = CURRENT_TIMESTAMP
	`, normalized, meta.Title, meta.HTMLVersion, meta.H1Count, meta.H2Count, meta.H3Count,
		meta.InternalLinks, meta.ExternalLinks, string(brokenLinksJSON), meta.HasLoginForm)
	if err != nil {
		return nil, err
	}

	// Return the updated record
	row := db.DB.QueryRow("SELECT * FROM urls WHERE url = ?", normalized)

	var u Url
	var brokenLinksStr string
	err = row.Scan(&u.ID, &u.Url, &u.Title, &u.HTMLVersion, &u.H1Count, &u.H2Count, &u.H3Count,
		&u.InternalLinks, &u.ExternalLinks, &brokenLinksStr, &u.HasLoginForm, &u.Status, &u.CreatedAt, &u.LastCrawledAt)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal([]byte(brokenLinksStr), &u.BrokenLinks)
	return &u, nil
}
