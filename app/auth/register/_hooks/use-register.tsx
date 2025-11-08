import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterCredentials) => {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      return response.data;
    },
    onSuccess: async (data, variables) => {
      toast.success("Account created successfully!");

      const signInResult = await signIn("credentials", {
        redirect: false,
        email: variables.email,
        password: variables.password,
      });

      if (signInResult?.ok) {
        return signInResult;
      } else {
        toast.success("Account created! Please sign in.");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
    },
  });
}
