import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Certificates" };

export default async function AdminCertificatesPage() {
  const supabase = await createClient();

  const { data: certs } = await supabase
    .from("certificates")
    .select(
      "id, verification_code, recipient_name, issued_at, course_id, track_id, courses(title), tracks(title)"
    )
    .order("issued_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        <span className="text-sm text-muted-foreground">
          {certs?.length ?? 0} issued
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recipient</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">For</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Issued</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {certs?.map((c) => {
              type EntityRow = { title: string };
              const course = (Array.isArray(c.courses) ? c.courses[0] : c.courses) as EntityRow | null;
              const track  = (Array.isArray(c.tracks)  ? c.tracks[0]  : c.tracks)  as EntityRow | null;
              const entityTitle = course?.title ?? track?.title ?? "—";
              const entityType  = c.course_id ? "course" : "track";

              return (
                <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {c.recipient_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{entityTitle}</span>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {entityType}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {new Date(c.issued_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/verify/${c.verification_code}`}
                      target="_blank"
                      className="flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                    >
                      {c.verification_code}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!certs || certs.length === 0) && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No certificates issued yet.
          </div>
        )}
      </div>
    </div>
  );
}
