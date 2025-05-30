import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PDFExportView } from "@/components/pdf-export-view"
import { getResumeWithAnalysis } from "@/lib/db"

interface ExportPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ExportPageProps): Promise<Metadata> {
  const resumeId = Number.parseInt(params.id)
  const resume = await getResumeWithAnalysis(resumeId)

  if (!resume) {
    return {
      title: "Export Not Found",
    }
  }

  return {
    title: `Export Analysis for ${resume.file_name} - AI Resume Analyzer`,
    description: "Export your resume analysis as a PDF.",
  }
}

export default async function ExportPage({ params }: ExportPageProps) {
  try {
    const resumeId = Number.parseInt(params.id)

    if (isNaN(resumeId)) {
      notFound()
    }

    const resume = await getResumeWithAnalysis(resumeId)

    if (!resume || !resume.analysis) {
      notFound()
    }

    return <PDFExportView resume={resume} analysis={resume.analysis} />
  } catch (error) {
    console.error("Error loading export page:", error)
    notFound()
  }
}
