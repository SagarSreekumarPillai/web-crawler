# 🌐 Sykell Web Crawler

A fullstack web application that accepts website URLs, crawls the content, and displays useful metadata like HTML version, title, link stats, heading counts, broken links, and presence of login forms.

Built as part of the **Sykell Full-Stack Developer Task**.

---

## ⚙️ Tech Stack

### 🔹 Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Axios
- Chart.js (or Recharts)
- Jest + React Testing Library

### 🔹 Backend
- Go (Golang) with Gin
- MySQL
- Go Modules
- net/http, goquery
- Docker (optional)

---

## 🚀 Features

### ✅ Core
- Add URLs for analysis
- Start/stop crawl operations
- Dashboard with paginated, sortable table
- Detail view per URL (with charts and broken link list)
- Re-run/delete bulk actions via checkboxes
- Real-time crawl status (Queued → Crawling → Done/Error)

### 📊 Collected Data Per URL
- HTML version
- Page title
- Number of heading tags (H1–H6)
- Count of internal vs. external links
- List of broken links (4xx/5xx)
- Presence of login form

---

## 🧩 Folder Structure

