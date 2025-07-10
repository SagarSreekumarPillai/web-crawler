import React from "react"

export default function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-muted-foreground font-medium tracking-wide">
        Fetching insights from the web...
      </p>
    </div>
  )
}
