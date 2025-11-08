import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, History, FileText } from "lucide-react";
import ResumeUploader from "./_components/resume-uploader";

export const metadata: Metadata = {
  title: "PDF Scraper - Dashboard",
  description: "Upload and parse resume PDFs using AI",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Resume PDF Parser
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your resume PDF and let AI extract structured data
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-primary" />
                <CardTitle>Upload Resume</CardTitle>
              </div>
              <CardDescription>
                Upload a new PDF resume for AI-powered data extraction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Supported formats: PDF (max 10MB)
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>View History</CardTitle>
              </div>
              <CardDescription>
                Browse all your previously uploaded resumes and extracted data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/history">
                  <History className="h-4 w-4 mr-2" />
                  View Resume History
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <ResumeUploader />
      </div>
    </div>
  );
}
