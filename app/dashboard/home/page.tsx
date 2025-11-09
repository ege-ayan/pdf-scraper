import { Metadata } from "next";

import ResumeUploader from "./_components/resume-uploader";

export const metadata: Metadata = {
  title: "PDF Scraper - Dashboard",
  description: "Upload and parse resume PDFs using AI",
};

export default function DashboardPage() {
  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Resume PDF Parser
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your resume PDF and let AI extract structured data
          </p>
        </div>

        <ResumeUploader />
      </div>
    </div>
  );
}
