"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import RawDataDialog from "./raw-data-dialog";
import { ResumeHistoryItem } from "./resume-history";

interface HistoryCardProps {
  item: ResumeHistoryItem;
  onDelete: (id: string) => void;
}

export default function HistoryCard({ item, onDelete }: HistoryCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{item.fileName}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <RawDataDialog
              fileName={item.fileName}
              resumeData={item.resumeData}
            />

            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/history/${item.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
