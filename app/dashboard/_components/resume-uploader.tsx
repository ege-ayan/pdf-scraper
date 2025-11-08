"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PdfDropzone from "./pdf-dropzone";
import { useResumeParser } from "../_hooks/use-resume-parser";

export default function ResumeUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const resumeParser = useResumeParser();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      await resumeParser.mutateAsync(file);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <PdfDropzone
            onFileSelect={handleFileSelect}
            isLoading={resumeParser.isPending}
            error={resumeParser.error?.message}
          />
        </CardContent>
      </Card>

      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">File Name:</span>
                <span>{selectedFile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">File Size:</span>
                <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={`font-medium ${
                    resumeParser.isSuccess
                      ? "text-green-600"
                      : resumeParser.isError
                      ? "text-red-600"
                      : resumeParser.isPending
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {resumeParser.isSuccess
                    ? "Processed"
                    : resumeParser.isError
                    ? "Failed"
                    : resumeParser.isPending
                    ? "Processing"
                    : "Ready"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {resumeParser.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Processing Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Resume data has been extracted and logged to the console. Check
                your browser's developer tools (F12) to see the structured JSON
                data.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-mono">
                  📋 Open Developer Tools → Console to view the extracted resume
                  data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
