import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArtworkUpload } from "@/features/admin/types/database";

export default function ArtworkGallery({ uploads }: { uploads: ArtworkUpload[] }) {
  return (
    <Card id="artwork">
      <CardHeader>
        <CardTitle>Artwork Management</CardTitle>
      </CardHeader>
      <CardContent>
        {!uploads.length ? (
          <p className="text-sm text-slate-500">No artwork uploads are attached to this order.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {uploads.map((upload) => (
              <article key={upload.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid min-h-48 place-items-center bg-slate-100">
                  {upload.preview_url || upload.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={upload.preview_url || upload.file_url || ""}
                      alt={upload.file_name || "Artwork preview"}
                      className="max-h-64 w-full object-contain p-3"
                    />
                  ) : (
                    <FileImage className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="grid gap-3 p-4">
                  <div>
                    <p className="truncate text-sm font-bold">{upload.file_name || "Artwork"}</p>
                    <p className="mt-1 text-xs text-slate-500">{upload.mime_type || upload.upload_status}</p>
                  </div>
                  <div className="flex gap-2">
                    {upload.file_url && (
                      <Button asChild size="sm" className="flex-1">
                        <a href={upload.file_url} download target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                          Print File
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
