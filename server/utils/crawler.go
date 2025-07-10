package utils

import (
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/html"
	"log"
	"net/url"
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

	resp, err := client.Get(urlStr)
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

	// Re-fetch body for goquery since tokenizer consumed it
	resp2, err := client.Get(urlStr)
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
	baseHost := parsedURL.Host

	meta := &Metadata{
		HTMLVersion: parseHTMLVersion(doctype),
		Title:       doc.Find("title").Text(),
	}

	// Count headings
	meta.H1Count = doc.Find("h1").Length()
	meta.H2Count = doc.Find("h2").Length()
	meta.H3Count = doc.Find("h3").Length()

	// Analyze links
	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		link, _ := s.Attr("href")
		link = strings.TrimSpace(link)
		if link == "" || strings.HasPrefix(link, "#") {
			return
		}
		linkURL, err := url.Parse(link)
		if err != nil {
			return
		}
		if linkURL.Host == "" || linkURL.Host == baseHost {
			meta.InternalLinks++
		} else {
			meta.ExternalLinks++
		}
	})

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
		if meta.HasLoginForm {
			return false
		}
		return true
	})

	// Detect broken links (check only first 10 for speed)
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
		if !linkURL.IsAbs() {
			linkURL = parsedURL.ResolveReference(linkURL)
		}
		headResp, err := client.Head(linkURL.String())
		if err != nil || headResp.StatusCode >= 400 {
			broken = append(broken, linkURL.String())
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
