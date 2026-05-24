import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArtworkUpload } from "@/features/admin/types/database";

export default function ArtworkGallery({ uploads }: { uploads: ArtworkUpload[] }) {
  function roleLabel(role?: string | null) {
    if (role === "print_area") return "Clipped print area";
    if (role === "source_layer") return "Original upload";
    return role ?? "Artwork";
  }

  const sortedUploads = [...uploads].sort((a, b) => {
    const roleOrder = (role?: string | null) =>
      role === "print_area" ? 0 : role === "source_layer" ? 1 : 2;
    return roleOrder(a.asset_role) - roleOrder(b.asset_role);
  });

  return (
    <Card id="artwork">
      <CardHeader>
        <CardTitle>Print Artwork & Clipping</CardTitle>
      </CardHeader>
      <CardContent>
        {!uploads.length ? (
          <p className="text-sm text-slate-500">No artwork uploads are attached to this order.</p>
        ) : (
          <div className="grid gap-5">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
              <p className="font-black">Fulfillment note</p>
              <p className="mt-1 leading-6">
                Use <strong>clipped print area</strong> files for production. Original uploads are kept underneath so you can inspect source artwork,
                placement, side, size, and rotation if a proof needs review.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedUploads.map((upload) => {
              const isPrintArea = upload.asset_role === "print_area";

              return (
              <article
                key={upload.id}
                className={`overflow-hidden rounded-xl border ${
                  isPrintArea
                    ? "border-blue-300 bg-blue-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className={`relative grid min-h-48 place-items-center ${isPrintArea ? "bg-white" : "bg-slate-100"}`}>
                  {isPrintArea && (
                    <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-dashed border-blue-500">
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                        Clean Clipped File
                      </span>
                    </div>
                  )}
                  {upload.preview_url || upload.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={upload.preview_url || upload.file_url || ""}
                      alt={upload.file_name || "Artwork preview"}
                      className={`max-h-64 w-full object-contain ${isPrintArea ? "p-6" : "p-3"}`}
                    />
                  ) : (
                    <FileImage className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="grid gap-3 p-4">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {upload.asset_role && (
                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-indigo-700">
                          {roleLabel(upload.asset_role)}
                        </span>
                      )}
                      {upload.print_side && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                          {upload.print_side}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm font-bold">{upload.file_name || "Artwork"}</p>
                    <p className="mt-1 text-xs text-slate-500">{upload.mime_type || upload.upload_status}</p>
                    {upload.placement && Object.keys(upload.placement).length > 0 && (
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                        Placement: {JSON.stringify(upload.placement)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {upload.file_url && (
                      <Button asChild size="sm" className="flex-1">
                        <a href={upload.file_url} download target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                          {isPrintArea ? "Download Print File" : "Download Original"}
                        </a>
                      </Button>
                    )}
                    {upload.preview_url && (
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <a href={upload.preview_url} target="_blank" rel="noreferrer">
                          Preview
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
            })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
