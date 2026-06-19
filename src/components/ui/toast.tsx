import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Toast({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "neutral" | "success" | "error";
}) {
  return <div className={cn("ui-toast", `ui-toast-${tone}`, className)} {...props} />;
}
