import { Metadata } from "next";
import SubscriptionManager from "./_components/subscription-manager";

export const metadata: Metadata = {
  title: "Settings - PDF Scraper",
  description: "Manage your subscription and billing settings",
};

interface SettingsPageProps {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
  }>;
}

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { success, canceled } = await searchParams;

  return (
    <div className=" p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing preferences
          </p>
        </div>

        <SubscriptionManager success={success} canceled={canceled} />
      </div>
    </div>
  );
}
