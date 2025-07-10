import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Globe,
  Sun,
  Moon,
  RefreshCcw,
  Trash2,
  PlusCircle,
} from "lucide-react"
import { useTheme } from "next-themes"
import MetricCard from "@/components/dashboard/MetricCard"
import EmptyState from "@/components/dashboard/EmptyState"

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
  const [urls, setUrls] = useState<UrlRecord[]>([])
  const [selected, setSelected] = useState<UrlRecord | null>(null)
  const [newUrl, setNewUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [recrawlId, setRecrawlId] = useState<number | null>(null)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await fetch("http://localhost:8080/api/urls")
    const data = await res.json()
    setUrls(data)
    setSelected(data[0] || null)
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
      setSelected(data.url)
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

  if (urls.length === 0) {
    return <EmptyState value={newUrl} setValue={setNewUrl} onSubmit={handleSubmit} submitting={submitting} />
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 bg-background text-foreground min-h-screen space-y-6 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          <Globe className="h-6 w-6 text-primary" />
          <span>Web Crawler</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="capitalize">{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a Website URL</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
            disabled={submitting}
          />
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Crawling..." : "Start Crawl"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  {selected?.url || "No URL Selected"}
                  {selected?.status && (
                    <Badge
                      variant={selected.status === "done" ? "default" : "destructive"}
                      className="ml-2 text-xs capitalize px-2 py-1"
                    >
                      {selected.status}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Last crawled: {selected ? new Date(selected.last_crawled_at).toLocaleString() : "--"}
                </p>
              </div>
              {selected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRecrawl(selected.id)}
                  disabled={recrawlId === selected.id}
                >
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  {recrawlId === selected.id ? "Re-crawling..." : "Re-crawl"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                <MetricCard type="heading" label="H1 Tags" value={selected?.h1_count} />
                <MetricCard type="heading2" label="H2 Tags" value={selected?.h2_count} />
                <MetricCard type="heading3" label="H3 Tags" value={selected?.h3_count} />
                <MetricCard type="internal" label="Internal Links" value={selected?.internal_links} />
                <MetricCard type="external" label="External Links" value={selected?.external_links} />
                <MetricCard type="login" label="Login Form" value={selected?.has_login_form ? "Yes" : "No"} />
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div><strong>Title:</strong> <span className="text-muted-foreground">{selected?.title || "N/A"}</span></div>
                <div><strong>HTML Version:</strong> <span className="text-muted-foreground">{selected?.html_version || "Unknown"}</span></div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-sm mb-2">Broken Links</h4>
                {selected?.broken_links.length ? (
                  <ScrollArea className="h-24 rounded-md border p-2">
                    <ul className="list-disc pl-4 text-xs text-destructive space-y-1">
                      {selected.broken_links.map((link, idx) => (
                        <li key={idx}>{link}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No broken links</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - History */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm">Crawl History</CardTitle>
              {urls.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  className="text-xs text-destructive"
                >
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {urls.map((u) => (
                    <div
                      key={u.id}
                      className={`px-4 py-3 text-sm flex justify-between items-center cursor-pointer ${
                        selected?.id === u.id ? "bg-muted border-l-4 border-primary" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelected(u)}
                    >
                      <div className="truncate w-40">{u.url}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(u.last_crawled_at).toLocaleDateString()}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(u.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
