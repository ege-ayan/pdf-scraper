import { Metadata } from "next";
import ResumeDetail from "../_components/resume-detail";

interface ResumeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Simplified metadata - data fetching handled by client component
export async function generateMetadata({ params }: ResumeDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Resume Details - PDF Scraper`,
    description: `View detailed resume information`,
  };
}

export default async function ResumeDetailPage({ params }: ResumeDetailPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto py-8">
        <ResumeDetail resumeId={id} />
      </div>
    </div>
  );
}
