"use client";

import { SparklesIcon } from "lucide-react";
import { useRecommendations, useGenerateRecommendations, useMarkRecommendationRead } from "@/lib/queries/useRecommendations";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { RecommendationDto } from "@/types/api";

const SEVERITY_STYLES: Record<string, string> = {
  ActNow: "bg-red-950 text-red-300 border-red-800",
  Watch: "bg-yellow-950 text-yellow-300 border-yellow-800",
  Info: "bg-blue-950 text-blue-300 border-blue-800",
};

const TYPE_STYLES: Record<string, string> = {
  Action: "text-orange-400",
  Watch: "text-yellow-400",
  Win: "text-green-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RecommendationCard({ rec }: { rec: RecommendationDto }) {
  const markRead = useMarkRecommendationRead();

  return (
    <div
      className={`rounded-2xl p-5 space-y-3 transition-colors glass
        ${rec.isRead ? "opacity-60" : "glass-hover"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold uppercase tracking-wide ${TYPE_STYLES[rec.type] ?? "text-gray-400"}`}>
            {rec.type}
          </span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border
            ${SEVERITY_STYLES[rec.severity] ?? ""}`}>
            {rec.severity}
          </span>
          <span className="text-xs text-gray-500">{rec.category}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-600">{formatDate(rec.generatedAt)}</span>
          {!rec.isRead && (
            <button
              onClick={() => markRead.mutate(rec.id)}
              disabled={markRead.isPending}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Mark read
            </button>
          )}
          {rec.isRead && <span className="text-xs text-gray-700">Read</span>}
        </div>
      </div>
      <p className="text-sm font-medium text-white">{rec.title}</p>
      <p className="text-sm text-gray-400 leading-relaxed">{rec.body}</p>
    </div>
  );
}

export default function RecommendationsPage() {
  const { data: recs = [], isLoading } = useRecommendations(20);
  const generate = useGenerateRecommendations();

  const unread = recs.filter((r) => !r.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        eyebrow="Recommendations"
        title="What To Do Next"
        description={unread > 0 ? `${unread} unread insight${unread !== 1 ? "s" : ""} for you.` : "AI-generated insights based on your finances."}
        actions={
          <Button
            size="sm"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
          >
            <SparklesIcon size={14} className="mr-1" />
            {generate.isPending ? "Generating…" : "Generate new"}
          </Button>
        }
      />

      {generate.error && (
        <ErrorState message={generate.error instanceof Error ? generate.error.message : "Generation failed"} />
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <EmptyState
          icon={SparklesIcon}
          title="No recommendations yet"
          description="Generate AI-powered insights tailored to your spending, investments, and goals."
          action={
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
              <SparklesIcon size={14} className="mr-1" />
              {generate.isPending ? "Generating…" : "Generate recommendations"}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
