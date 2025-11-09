"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar } from "lucide-react";
import { ResumeData } from "@/types";
import { EMPLOYMENT_TYPE_LABELS, LOCATION_TYPE_LABELS } from "@/lib/constants";

interface WorkExperienceSectionProps {
  workExperiences: ResumeData["workExperiences"];
}

export default function WorkExperienceSection({ workExperiences }: WorkExperienceSectionProps) {
  if (workExperiences.length === 0) return null;

  return (
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
                  <Badge variant="outline">
                    {EMPLOYMENT_TYPE_LABELS[exp.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS] || exp.employmentType}
                  </Badge>
                  <Badge variant="outline">
                    {LOCATION_TYPE_LABELS[exp.locationType as keyof typeof LOCATION_TYPE_LABELS] || exp.locationType}
                  </Badge>
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
  );
}
