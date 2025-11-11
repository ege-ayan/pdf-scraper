"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface UseResumeDetailProps {
  resumeId: string;
}

export function useResumeDetail({ resumeId }: UseResumeDetailProps) {
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

  return {
    resumeData,
    isLoading,
    isError,
    error,
  };
}
