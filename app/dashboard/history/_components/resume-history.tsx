"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useResumeHistory } from "../_hooks/use-resume-history";
import HistoryCard from "./history-card";

export interface ResumeHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  resumeData: any;
}

export default function ResumeHistory() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useResumeHistory();

  const history = data?.pages.flatMap((page) => page.items) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">
          Loading resume history...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className=" mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive font-medium">
              Failed to load history
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className=" mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No resumes uploaded yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by uploading your first resume to see the extracted data
              here.
            </p>
            <Button asChild>
              <Link href="/dashboard/home">Upload Resume</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalCount} resume{totalCount !== 1 ? "s" : ""} uploaded
        </p>
      </div>

      <div className="grid gap-4">
        {history.map((item: ResumeHistoryItem) => (
          <HistoryCard key={item.id} item={item} />
        ))}

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading more resumes...
            </span>
          </div>
        )}

        <div ref={loadMoreRef} className="h-4" />
      </div>
    </div>
  );
}
