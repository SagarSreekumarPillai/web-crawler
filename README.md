# 🕸️ Web Crawler

A full-stack website metadata crawler that analyzes website structure, extracts tags, links, login forms, and more — displayed in a beautiful, responsive dashboard.

Built with:

* 🧠 **Frontend:** React + Vite + TypeScript + ShadCN UI + Tailwind CSS
* 🚀 **Backend:** Go (Gin) + MySQL
* 🎯 **Features:** URL crawl, auto metadata extraction, dashboard, re-crawl, delete, dark/light mode, broken link detection, and more.

👉 **Scroll below for complete setup instructions.**

---

## 📦 Folder Structure

```
web-crawler/
├── client/           # Frontend (Vite + React + Tailwind)
├── server/           # Backend (Go + Gin + MySQL)
├── README.md
└── ...
```

---

## 🧰 Prerequisites

* Node.js (v18+ recommended)
* Go (v1.20+)
* MySQL (installed and running)
* Git

---

## ⚙️ 1. Clone the Repository

```bash
git clone https://github.com/SagarSreekumarPillai/web-crawler.git
cd web-crawler
```

---

## 🖥️ 2. Setup & Run the Frontend

```bash
cd client
npm install
npm run dev
```

* Runs at: `http://localhost:5173`

---

## 🔧 3. Setup & Run the Backend

```bash
cd ../server
go mod tidy
go run main.go
```

* Runs at: `http://localhost:8080`

---

## 🗃️ 4. MySQL Setup

Make sure MySQL is installed and running on your machine.

### Step 1: Create Database

Use your preferred MySQL tool (TablePlus, MySQL CLI, MySQL Workbench, etc.) and run the following SQL:

```sql
CREATE DATABASE sykell;
USE sykell;
```

### Step 2: Let the App Create the Table (Auto-Migration)

You **don’t need to manually create tables** — the Go backend will automatically create the required `urls` table the first time you crawl a website.

If you still prefer to check or pre-create it manually, here’s the SQL structure:

```sql
CREATE TABLE urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  html_version VARCHAR(50),
  h1_count INT,
  h2_count INT,
  h3_count INT,
  internal_links INT,
  external_links INT,
  broken_links JSON,
  has_login_form BOOLEAN,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Configure Database Connection

In `server/.env`, set your local MySQL credentials:

```
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sykell
DB_HOST=127.0.0.1
DB_PORT=3306
```

> ⚠️ Make sure the MySQL user has privileges to create databases and tables.

---

## 🌗 5. Features

* ✅ Crawl any website for metadata.
* 🔎 Get HTML version, H1/H2/H3 counts, links, broken links, login forms.
* 🧠 Beautiful Dashboard with light/dark mode.
* ♻️ Re-crawl & update metadata.
* 🗑️ Delete or clear all history.
* 🌍 History tracking with timestamps.

---

## 🌐 API Endpoints

| Method | Route                   | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/urls`             | Crawl a new URL      |
| GET    | `/api/urls`             | Get all crawled URLs |
| POST   | `/api/urls/:id/recrawl` | Re-crawl URL by ID   |
| DELETE | `/api/urls/:id`         | Delete one URL       |
| DELETE | `/api/urls`             | Clear all records    |

---

## 🖼️ UI Preview

> Based on this design inspiration: [Phoenix SaaS Dashboard](https://dribbble.com/shots/24882387-Dashboard-for-a-IoT-SaaS-Phoenix)

Dark and Light mode:

![screenshot](https://dummyimage.com/1200x600/000/fff\&text=Dashboard+Preview)

---

## 👨‍💻 Developed By

[Sagar Sreekumar Pillai](https://github.com/SagarSreekumarPillai)

---

## 🛡️ License

MIT

---

## 🙌 Contribution

Pull requests welcome! Feel free to fork and enhance. Let's crawl the web, beautifully.
