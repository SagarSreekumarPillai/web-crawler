import * as React from "react"
import {
  Heading1,
  Heading2,
  Heading3,
  Link,
  Lock,
} from "lucide-react"

const icons: Record<string, React.ReactNode> = {
  heading: <Heading1 className="text-primary" />,
  heading2: <Heading2 className="text-primary" />,
  heading3: <Heading3 className="text-primary" />,
  internal: <Link className="text-blue-500" />,
  external: <Link className="text-blue-400" />,
  login: <Lock className="text-red-500" />,
}

export default function MetricCard({
  type,
  label,
  value,
}: {
  type: string
  label: string
  value: number | string | undefined
}) {
  return (
    <div className="p-4 rounded-xl bg-muted shadow-sm flex flex-col items-start">
      <div className="text-xs mb-1 flex items-center gap-2 text-muted-foreground">
        {icons[type]}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-xl font-semibold text-foreground">{value ?? "—"}</div>
    </div>
  )
}
