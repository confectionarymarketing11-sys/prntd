import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsCard({ title, value, note }: { title: string; value: string | number; note?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-slate-500">{title}</CardTitle></CardHeader>
      <CardContent>
        <p className="text-3xl font-black">{value}</p>
        {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      </CardContent>
    </Card>
  );
}
