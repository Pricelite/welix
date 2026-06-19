import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-overlay" role="presentation">
      <div aria-modal="true" className={cn("ui-modal", className)} role="dialog">
        {children}
      </div>
    </div>
  );
}

export function ModalSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-modal-section", className)} {...props} />;
}
