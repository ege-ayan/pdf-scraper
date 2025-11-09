"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PdfDropzone from "./pdf-dropzone";
import { useResumeProcessing } from "../_hooks/use-resume-processing";
import { ProcessingStep } from "@/lib/types/enums";
import { Loader2, CheckCircle } from "lucide-react";

export default function ResumeUploader() {
  const {
    selectedFile,
    currentStep,
    isProcessing,
    selectFile,
    startProcessing,
    canStartProcessing,
    hasFile,
    isComplete,
  } = useResumeProcessing();

  const getStepStatus = () => {
    const steps = [
      { key: ProcessingStep.CONVERTING, label: "Converting PDF" },
      { key: ProcessingStep.UPLOADING, label: "Uploading Images" },
      { key: ProcessingStep.SCRAPING, label: "AI Processing" },
      { key: ProcessingStep.COMPLETE, label: "Complete" },
    ];

    return steps.map(({ key, label }) => {
      if (currentStep === key && currentStep !== ProcessingStep.COMPLETE) {
        return (
          <div key={key} className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{label}</span>
          </div>
        );
      } else if (
        (key === ProcessingStep.CONVERTING &&
          [
            ProcessingStep.UPLOADING,
            ProcessingStep.SCRAPING,
            ProcessingStep.COMPLETE,
          ].includes(currentStep)) ||
        (key === ProcessingStep.UPLOADING &&
          [ProcessingStep.SCRAPING, ProcessingStep.COMPLETE].includes(
            currentStep
          )) ||
        (key === ProcessingStep.SCRAPING &&
          currentStep === ProcessingStep.COMPLETE) ||
        (key === ProcessingStep.COMPLETE &&
          currentStep === ProcessingStep.COMPLETE)
      ) {
        return (
          <div key={key} className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{label}</span>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <PdfDropzone
            onFileSelect={selectFile}
            isLoading={isProcessing}
            error={undefined}
          />
        </CardContent>
      </Card>

      {hasFile && !isProcessing && !isComplete && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="font-medium">{selectedFile!.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <Button
                onClick={startProcessing}
                disabled={!canStartProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Start Processing (100 credits)"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-medium text-center">Processing Resume</h3>
              <div className="space-y-3">{getStepStatus()}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-medium text-green-800">
                Resume Processed Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Your resume data has been extracted and saved to your account.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
