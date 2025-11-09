"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, ExternalLink } from "lucide-react";
import { ResumeData } from "@/types";

interface PublicationsSectionProps {
  publications: ResumeData["publications"];
}

export default function PublicationsSection({ publications }: PublicationsSectionProps) {
  // Helper function to ensure URL has protocol
  const formatUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  if (publications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Publications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {publications.map(
            (pub: ResumeData["publications"][0], index: number) => (
              <div key={index} className="border-l-2 border-muted pl-4">
                <h4 className="font-semibold">{pub.title}</h4>
                <p className="text-muted-foreground">
                  Published in {pub.publisher}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {pub.publicationDate}
                </p>
                {pub.publicationUrl && (
                  <a
                    href={formatUrl(pub.publicationUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Publication
                  </a>
                )}
                <p className="mt-2 text-sm">{pub.description}</p>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
