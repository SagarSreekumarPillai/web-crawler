import {
    Sun,
    Moon,
    Globe,
    RefreshCcw,
    Trash2,
  } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { ScrollArea } from "@/components/ui/scroll-area"
  import { Badge } from "@/components/ui/badge"
  import MetricCard from "@/components/dashboard/MetricCard"
  import type { UrlRecord } from "@/types"
  
  type Props = {
    urls: UrlRecord[]
    selected: UrlRecord | null
    setSelected: (u: UrlRecord) => void
    newUrl: string
    setNewUrl: (val: string) => void
    submitting: boolean
    recrawlId: number | null
    onSubmit: () => void
    onRecrawl: (id: number) => void
    onDelete: (id: number) => void
    onClearAll: () => void
    resolvedTheme: string | undefined
    setTheme: (theme: string) => void
  }
  
  export default function DashboardMain({
    urls,
    selected,
    setSelected,
    newUrl,
    setNewUrl,
    submitting,
    recrawlId,
    onSubmit,
    onRecrawl,
    onDelete,
    onClearAll,
    resolvedTheme,
    setTheme,
  }: Props) {
    return (
      <div className="p-4 sm:p-6 md:p-10 bg-background text-foreground min-h-screen space-y-6 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Web Crawler</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="flex items-center gap-1"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
  
        {/* New URL input */}
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
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "Crawling..." : "Start Crawl"}
            </Button>
          </CardContent>
        </Card>
  
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    {selected?.url || "No URL Selected"}
                    {selected?.status && (
                      <Badge
                        variant={selected.status === "done" ? "default" : "destructive"}
                        className="ml-2 text-xs capitalize"
                      >
                        {selected.status}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last crawled:{" "}
                    {selected ? new Date(selected.last_crawled_at).toLocaleString() : "--"}
                  </p>
                </div>
                {selected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRecrawl(selected.id)}
                    disabled={recrawlId === selected.id}
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    {recrawlId === selected.id ? "Re-crawling..." : "Re-crawl"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  <MetricCard type="heading" label="H1 Tags" value={selected?.h1_count} />
                  <MetricCard type="heading2" label="H2 Tags" value={selected?.h2_count} />
                  <MetricCard type="heading3" label="H3 Tags" value={selected?.h3_count} />
                  <MetricCard type="internal" label="Internal" value={selected?.internal_links} />
                  <MetricCard type="external" label="External" value={selected?.external_links} />
                  <MetricCard type="login" label="Login" value={selected?.has_login_form ? "Yes" : "No"} />
                </div>
  
                {/* Meta info */}
                <div className="mt-6 space-y-2 text-sm">
                  <div><strong>Title:</strong> <span className="text-muted-foreground">{selected?.title || "N/A"}</span></div>
                  <div><strong>HTML Version:</strong> <span className="text-muted-foreground">{selected?.html_version || "Unknown"}</span></div>
                </div>
  
                {/* Broken Links */}
                <div className="mt-6">
                  <h4 className="font-semibold text-sm mb-2">Broken Links</h4>
                  {selected?.broken_links.length ? (
                    <ScrollArea className="h-24 rounded-md border p-2">
                      <ul className="list-disc pl-4 text-xs text-red-600 space-y-1">
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
  
          {/* Right: History */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm">Crawl History</CardTitle>
                {urls.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearAll}
                    className="text-xs text-red-600"
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
                        className={`px-4 py-3 text-sm flex justify-between items-center hover:bg-muted cursor-pointer ${
                          selected?.id === u.id ? "bg-muted border-l-4 border-primary/70" : ""
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
                              onDelete(u.id)
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
  