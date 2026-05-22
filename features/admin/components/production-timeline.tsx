import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/features/admin/components/status-badge";
import type { ProductionEvent } from "@/features/admin/types/database";

export default function ProductionTimeline({ events }: { events: ProductionEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!events.length ? (
          <p className="text-sm text-slate-500">No production activity yet.</p>
        ) : (
          <ol className="relative grid gap-5 border-l border-slate-200 pl-5">
            {events
              .slice()
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-950" />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    <time className="text-xs font-semibold text-slate-500">{new Date(event.created_at).toLocaleString()}</time>
                  </div>
                  {event.note && <p className="mt-2 text-sm text-slate-600">{event.note}</p>}
                </li>
              ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
