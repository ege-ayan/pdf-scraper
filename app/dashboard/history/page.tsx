import { Metadata } from "next";
import ResumeHistory from "./_components/resume-history";

export const metadata: Metadata = {
  title: "PDF Scraper - History",
  description: "View your uploaded resume files and extracted data",
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Resume History</h1>
          <p className="text-muted-foreground mt-2">
            View all your uploaded resumes and their extracted data
          </p>
        </div>

        <ResumeHistory />
      </div>
    </div>
  );
}
