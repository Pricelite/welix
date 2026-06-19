import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  className,
  children,
  label,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label: string }) {
  return (
    <span className={cn("ui-tooltip", className)} data-tooltip={label} {...props}>
      {children}
    </span>
  );
}
