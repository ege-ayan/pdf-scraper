"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PdfDropzone from "./pdf-dropzone";
import { useResumeProcessing } from "../_hooks/use-resume-processing";
import { ProcessingStep } from "@/types";
import { CREDITS_PER_SCRAPE } from "@/lib/constants";
import { Loader2, CheckCircle, FileText, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function ResumeUploader() {
  const {
    selectedFile,
    currentStep,
    isProcessing,
    processedResumeData,
    selectFile,
    startProcessing,
    canStartProcessing,
    hasFile,
    isComplete,
  } = useResumeProcessing();

  useEffect(() => {
    if (isComplete) {
      setTimeout(() => {
        const resultsElement = document.getElementById("results");
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);
    }
  }, [isComplete]);

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
                  `Start Processing (${CREDITS_PER_SCRAPE} credits)`
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

      {isComplete && processedResumeData && (
        <Card className="border-green-200 bg-green-50" id="results">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Success Header */}
              <div className="text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                <h3 className="font-medium text-green-800">
                  Resume Processed Successfully!
                </h3>
                <p className="text-sm text-green-700">
                  Your resume data has been extracted and saved to your account.
                </p>
              </div>

              {/* Extracted Resume Data Display */}
              {processedResumeData.resumeHistory &&
                processedResumeData.resumeHistory.resumeData &&
                (() => {
                  const resumeData =
                    processedResumeData.resumeHistory.resumeData;
                  return (
                    <div className="bg-white rounded-lg border p-6 space-y-6">
                      <h4 className="font-semibold text-lg mb-4">
                        Extracted Resume Data
                      </h4>

                      {/* Profile Section */}
                      {resumeData.profile && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Profile
                          </h5>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {resumeData.profile.name}{" "}
                                {resumeData.profile.surname}
                              </span>
                            </div>
                            {resumeData.profile.headline && (
                              <p className="text-sm text-muted-foreground">
                                {resumeData.profile.headline}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {resumeData.profile.email && (
                                <span> {resumeData.profile.email}</span>
                              )}
                              {resumeData.profile.phone && (
                                <span>{resumeData.profile.phone}</span>
                              )}
                            </div>
                            {(resumeData.profile.city ||
                              resumeData.profile.country) && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>
                                  {resumeData.profile.city}
                                  {resumeData.profile.city &&
                                    resumeData.profile.country &&
                                    ", "}
                                  {resumeData.profile.country}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Work Experience Section */}
                      {resumeData.workExperiences &&
                        resumeData.workExperiences.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Work Experience
                            </h5>
                            <div className="space-y-3">
                              {resumeData.workExperiences.map(
                                (exp: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-4 space-y-2"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h6 className="font-medium">
                                          {exp.jobTitle}
                                        </h6>
                                        <p className="text-sm text-muted-foreground">
                                          {exp.company}
                                        </p>
                                      </div>
                                      {exp.current && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                          Current
                                        </span>
                                      )}
                                    </div>
                                    {exp.description && (
                                      <p className="text-sm text-gray-700">
                                        {exp.description}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Skills Section */}
                      {resumeData.skills && resumeData.skills.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Skills
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map(
                              (skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Education Section */}
                      {resumeData.educations &&
                        resumeData.educations.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Education
                            </h5>
                            <div className="space-y-2">
                              {resumeData.educations.map(
                                (edu: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {edu.school}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {edu.degree}{" "}
                                          {edu.major && `in ${edu.major}`}
                                        </p>
                                      </div>
                                      {edu.endYear && (
                                        <span className="text-xs text-muted-foreground">
                                          {edu.endYear}
                                        </span>
                                      )}
                                    </div>
                                    {edu.description && (
                                      <p className="text-sm text-gray-700 mt-2">
                                        {edu.description}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Languages Section */}
                      {resumeData.languages &&
                        resumeData.languages.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Languages
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {resumeData.languages.map(
                                (lang: any, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                                  >
                                    {lang.language} ({lang.level})
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Licenses & Certifications Section */}
                      {resumeData.licenses &&
                        resumeData.licenses.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Licenses & Certifications
                            </h5>
                            <div className="space-y-2">
                              {resumeData.licenses.map(
                                (license: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {license.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {license.issuer} • {license.issueYear}
                                        </p>
                                      </div>
                                    </div>
                                    {license.description && (
                                      <p className="text-sm text-gray-700 mt-2">
                                        {license.description}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Achievements Section */}
                      {resumeData.achievements &&
                        resumeData.achievements.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Achievements
                            </h5>
                            <div className="space-y-2">
                              {resumeData.achievements.map(
                                (achievement: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {achievement.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {achievement.organization} •{" "}
                                          {achievement.achieveDate}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-2">
                                      {achievement.description}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Publications Section */}
                      {resumeData.publications &&
                        resumeData.publications.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                              Publications
                            </h5>
                            <div className="space-y-2">
                              {resumeData.publications.map(
                                (pub: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium text-sm">
                                          {pub.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {pub.publisher} •{" "}
                                          {pub.publicationDate}
                                        </p>
                                      </div>
                                    </div>
                                    {pub.publicationUrl && (
                                      <a
                                        href={pub.publicationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                                      >
                                        {pub.publicationUrl}
                                      </a>
                                    )}
                                    <p className="text-sm text-gray-700 mt-2">
                                      {pub.description}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Honors & Awards Section */}
                      {resumeData.honors && resumeData.honors.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                            Honors & Awards
                          </h5>
                          <div className="space-y-2">
                            {resumeData.honors.map(
                              (honor: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-sm">
                                        {honor.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {honor.issuer} • {honor.issueMonth}/
                                        {honor.issueYear}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-2">
                                    {honor.description}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Display Raw File
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Raw Resume Data (JSON)</DialogTitle>
                    </DialogHeader>
                    <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(
                        processedResumeData.resumeHistory.resumeData,
                        null,
                        2
                      )}
                    </pre>
                  </DialogContent>
                </Dialog>
                <Button asChild>
                  <Link href="/dashboard/history">View in History</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to initial state to allow scraping another resume
                    window.location.reload();
                  }}
                >
                  Scrape Another Resume
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
