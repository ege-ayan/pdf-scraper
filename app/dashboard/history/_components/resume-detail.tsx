"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  BookOpen,
  Star,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ResumeData } from "@/lib/types";
import { toast } from "sonner";

interface ResumeDetailProps {
  resumeId: string;
}

export default function ResumeDetail({ resumeId }: ResumeDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: resumeData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: async () => {
      const response = await fetch(`/api/resume/${resumeId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Resume not found");
        }
        if (response.status === 401) {
          throw new Error("Unauthorized access");
        }
        throw new Error("Failed to fetch resume");
      }
      const data = await response.json();
      return data.resumeData;
    },
  });

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this resume? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete resume");
      }

      toast.success("Resume deleted successfully");
      router.push("/dashboard/history");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading resume...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium mb-2">
          {error instanceof Error ? error.message : "Failed to load resume"}
        </p>
        <Button onClick={() => router.push("/dashboard/history")}>
          Back to History
        </Button>
      </div>
    );
  }

  // No data state
  if (!resumeData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Resume not found</p>
        <Button onClick={() => router.push("/dashboard/history")}>
          Back to History
        </Button>
      </div>
    );
  }

  const {
    profile,
    workExperiences,
    educations,
    skills,
    licenses,
    languages,
    achievements,
    publications,
    honors,
  } = resumeData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/history")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">
                {profile.name} {profile.surname}
              </h3>
              <p className="text-muted-foreground">{profile.headline}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {profile.city}, {profile.country}
                </span>
              </div>
              {profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {profile.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {profile.linkedIn && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    LinkedIn Profile
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Badge variant={profile.relocation ? "default" : "secondary"}>
              {profile.relocation
                ? "Open to Relocation"
                : "Not Open to Relocation"}
            </Badge>
            <Badge variant={profile.remote ? "default" : "secondary"}>
              {profile.remote ? "Open to Remote" : "Not Open to Remote"}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium mb-2">Professional Summary</h4>
            <p className="text-muted-foreground">
              {profile.professionalSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Work Experience */}
      {workExperiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workExperiences.map(
                (exp: ResumeData["workExperiences"][0], index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-semibold">{exp.jobTitle}</h4>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <div className="flex gap-2 mt-2 mb-2">
                      <Badge variant="outline">{exp.employmentType}</Badge>
                      <Badge variant="outline">{exp.locationType}</Badge>
                      {exp.current && <Badge>Current Position</Badge>}
                    </div>
                    {exp.startYear && (
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {exp.startMonth && exp.startYear
                          ? `${exp.startMonth}/${exp.startYear}`
                          : exp.startYear}
                        {exp.endMonth && exp.endYear
                          ? ` - ${exp.endMonth}/${exp.endYear}`
                          : exp.endYear
                          ? ` - ${exp.endYear}`
                          : exp.current
                          ? " - Present"
                          : ""}
                      </p>
                    )}
                    {exp.description && (
                      <p className="mt-2 text-sm">{exp.description}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {educations.map(
                (edu: ResumeData["educations"][0], index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-semibold">{edu.school}</h4>
                    <p className="text-muted-foreground">
                      {edu.degree}
                      {edu.major && ` in ${edu.major}`}
                    </p>
                    <div className="flex gap-2 mt-2 mb-2">
                      {edu.current && <Badge>Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {edu.startYear} -{" "}
                      {edu.endYear || (edu.current ? "Present" : "Unknown")}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm">{edu.description}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map(
                (lang: ResumeData["languages"][0], index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{lang.language}</span>
                    <Badge variant="outline">{lang.level}</Badge>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Licenses & Certifications */}
      {licenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Licenses & Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {licenses.map(
                (license: ResumeData["licenses"][0], index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-semibold">{license.name}</h4>
                    <p className="text-muted-foreground">{license.issuer}</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Issued: {license.issueYear}
                    </p>
                    {license.description && (
                      <p className="mt-2 text-sm">{license.description}</p>
                    )}
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map(
                (achievement: ResumeData["achievements"][0], index: number) => (
                  <div key={index} className="border-l-2 border-muted pl-4">
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-muted-foreground">
                      {achievement.organization}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {achievement.achieveDate}
                    </p>
                    <p className="mt-2 text-sm">{achievement.description}</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publications */}
      {publications.length > 0 && (
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
                        href={pub.publicationUrl}
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
      )}

      {/* Honors & Awards */}
      {honors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Honors & Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {honors.map((honor: ResumeData["honors"][0], index: number) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <h4 className="font-semibold">{honor.title}</h4>
                  <p className="text-muted-foreground">{honor.issuer}</p>
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {honor.issueMonth}/{honor.issueYear}
                  </p>
                  <p className="mt-2 text-sm">{honor.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
