"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PDFExportTemplate } from "@/components/pdf-export-template"
import { exportAnalysisAsPDF } from "@/lib/pdf-export"
import { useToast } from "@/components/ui/use-toast"
import { Download, ArrowLeft, Loader2 } from "lucide-react"

interface Resume {
  id: number
  file_name: string
  file_url: string
  content: string
  analysis: Analysis
}

interface Analysis {
  id: number
  resume_id: number
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords_found: string[]
  keywords_missing: string[]
  full_analysis: string
  suggested_role?: string
  similarity_score?: number
  similarity_explanation?: string
  job_description?: string
}

interface PDFExportViewProps {
  resume: Resume
  analysis: Analysis
}

export function PDFExportView({ resume, analysis }: PDFExportViewProps) {
  const [isExporting, setIsExporting] = useState(false)
  const pdfTemplateRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleExportPDF = async () => {
    setIsExporting(true)
    toast({
      title: "Preparing PDF",
      description: "Please wait while we generate your PDF...",
    })

    try {
      const fileName = `Resume_Analysis_${resume.file_name.replace(/\.[^/.]+$/, "")}`
      const success = await exportAnalysisAsPDF("pdf-template", fileName)

      if (success) {
        toast({
          title: "PDF Generated",
          description: "Your analysis has been exported as a PDF.",
        })
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("Error exporting PDF:", error)
      toast({
        title: "Export Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" asChild>
          <Link href={`/analysis/${resume.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Link>
        </Button>

        <Button onClick={handleExportPDF} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      <div id="pdf-template">
        <PDFExportTemplate ref={pdfTemplateRef} resume={resume} analysis={analysis} />
      </div>
    </div>
  )
}
