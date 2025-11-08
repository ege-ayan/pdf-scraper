"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

export default function PdfDropzone({
  onFileSelect,
  isLoading,
  error,
}: PdfDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          ${error ? "border-destructive/50 bg-destructive/5" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {error ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Upload Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="h-12 w-12 text-primary animate-pulse" />
              <div>
                <p className="text-lg font-medium">Drop your PDF here</p>
                <p className="text-sm text-muted-foreground">
                  Release to start processing
                </p>
              </div>
            </>
          ) : (
            <>
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isLoading ? "Processing..." : "Upload your resume PDF"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop a PDF file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 10MB
                </p>
              </div>
            </>
          )}
        </div>

        {!isLoading && !error && (
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={(e) => {
              e.stopPropagation();
              // Trigger file input click
              const input = document.querySelector(
                'input[type="file"]'
              ) as HTMLInputElement;
              input?.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose PDF File
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">
              Converting PDF and analyzing with AI...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
