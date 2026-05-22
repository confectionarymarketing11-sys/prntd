import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MiniBarChart({
  title,
  data,
  valueKey,
  formatValue,
}: {
  title: string;
  data: { label: string; [key: string]: string | number }[];
  valueKey: string;
  formatValue: (value: number) => string;
}) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] ?? 0)), 1);

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        {data.map((item) => {
          const value = Number(item[valueKey] ?? 0);
          return (
            <div key={String(item.label)} className="grid gap-1">
              <div className="flex justify-between text-xs text-slate-500"><span>{item.label}</span><span>{formatValue(value)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.max((value / max) * 100, 2)}%` }} /></div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
