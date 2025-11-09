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
  fileName: string;
  resumeData: any;
}

export default function RawDataDialog({
  fileName,
  resumeData,
}: RawDataDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-1" />
          Raw Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raw Resume Data - {fileName}</DialogTitle>
        </DialogHeader>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
          {JSON.stringify(resumeData, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
