import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Dropdown({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("ui-dropdown", className)} {...props} />;
}
