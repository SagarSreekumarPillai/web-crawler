import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RotateCcw } from "lucide-react"

type UrlRecord = {
  id: number
  url: string
  created_at: string
}

type Metadata = {
  title: string
  html_version: string
  h1_count: number
  h2_count: number
  h3_count: number
  internal_links: number
  external_links: number
  broken_links: string[]
  has_login_form: boolean
}

export default function DashboardPage() {
  const [urls, setUrls] = useState<UrlRecord[]>([])
  const [selectedUrl, setSelectedUrl] = useState<UrlRecord | null>(null)
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const urlFromState = location.state?.urlData?.url

  // Load all past crawls
  useEffect(() => {
    fetch("http://localhost:8080/api/urls")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a: UrlRecord, b: UrlRecord) =>
          b.created_at.localeCompare(a.created_at)
        )
        setUrls(sorted)
        if (urlFromState) {
          const matched = sorted.find((u:UrlRecord) => u.url === urlFromState.url)
          setSelectedUrl(matched ?? sorted[0])
        } else {
          setSelectedUrl(sorted[0])
        }
      })
  }, [])

  // Load metadata only on demand
  const handleRecrawl = async (urlObj: UrlRecord) => {
    setLoading(true)
    setSelectedUrl(urlObj)
    setMetadata(null)
    try {
      const res = await fetch(`http://localhost:8080/api/urls/${urlObj.id}/recrawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      setMetadata(data.metadata)
    } catch (err) {
      console.error("❌ Re-crawl failed", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Latest Crawl Overview */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl">
            {selectedUrl ? `🔍 ${selectedUrl.url}` : "No URL Selected"}
          </CardTitle>
          {selectedUrl && (
            <Button size="sm" variant="outline" onClick={() => handleRecrawl(selectedUrl)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Re-crawl
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : metadata ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Title:</strong> {metadata.title || <span className="text-muted">N/A</span>}
              </div>
              <div>
                <strong>HTML Version:</strong> {metadata.html_version}
              </div>
              <div>
                <strong>H1 Count:</strong> {metadata.h1_count}
              </div>
              <div>
                <strong>H2 Count:</strong> {metadata.h2_count}
              </div>
              <div>
                <strong>H3 Count:</strong> {metadata.h3_count}
              </div>
              <div>
                <strong>Internal Links:</strong> {metadata.internal_links}
              </div>
              <div>
                <strong>External Links:</strong> {metadata.external_links}
              </div>
              <div>
                <strong>Login Form:</strong>{" "}
                {metadata.has_login_form ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
              <div className="col-span-2">
                <strong>Broken Links:</strong>{" "}
                {metadata.broken_links.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {metadata.broken_links.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">None found</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted">No metadata loaded for this URL yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Crawl History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📜 History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {urls.length === 0 ? (
              <p className="text-muted">No crawl history yet.</p>
            ) : (
              <div className="space-y-2">
                {urls.map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer ${
                      selectedUrl?.id === u.id
                        ? "bg-muted border-ring"
                        : "hover:bg-muted transition"
                    }`}
                    onClick={() => {
                      setSelectedUrl(u)
                      setMetadata(null)
                    }}
                  >
                    <div className="truncate max-w-[60%] text-sm">{u.url}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRecrawl(u)
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
