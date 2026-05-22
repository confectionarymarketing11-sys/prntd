import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function JsonViewer({ title, data }: { title: string; data: unknown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {JSON.stringify(data ?? {}, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
