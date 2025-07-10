import { Loader2 } from "lucide-react"

export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground">
      <Loader2 className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
      <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
    </div>
  )
}
