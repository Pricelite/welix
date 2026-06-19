import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  initials,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  initials: string;
}) {
  return (
    <div className={cn("ui-avatar", className)} {...props}>
      <span>{initials}</span>
    </div>
  );
}
