import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MiniLineChart({
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
  const values = data.map((item) => Number(item[valueKey] ?? 0));
  const max = Math.max(...values, 5);
  const width = 360;
  const height = 150;
  const padding = 20;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const points = values.map((value, index) => {
    const x = padding + (data.length <= 1 ? usableWidth / 2 : (index / (data.length - 1)) * usableWidth);
    const y = padding + usableHeight - (value / max) * usableHeight;
    return `${x},${y}`;
  });
  const latestValue = values.at(-1) ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start justify-between gap-3 text-base">
          <span>{title}</span>
          <span className="text-sm font-black text-slate-950">{formatValue(latestValue)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full overflow-visible">
          {[0, 1, 2].map((line) => {
            const y = padding + (line / 2) * usableHeight;
            return <line key={line} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
          })}
          {points.length > 1 ? (
            <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points.join(" ")} />
          ) : null}
          {points.map((point, index) => {
            const [x, y] = point.split(",").map(Number);
            return <circle key={`${point}-${index}`} cx={x} cy={y} r="4" fill="#2563eb" />;
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
          <span>{data[0]?.label ?? ""}</span>
          <span>{data.at(-1)?.label ?? ""}</span>
        </div>
      </CardContent>
    </Card>
  );
}
