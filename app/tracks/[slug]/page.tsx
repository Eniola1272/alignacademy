import type { Metadata } from "next";
import { Construction } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function TrackDetailPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <p className="text-xs font-mono text-muted-foreground mb-4">/tracks/{slug}</p>
      <h1 className="text-3xl font-bold tracking-tight mb-8 capitalize">
        {slug.replace(/-/g, " ")}
      </h1>

      {/* Phase 3: track detail + course list */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Track detail · Phase 3
        </p>
      </div>
    </div>
  );
}
