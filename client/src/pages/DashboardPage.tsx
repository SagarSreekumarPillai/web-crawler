import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
  const [statusMap, setStatusMap] = useState<Record<number, "loading" | "done" | "error">>({});

  useEffect(() => {
    fetch("http://localhost:8080/api/urls")
      .then((res) => res.json())
      .then((data) => {
        setUrls(data);
        setLoading(false);

        data.forEach((item: UrlRecord) => {
          setStatusMap((prev) => ({ ...prev, [item.id]: "loading" }));

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
              setStatusMap((prev) => ({ ...prev, [item.id]: "done" }));
            })
            .catch((err) => {
              console.error("Crawl failed for", item.url, err);
              setMetadataMap((prev) => ({ ...prev, [item.id]: null }));
              setStatusMap((prev) => ({ ...prev, [item.id]: "error" }));
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
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((u) => {
                  const meta = metadataMap[u.id];
                  const status = statusMap[u.id] || "loading";

                  return (
                    <tr key={u.id} className="border-b">
                      <td className="p-2 max-w-[200px] truncate">{u.url}</td>
                      <td className="p-2">{meta ? meta.title : "..."}</td>
                      <td className="p-2">{meta ? meta.html_version : "..."}</td>
                      <td className="p-2">{meta ? meta.h1_count : "..."}</td>
                      <td className="p-2">{meta ? meta.internal_links : "..."}</td>
                      <td className="p-2">{meta ? meta.external_links : "..."}</td>
                      <td className="p-2">
                        {meta ? (
                          meta.has_login_form ? (
                            <Badge className="bg-green-500 text-white">Yes</Badge>
                          ) : (
                            <Badge className="bg-gray-300">No</Badge>
                          )
                        ) : (
                          <Skeleton className="h-5 w-10" />
                        )}
                      </td>
                      <td className="p-2">
                        <Badge
                          className={
                            status === "done"
                              ? "bg-green-600 text-white"
                              : status === "error"
                              ? "bg-red-600 text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {status}
                        </Badge>
                      </td>
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
