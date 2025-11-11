"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const PAGE_SIZE = 6;

export function useResumeHistory() {
  return useInfiniteQuery({
    queryKey: ["resume-history"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axios.get(
        `/api/resume?page=${pageParam}&limit=${PAGE_SIZE}`
      );
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPage : undefined;
    },
    initialPageParam: 1,
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
