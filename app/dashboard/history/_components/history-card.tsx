"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Eye, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import RawDataDialog from "./raw-data-dialog";
import { ResumeHistoryItem } from "./resume-history";
import { useDeleteResume } from "../_hooks/use-resume-history";

interface HistoryCardProps {
  item: ResumeHistoryItem;
}

export default function HistoryCard({ item }: HistoryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutateAsync: deleteResume, isPending } = useDeleteResume();

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteResume(item.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">{item.fileName}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-2">
            <RawDataDialog
              fileName={item.fileName}
              resumeData={item.resumeData}
            />

            <Button
              variant="outline"
              size="sm"
              asChild
              className="cursor-pointer w-full sm:w-auto"
            >
              <Link href={`/dashboard/history/${item.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </Link>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isPending}
              className="cursor-pointer w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Deleting...</span>
                  <span className="sm:hidden">Deleting</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Delete</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{item.fileName}</strong>?
              This action cannot be undone and all extracted data will be
              permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Resume
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
