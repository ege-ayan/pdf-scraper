"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Globe, ExternalLink } from "lucide-react";
import { ResumeData } from "@/types";

interface ProfileSectionProps {
  profile: ResumeData["profile"];
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
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
  );
}
