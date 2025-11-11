"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface RawDataDialogProps {
  fileName?: string;
  resumeData: any;
}

function getDisplayTitle(fileName: string | undefined, resumeData: any): string {
  // If we have a filename (from history cards), use it
  if (fileName) {
    return fileName;
  }

  // Otherwise, try to get the person's name from resume data
  if (resumeData?.profile?.name) {
    return `${resumeData.profile.name}${resumeData.profile.surname ? ' ' + resumeData.profile.surname : ''}`;
  }

  // Fallback
  return 'Resume';
}

export default function RawDataDialog({
  fileName,
  resumeData,
}: RawDataDialogProps) {
  const displayTitle = getDisplayTitle(fileName, resumeData);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Raw Data
        </Button>
      </DialogTrigger>
      <DialogContent
        className="overflow-y-auto"
        style={{ width: '95vw', height: '85vh', maxWidth: 'none' }}
      >
        <DialogHeader>
          <DialogTitle>Raw Resume Data - {displayTitle}</DialogTitle>
        </DialogHeader>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(resumeData, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
