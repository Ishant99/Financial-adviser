"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecommendations, useGenerateRecommendations } from "@/lib/queries/useRecommendations";

const SEVERITY_STYLES: Record<string, string> = {
  ActNow: "bg-red-900 text-red-300 border-red-800",
  Watch: "bg-yellow-900 text-yellow-300 border-yellow-800",
  Info: "bg-blue-900 text-blue-300 border-blue-800",
};

export function RecommendationFeed() {
  const { data: recs = [], isLoading } = useRecommendations(5);
  const generate = useGenerateRecommendations();

  return (
    <Card className="glass-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-400">AI Recommendations</CardTitle>
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
          >
            {generate.isPending ? "Generating…" : "Refresh"}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : recs.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-gray-500 mb-3">No recommendations yet</p>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
            >
              {generate.isPending ? "Generating…" : "Generate your first recommendations →"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recs.map((rec) => (
              <div key={rec.id} className="border-l-2 border-gray-700 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-xs ${SEVERITY_STYLES[rec.severity] ?? ""}`}
                  >
                    {rec.severity}
                  </Badge>
                  <p className="text-sm font-medium text-gray-200">{rec.title}</p>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{rec.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
