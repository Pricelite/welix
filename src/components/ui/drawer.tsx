import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  side = "right",
  children,
}: {
  open: boolean;
  side?: "left" | "right";
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-overlay" role="presentation">
      <aside className={cn("ui-drawer", `ui-drawer-${side}`)}>{children}</aside>
    </div>
  );
}
