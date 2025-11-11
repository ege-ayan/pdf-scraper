"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface UseResumeDetailProps {
  resumeId: string;
}

export function useResumeDetail({ resumeId }: UseResumeDetailProps) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: resumeData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["resume", resumeId],
    queryFn: async () => {
      const response = await axios.get(`/api/resume/${resumeId}`);
      return response.data.resumeData;
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
      await axios.delete(`/api/resume/${resumeId}`);
      toast.success("Resume deleted successfully");

      // Invalidate the history query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["resume-history"] });
    } catch (error) {
      logger.error("Delete error", error);
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    resumeData,
    isLoading,
    isError,
    error,
    handleDelete,
    isDeleting,
  };
}
