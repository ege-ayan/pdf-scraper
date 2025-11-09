"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar } from "lucide-react";
import { ResumeData } from "@/types";

interface LicensesSectionProps {
  licenses: ResumeData["licenses"];
}

export default function LicensesSection({ licenses }: LicensesSectionProps) {
  if (licenses.length === 0) return null;

  return (
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
  );
}
