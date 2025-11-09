"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar } from "lucide-react";
import { ResumeData } from "@/types";

interface HonorsSectionProps {
  honors: ResumeData["honors"];
}

export default function HonorsSection({ honors }: HonorsSectionProps) {
  if (honors.length === 0) return null;

  return (
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
  );
}
