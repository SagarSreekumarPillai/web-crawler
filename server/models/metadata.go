package models

type Metadata struct {
	HTMLVersion     string   `json:"html_version"`
	Title           string   `json:"title"`
	H1Count         int      `json:"h1_count"`
	H2Count         int      `json:"h2_count"`
	H3Count         int      `json:"h3_count"`
	InternalLinks   int      `json:"internal_links"`
	ExternalLinks   int      `json:"external_links"`
	BrokenLinks     []string `json:"broken_links"`
	HasLoginForm    bool     `json:"has_login_form"`
}
