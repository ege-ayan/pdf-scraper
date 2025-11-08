-- CreateTable
CREATE TABLE "resume_history" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeData" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "resume_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resume_history" ADD CONSTRAINT "resume_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
