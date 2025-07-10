import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "loading" | "done" | "error" }) {
  const map = {
    loading: "bg-yellow-500",
    done: "bg-green-600",
    error: "bg-red-600",
  };

  return (
    <Badge className={`${map[status]} text-white capitalize`}>
      {status}
    </Badge>
  );
}
