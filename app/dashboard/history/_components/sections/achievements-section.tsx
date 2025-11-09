"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Calendar } from "lucide-react";
import { ResumeData } from "@/types";

interface AchievementsSectionProps {
  achievements: ResumeData["achievements"];
}

export default function AchievementsSection({
  achievements,
}: AchievementsSectionProps) {
  if (achievements.length === 0) return null;

  return (
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
  );
}
