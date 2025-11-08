"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, Eye } from "lucide-react";
import Link from "next/link";

interface ResumeHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  resumeData: {
    profile: {
      name: string;
      surname: string;
      email: string;
      headline: string;
    };
    workExperiences: Array<{
      jobTitle: string;
      company: string;
      employmentType: string;
      current: boolean;
    }>;
    educations: Array<{
      school: string;
      degree: string;
      major: string;
    }>;
    skills: string[];
  };
}

export default function ResumeHistory() {
  const {
    data: history,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resume-history"],
    queryFn: async () => {
      const response = await fetch("/api/resume");
      if (!response.ok) {
        throw new Error("Failed to fetch resume history");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">
          Loading resume history...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-destructive font-medium">
              Failed to load history
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No resumes uploaded yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by uploading your first resume to see the extracted data
              here.
            </p>
            <Button asChild>
              <Link href="/dashboard">Upload Resume</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {history.length} resume{history.length !== 1 ? "s" : ""} uploaded
        </p>
      </div>

      <div className="grid gap-6">
        {history.map((item: ResumeHistoryItem) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">
                    {item.fileName}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/history/${item.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Profile Summary */}
              <div>
                <h4 className="font-medium mb-2">Profile</h4>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-medium">
                    {item.resumeData.profile.name}{" "}
                    {item.resumeData.profile.surname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.resumeData.profile.headline}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.resumeData.profile.email}
                  </p>
                </div>
              </div>

              {/* Work Experience Summary */}
              {item.resumeData.workExperiences.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Work Experience</h4>
                  <div className="space-y-2">
                    {item.resumeData.workExperiences
                      .slice(0, 2)
                      .map((exp, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{exp.jobTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {exp.company}
                              </p>
                            </div>
                            <Badge
                              variant={exp.current ? "default" : "secondary"}
                            >
                              {exp.current ? "Current" : "Past"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {item.resumeData.workExperiences.length > 2 && (
                      <p className="text-sm text-muted-foreground">
                        +{item.resumeData.workExperiences.length - 2} more
                        positions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Skills */}
              {item.resumeData.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.resumeData.skills.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {item.resumeData.skills.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.resumeData.skills.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
