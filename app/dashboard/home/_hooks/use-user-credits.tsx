import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PlanType } from "@/lib/types/enums";

interface UserCredits {
  credits: number;
  planType: PlanType;
}

export const useUserCredits = () => {
  return useQuery({
    queryKey: ["user-credits"],
    queryFn: async (): Promise<UserCredits> => {
      const response = await axios.get("/api/user/credits");
      return response.data;
    },
  });
};
