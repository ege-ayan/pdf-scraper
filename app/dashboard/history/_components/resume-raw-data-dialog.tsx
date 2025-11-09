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

interface ResumeRawDataDialogProps {
  resumeId: string;
  resumeData: any;
}

export default function ResumeRawDataDialog({
  resumeId,
  resumeData,
}: ResumeRawDataDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Raw Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raw Resume Data - {resumeId}</DialogTitle>
        </DialogHeader>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(resumeData, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
