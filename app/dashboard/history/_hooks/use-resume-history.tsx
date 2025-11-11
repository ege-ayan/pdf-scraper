"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ResumeHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  resumeData: {
    profile: {
      name: string;
      surname: string;
      email: string;
      headline: string;
    };
    workExperiences: Array<{
      jobTitle: string;
      company: string;
      employmentType: string;
      current: boolean;
    }>;
    educations: Array<{
      school: string;
      degree: string;
      major: string;
    }>;
    skills: string[];
  };
}

export function useResumeHistory() {
  return useQuery({
    queryKey: ["resume-history"],
    queryFn: async (): Promise<ResumeHistoryItem[]> => {
      const response = await axios.get("/api/resume");
      return response.data;
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/resume/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-history"] });
      toast.success("Resume deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete resume");
    },
  });
}
