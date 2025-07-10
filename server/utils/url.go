package utils

import (
	"net/url"
	"strings"
)

func NormalizeURL(raw string) (string, error) {
	parsed, err := url.Parse(raw)
	if err != nil {
		return "", err
	}

	// Lowercase scheme + host
	parsed.Scheme = strings.ToLower(parsed.Scheme)
	host := strings.ToLower(parsed.Hostname())

	// Remove www. if present
	if strings.HasPrefix(host, "www.") {
		host = strings.TrimPrefix(host, "www.")
	}

	// Assign cleaned host (preserve port if any)
	if port := parsed.Port(); port != "" {
		parsed.Host = host + ":" + port
	} else {
		parsed.Host = host
	}

	// Remove trailing slash
	parsed.Path = strings.TrimSuffix(parsed.Path, "/")

	return parsed.String(), nil
}
