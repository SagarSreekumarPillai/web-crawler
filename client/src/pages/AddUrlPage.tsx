import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addUrl } from "@/lib/api"

export default function AddUrlPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!url.trim()) {
      alert("Please enter a valid URL")
      return
    }
    setLoading(true)
    try {
      const result = await addUrl(url)
      console.log("✅ Submitted:", result)
      navigate("/dashboard", { state: { urlData: result } })
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            🔍 Website Crawler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Enter any website URL to crawl and analyze its structure instantly.
          </p>
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Analyzing..." : "Start Crawl"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
