"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar } from "lucide-react";
import { ResumeData } from "@/lib/types";
import { DEGREE_LABELS } from "@/lib/constants/labels";

interface EducationSectionProps {
  educations: ResumeData["educations"];
}

export default function EducationSection({ educations }: EducationSectionProps) {
  if (educations.length === 0) return null;

  return (
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
                  {DEGREE_LABELS[edu.degree as keyof typeof DEGREE_LABELS] || edu.degree}
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
  );
}
