"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Trash2, Download, Loader2 } from "lucide-react";
import Link from "next/link";

import ProfileSection from "./sections/profile-section";
import WorkExperienceSection from "./sections/work-experience-section";
import EducationSection from "./sections/education-section";
import SkillsSection from "./sections/skills-section";
import LanguagesSection from "./sections/languages-section";
import LicensesSection from "./sections/licenses-section";
import AchievementsSection from "./sections/achievements-section";
import PublicationsSection from "./sections/publications-section";
import HonorsSection from "./sections/honors-section";
import RawDataDialog from "./raw-data-dialog";
import { useResumeDetail } from "../_hooks/use-resume-detail";
import { useDeleteResume } from "../_hooks/use-resume-history";
import { logger } from "@/lib/logger";

interface ResumeDetailProps {
  resumeId: string;
}

export default function ResumeDetail({ resumeId }: ResumeDetailProps) {
  const router = useRouter();
  const { resumeData, isLoading, isError, error } = useResumeDetail({
    resumeId,
  });
  const { mutateAsync: deleteResume, isPending: isDeleting } =
    useDeleteResume();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteResume(resumeId);
      router.push("/dashboard/history");
    } catch (error) {
      logger.error("Error deleting resume", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading resume...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium mb-2">
          {error instanceof Error ? error.message : "Failed to load resume"}
        </p>
        <Button asChild>
          <Link href="/dashboard/history">Back to History</Link>
        </Button>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Resume not found</p>
        <Button asChild>
          <Link href="/dashboard/history">Back to History</Link>
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
    <div className="mx-auto space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <Button
          variant="outline"
          asChild
          className="flex items-center gap-2 cursor-pointer w-full md:w-auto"
        >
          <Link href="/dashboard/history">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>
        <div className="flex flex-col gap-2 md:flex-row">
          <RawDataDialog resumeData={resumeData} />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="flex items-center gap-2 cursor-pointer w-full md:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <ProfileSection profile={profile} />

      <WorkExperienceSection workExperiences={workExperiences} />

      <EducationSection educations={educations} />

      <SkillsSection skills={skills} />

      <LanguagesSection languages={languages} />

      <LicensesSection licenses={licenses} />

      <AchievementsSection achievements={achievements} />

      <PublicationsSection publications={publications} />

      <HonorsSection honors={honors} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be
              undone and all extracted data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Resume
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
