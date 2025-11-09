import { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionManager from "./_components/subscription-manager";

export const metadata: Metadata = {
  title: "Settings - PDF Scraper",
  description: "Manage your subscription and billing settings",
};

interface SettingsPageProps {
  searchParams: {
    success?: string;
    canceled?: string;
  };
}

export default function SettingsPage({ searchParams }: SettingsPageProps) {
  const success = searchParams.success;
  const canceled = searchParams.canceled;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and billing preferences
          </p>
        </div>

        <Suspense fallback={<div>Loading settings...</div>}>
          <SubscriptionManager success={success} canceled={canceled} />
        </Suspense>
      </div>
    </div>
  );
}
