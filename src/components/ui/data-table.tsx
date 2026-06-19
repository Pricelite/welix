import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
}) {
  if (!rows.length) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className="ui-data-table">
      <div
        className="ui-data-table-head"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span className={cn(column.className)} key={column.key}>
            {column.header}
          </span>
        ))}
      </div>

      {rows.map((row) => (
        <div
          className="ui-data-table-row"
          key={rowKey(row)}
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <div className={cn("ui-data-table-cell", column.className)} key={column.key}>
              {column.render(row)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
