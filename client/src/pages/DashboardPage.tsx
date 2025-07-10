import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addUrl } from "@/lib/api"; // optional if adding re-crawl
import { Skeleton } from "@/components/ui/skeleton";

type UrlRecord = {
  id: number;
  url: string;
  created_at: string;
};

type Metadata = {
  title: string;
  html_version: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  internal_links: number;
  external_links: number;
  broken_links: string[];
  has_login_form: boolean;
};

export default function DashboardPage() {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataMap, setMetadataMap] = useState<Record<number, Metadata | null>>({});

  useEffect(() => {
    fetch("http://localhost:8080/api/urls")
      .then((res) => res.json())
      .then((data) => {
        setUrls(data);
        setLoading(false);

        // Trigger crawl for each
        data.forEach((item: UrlRecord) => {
          fetch("http://localhost:8080/api/urls", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: item.url }),
          })
            .then((res) => res.json())
            .then((resData) => {
              setMetadataMap((prev) => ({
                ...prev,
                [item.id]: resData.metadata,
              }));
            })
            .catch((err) => {
              console.error("Crawl failed for", item.url, err);
              setMetadataMap((prev) => ({
                ...prev,
                [item.id]: null,
              }));
            });
        });
      });
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">📊 Website Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">URL</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">HTML</th>
                  <th className="p-2">H1</th>
                  <th className="p-2">Internal</th>
                  <th className="p-2">External</th>
                  <th className="p-2">Login</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((u) => {
                  const meta = metadataMap[u.id];
                  return (
                    <tr key={u.id} className="border-b">
                      <td className="p-2">{u.url}</td>
                      <td className="p-2">{meta ? meta.title : "..."}</td>
                      <td className="p-2">{meta ? meta.html_version : "..."}</td>
                      <td className="p-2">{meta ? meta.h1_count : "..."}</td>
                      <td className="p-2">{meta ? meta.internal_links : "..."}</td>
                      <td className="p-2">{meta ? meta.external_links : "..."}</td>
                      <td className="p-2">{meta ? (meta.has_login_form ? "Yes" : "No") : "..."}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
