package utils

import (
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
)

type Metadata struct {
	HTMLVersion   string   `json:"html_version"`
	Title         string   `json:"title"`
	H1Count       int      `json:"h1_count"`
	H2Count       int      `json:"h2_count"`
	H3Count       int      `json:"h3_count"`
	InternalLinks int      `json:"internal_links"`
	ExternalLinks int      `json:"external_links"`
	BrokenLinks   []string `json:"broken_links"`
	HasLoginForm  bool     `json:"has_login_form"`
}

func Crawl(urlStr string) (*Metadata, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Set User-Agent to mimic browser
	req, _ := http.NewRequest("GET", urlStr, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Get raw HTML for doctype sniffing
	tokenizer := html.NewTokenizer(resp.Body)
	var doctype string
	for {
		tt := tokenizer.Next()
		switch tt {
		case html.DoctypeToken:
			doctype = string(tokenizer.Raw())
		case html.StartTagToken, html.EndTagToken, html.TextToken:
			break
		}
		if tt == html.ErrorToken {
			break
		}
		if doctype != "" {
			break
		}
	}

	// Fetch again for goquery (since tokenizer consumed stream)
	req2, _ := http.NewRequest("GET", urlStr, nil)
	req2.Header.Set("User-Agent", req.Header.Get("User-Agent"))

	resp2, err := client.Do(req2)
	if err != nil {
		return nil, err
	}
	defer resp2.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp2.Body)
	if err != nil {
		return nil, err
	}

	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return nil, err
	}

	meta := &Metadata{
		HTMLVersion: parseHTMLVersion(doctype),
		Title:       doc.Find("title").Text(),
		H1Count:     doc.Find("h1").Length(),
		H2Count:     doc.Find("h2").Length(),
		H3Count:     doc.Find("h3").Length(),
	}

	// Link classification
	internal := 0
	external := 0

	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		link, exists := s.Attr("href")
		if !exists || strings.TrimSpace(link) == "" {
			return
		}
		link = strings.TrimSpace(link)

		// Ignore non-http(s)
		if strings.HasPrefix(link, "mailto:") || strings.HasPrefix(link, "tel:") || strings.HasPrefix(link, "javascript:") {
			return
		}

		linkURL, err := url.Parse(link)
		if err != nil {
			return
		}

		absoluteURL := parsedURL.ResolveReference(linkURL)
		if absoluteURL.Hostname() == parsedURL.Hostname() {
			internal++
		} else {
			external++
		}
	})

	meta.InternalLinks = internal
	meta.ExternalLinks = external

	// Detect login form
	doc.Find("form").EachWithBreak(func(i int, form *goquery.Selection) bool {
		form.Find("input").EachWithBreak(func(j int, input *goquery.Selection) bool {
			inputType, exists := input.Attr("type")
			if exists && strings.ToLower(inputType) == "password" {
				meta.HasLoginForm = true
				return false
			}
			return true
		})
		return !meta.HasLoginForm
	})

	// Detect broken links (check first 10)
	broken := []string{}
	doc.Find("a[href]").EachWithBreak(func(i int, s *goquery.Selection) bool {
		if i >= 10 {
			return false
		}
		link, _ := s.Attr("href")
		link = strings.TrimSpace(link)
		linkURL, err := url.Parse(link)
		if err != nil {
			return true
		}
		absoluteURL := parsedURL.ResolveReference(linkURL)

		headReq, _ := http.NewRequest("HEAD", absoluteURL.String(), nil)
		headReq.Header.Set("User-Agent", req.Header.Get("User-Agent"))

		headResp, err := client.Do(headReq)
		if err != nil || headResp.StatusCode >= 400 {
			broken = append(broken, absoluteURL.String())
		}
		return true
	})
	meta.BrokenLinks = broken

	log.Println("✅ Metadata crawled for:", urlStr)
	return meta, nil
}

func parseHTMLVersion(rawDoctype string) string {
	raw := strings.ToLower(rawDoctype)
	switch {
	case strings.Contains(raw, "xhtml"):
		return "XHTML"
	case strings.Contains(raw, "html 4"):
		return "HTML 4"
	case strings.Contains(raw, "html"):
		return "HTML5"
	default:
		return "Unknown"
	}
}
