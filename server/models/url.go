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
	query := "INSERT INTO urls (url, status) VALUES (?, ?)"
	result, err := db.DB.Exec(query, u.Url, u.Status)
	if err != nil {
		return err
	}
	id, _ := result.LastInsertId()
	u.ID = int(id)

	// Fetch the inserted row's full details (to get created_at)
	row := db.DB.QueryRow("SELECT created_at FROM urls WHERE id = ?", u.ID)
	if err := row.Scan(&u.CreatedAt); err != nil {
		return err
	}

	log.Println("✅ New URL inserted with ID:", u.ID)
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
