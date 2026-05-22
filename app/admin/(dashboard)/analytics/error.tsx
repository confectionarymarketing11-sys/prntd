"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <Card className="max-w-lg">
        <CardHeader><CardTitle>Analytics error</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">{error.message}</p>
          <Button onClick={reset} className="mt-5">Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
