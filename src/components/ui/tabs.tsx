import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ui-tabs" role="tablist">
      {options.map((option) => (
        <TabButton
          active={option.value === value}
          key={option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </TabButton>
      ))}
    </div>
  );
}

function TabButton({
  active,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button className={cn("ui-tab", active && "active", className)} type="button" {...props} />;
}
