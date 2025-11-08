import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  redirect("/dashboard");
}
