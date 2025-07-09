import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addUrl } from "@/lib/api";

export default function AddUrlPage() {
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    if (!url.trim()) return alert("Please enter a URL");

    try {
      const result = await addUrl(url);
      console.log("✅ URL submitted:", result);
      // TODO: navigate to dashboard or show toast
    } catch (err: any) {
      console.error("❌ Submission failed:", err.message);
      alert(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">🔗 Add a Website URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="button" onClick={handleSubmit}>
            Start Crawling
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
