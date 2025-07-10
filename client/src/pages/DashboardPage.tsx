import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import DashboardMain from "@/components/dashboard/DashboardMain"
import EmptyState from "@/components/dashboard/EmptyState"
import Loader from "@/components/ui/Loader"

type UrlRecord = {
  id: number
  url: string
  created_at: string
  last_crawled_at: string
  title: string
  html_version: string
  h1_count: number
  h2_count: number
  h3_count: number
  internal_links: number
  external_links: number
  broken_links: string[]
  has_login_form: boolean
  status?: string
}

export default function DashboardPage() {
  const [urls, setUrls] = useState<UrlRecord[] | null>(null)
  const [selected, setSelected] = useState<UrlRecord | null>(null)
  const [newUrl, setNewUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [recrawlId, setRecrawlId] = useState<number | null>(null)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/urls")
      const data = await res.json()
      setUrls(data)
      setSelected(data[0] || null)
    } catch (err) {
      console.error("❌ Failed to fetch URLs", err)
      setUrls([]) // fallback so it doesn't hang
    }
  }

  const handleSubmit = async () => {
    if (!newUrl.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("http://localhost:8080/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      })
      const data = await res.json()
      setNewUrl("")
      await fetchData()
      setSelected(data.url || null)
    } catch (err) {
      console.error("❌ Failed to crawl:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRecrawl = async (id: number) => {
    setRecrawlId(id)
    try {
      await fetch(`http://localhost:8080/api/urls/${id}/recrawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      await fetchData()
    } catch (err) {
      console.error("❌ Re-crawl error:", err)
    } finally {
      setRecrawlId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this URL entry?")) return
    try {
      await fetch(`http://localhost:8080/api/urls/${id}`, { method: "DELETE" })
      await fetchData()
    } catch (err) {
      console.error("❌ Failed to delete:", err)
    }
  }

  const handleClearAll = async () => {
    if (!confirm("Clear all crawl history?")) return
    try {
      await fetch("http://localhost:8080/api/urls", { method: "DELETE" })
      await fetchData()
    } catch (err) {
      console.error("❌ Failed to clear all:", err)
    }
  }

  if (urls === null) return <Loader />

  if (urls.length === 0) {
    return (
      <EmptyState
        value={newUrl}
        setValue={setNewUrl}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    )
  }

  return (
    <DashboardMain
      urls={urls}
      selected={selected}
      setSelected={setSelected}
      newUrl={newUrl}
      setNewUrl={setNewUrl}
      submitting={submitting}
      recrawlId={recrawlId}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      onClearAll={handleClearAll}
      onRecrawl={handleRecrawl}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
    />
  )
}
