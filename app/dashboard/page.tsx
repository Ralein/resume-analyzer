import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ResumeList } from "@/components/resume-list"
import { getUserResumes } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Dashboard - AI Resume Analyzer",
  description: "Manage your resumes and view analysis results.",
}

export default async function DashboardPage() {
  const authResult = await auth();
  const { userId } = authResult;

  if (!userId) {
    redirect("/sign-in")
  }

  const resumes = await getUserResumes(userId)

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your resumes and view analysis results." />
      <div className="grid gap-8">
        <ResumeList resumes={resumes} />
      </div>
    </DashboardShell>
  )
}
