import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

type EmptyStateProps = {
  value: string
  setValue: (val: string) => void
  onSubmit: () => void
  submitting: boolean
}

export default function EmptyState({
  value,
  setValue,
  onSubmit,
  submitting,
}: EmptyStateProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-background text-foreground">
      <img src="/empty-state.svg" alt="No data" className="w-48 mb-6 opacity-70" />
      <h2 className="text-2xl font-semibold mb-2">Welcome to Web Crawler</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        You haven’t crawled any websites yet. Enter a URL to begin crawling and see insights here.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-72"
        />
        <Button onClick={onSubmit} disabled={submitting}>
          <PlusCircle className="h-4 w-4 mr-1" />
          {submitting ? "Crawling..." : "Start"}
        </Button>
      </div>
    </div>
  )
}
