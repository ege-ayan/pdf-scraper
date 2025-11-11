"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { DEGREE_LABELS, LANGUAGE_LEVEL_LABELS } from "@/lib/constants";
import RawDataDialog from "../../history/_components/raw-data-dialog";

interface ProcessedResumeDisplayProps {
  processedResumeData: any;
  onReset?: () => void;
}

export default function ProcessedResumeDisplay({
  processedResumeData,
  onReset,
}: ProcessedResumeDisplayProps) {
  return (
    <Card className="border-green-200 bg-green-50" id="results">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
            <h3 className="font-medium text-green-800">
              Resume Processed Successfully!
            </h3>
            <p className="text-sm text-green-700">
              Your resume data has been extracted and saved to your account.
            </p>
          </div>

          {processedResumeData.resumeHistory &&
            processedResumeData.resumeHistory.resumeData &&
            (() => {
              const resumeData = processedResumeData.resumeHistory.resumeData;
              return (
                <div className="bg-white rounded-lg border p-6 space-y-6">
                  <h4 className="font-semibold text-lg mb-4">
                    Extracted Resume Data
                  </h4>

                  {resumeData.profile && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Profile
                      </h5>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {resumeData.profile.name}{" "}
                            {resumeData.profile.surname}
                          </span>
                        </div>
                        {resumeData.profile.headline && (
                          <p className="text-sm text-muted-foreground">
                            {resumeData.profile.headline}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {resumeData.profile.email && (
                            <span> {resumeData.profile.email}</span>
                          )}
                          {resumeData.profile.phone && (
                            <span>{resumeData.profile.phone}</span>
                          )}
                        </div>
                        {(resumeData.profile.city ||
                          resumeData.profile.country) && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>
                              {resumeData.profile.city}
                              {resumeData.profile.city &&
                                resumeData.profile.country &&
                                ", "}
                              {resumeData.profile.country}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {resumeData.workExperiences &&
                    resumeData.workExperiences.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Work Experience
                        </h5>
                        <div className="space-y-3">
                          {resumeData.workExperiences.map(
                            (exp: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 space-y-2"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h6 className="font-medium">
                                      {exp.jobTitle}
                                    </h6>
                                    <p className="text-sm text-muted-foreground">
                                      {exp.company}
                                    </p>
                                  </div>
                                  {exp.current && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                {exp.description && (
                                  <p className="text-sm text-gray-700">
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {resumeData.skills && resumeData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Skills
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map(
                          (skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {resumeData.educations &&
                    resumeData.educations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Education
                        </h5>
                        <div className="space-y-2">
                          {resumeData.educations.map(
                            (edu: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {edu.school}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {DEGREE_LABELS[
                                        edu.degree as keyof typeof DEGREE_LABELS
                                      ] || edu.degree}{" "}
                                      {edu.major && `in ${edu.major}`}
                                    </p>
                                  </div>
                                  {edu.endYear && (
                                    <span className="text-xs text-muted-foreground">
                                      {edu.endYear}
                                    </span>
                                  )}
                                </div>
                                {edu.description && (
                                  <p className="text-sm text-gray-700 mt-2">
                                    {edu.description}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {resumeData.languages && resumeData.languages.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Languages
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.languages.map(
                          (lang: any, index: number) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                            >
                              {lang.language} (
                              {LANGUAGE_LEVEL_LABELS[
                                lang.level as keyof typeof LANGUAGE_LEVEL_LABELS
                              ] || lang.level}
                              )
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {resumeData.licenses && resumeData.licenses.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Licenses & Certifications
                      </h5>
                      <div className="space-y-2">
                        {resumeData.licenses.map(
                          (license: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">
                                    {license.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {license.issuer} • {license.issueYear}
                                  </p>
                                </div>
                              </div>
                              {license.description && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {license.description}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {resumeData.achievements &&
                    resumeData.achievements.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Achievements
                        </h5>
                        <div className="space-y-2">
                          {resumeData.achievements.map(
                            (achievement: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {achievement.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {achievement.organization} •{" "}
                                      {achievement.achieveDate}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mt-2">
                                  {achievement.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {resumeData.publications &&
                    resumeData.publications.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          Publications
                        </h5>
                        <div className="space-y-2">
                          {resumeData.publications.map(
                            (pub: any, index: number) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm">
                                      {pub.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {pub.publisher} • {pub.publicationDate}
                                    </p>
                                  </div>
                                </div>
                                {pub.publicationUrl && (
                                  <a
                                    href={pub.publicationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                                  >
                                    {pub.publicationUrl}
                                  </a>
                                )}
                                <p className="text-sm text-gray-700 mt-2">
                                  {pub.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {resumeData.honors && resumeData.honors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Honors & Awards
                      </h5>
                      <div className="space-y-2">
                        {resumeData.honors.map((honor: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">
                                  {honor.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {honor.issuer} • {honor.issueMonth}/
                                  {honor.issueYear}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">
                              {honor.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          <div className="flex gap-3 justify-center">
            <RawDataDialog
              resumeData={processedResumeData.resumeHistory.resumeData}
            />
            <Button asChild>
              <Link href="/dashboard/history">View in History</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onReset?.();
                // Scroll to top smoothly
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Scrape Another Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
