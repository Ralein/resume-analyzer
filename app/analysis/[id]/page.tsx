import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { AnalysisResults } from "@/components/analysis-results"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { getResumeWithAnalysis } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

interface AnalysisPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: AnalysisPageProps): Promise<Metadata> {
  const resumeId = Number.parseInt(params.id)
  const resume = await getResumeWithAnalysis(resumeId)

  if (!resume) {
    return {
      title: "Analysis Not Found",
    }
  }

  return {
    title: `Analysis for ${resume.file_name} - AI Resume Analyzer`,
    description: "View detailed analysis and suggestions for your resume.",
  }
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  try {
    const authResult = await auth();
    const { userId } = authResult;

    if (!userId) {
      redirect("/sign-in")
    }

    const resumeId = Number.parseInt(params.id)

    if (isNaN(resumeId)) {
      notFound()
    }

    const resume = await getResumeWithAnalysis(resumeId)

    if (!resume || !resume.analysis) {
      notFound()
    }

    // Verify that the resume belongs to the current user
    if (resume.user_id !== userId) {
      redirect("/dashboard")
    }

    return (
      <DashboardShell>
        <DashboardHeader
          heading={`Analysis for ${resume.file_name}`}
          text="View detailed analysis and suggestions for your resume."
        />
        <AnalysisResults resume={resume} analysis={resume.analysis} />
      </DashboardShell>
    )
  } catch (error) {
    console.error("Error loading analysis page:", error)
    notFound()
  }
}
