import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-icon">{icon}</div>
      <div className="ui-empty-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className="ui-empty-action">{action}</div> : null}
    </div>
  );
}
