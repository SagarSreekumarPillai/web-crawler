package models

import (
	"time"
	"log"
	"github.com/SagarSreekumarPillai/web-crawler/server/db"
)

type Url struct {
	ID        int       `json:"id"`
	Url       string    `json:"url"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// Create a new URL entry
func (u *Url) Create() error {
	// Check if URL already exists
	var existingID int
	err := db.DB.QueryRow("SELECT id FROM urls WHERE url = ?", u.Url).Scan(&existingID)
	if err == nil {
		// URL already exists, skip insertion
		u.ID = existingID
		return nil
	}

	// Insert new if not found
	result, err := db.DB.Exec("INSERT INTO urls (url, status) VALUES (?, ?)", u.Url, u.Status)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	u.ID = int(id)
	return nil
}



// Get all URLs
func GetAllUrls() ([]Url, error) {
	rows, err := db.DB.Query("SELECT id, url, status, created_at FROM urls ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []Url
	for rows.Next() {
		var u Url
		if err := rows.Scan(&u.ID, &u.Url, &u.Status, &u.CreatedAt); err != nil {
			return nil, err
		}
		urls = append(urls, u)
	}
	return urls, nil
}


func GetUrlByID(id string) (*Url, error) {
	query := "SELECT id, url, status, created_at FROM urls WHERE id = ?"
	row := db.DB.QueryRow(query, id)

	var u Url
	err := row.Scan(&u.ID, &u.Url, &u.Status, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
