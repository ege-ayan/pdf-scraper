"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeData } from "@/lib/types";
import { LANGUAGE_LEVEL_LABELS } from "@/lib/constants/labels";

interface LanguagesSectionProps {
  languages: ResumeData["languages"];
}

export default function LanguagesSection({ languages }: LanguagesSectionProps) {
  if (languages.length === 0) return null;

  return (
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
                <Badge variant="outline">
                  {LANGUAGE_LEVEL_LABELS[lang.level as keyof typeof LANGUAGE_LEVEL_LABELS] || lang.level}
                </Badge>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
