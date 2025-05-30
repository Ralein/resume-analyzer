"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Download, Share2, CheckCircle, XCircle, AlertCircle, Briefcase, FileText, Loader2 } from "lucide-react"
import celebrationAnimation from "@/animations/celebration-animation.json"
import { compareWithJobDescription } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { exportAnalysisAsPDF } from "@/lib/pdf-export"
import Link from "next/link"

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

interface AnalysisResultsProps {
  resume: Resume
  analysis: Analysis
}

export function AnalysisResults({ resume, analysis }: AnalysisResultsProps) {
  const [showCelebration, setShowCelebration] = useState(true)
  const [jobDescription, setJobDescription] = useState(analysis.job_description || "")
  const [isComparing, setIsComparing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const analysisContentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Hide celebration animation after 3 seconds
  setTimeout(() => {
    setShowCelebration(false)
  }, 3000)

  // Handle missing data
  if (!resume || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-gray-500">Analysis data is not available.</p>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Improvement"
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return "text-green-500"
    if (score >= 0.6) return "text-yellow-500"
    return "text-red-500"
  }

  const handleCompare = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter a job description to compare with your resume.",
        variant: "destructive",
      })
      return
    }

    setIsComparing(true)

    try {
      const result = await compareWithJobDescription(resume.id, jobDescription)

      if (result.success) {
        toast({
          title: "Comparison complete",
          description: "Your resume has been compared with the job description.",
        })

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        throw new Error(result.error || "Failed to compare with job description")
      }
    } catch (error) {
      console.error("Error comparing with job description:", error)
      toast({
        title: "Error",
        description: "Failed to compare with job description. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsComparing(false)
    }
  }

  const handleExportPDF = async () => {
    if (!analysisContentRef.current) return

    setIsExporting(true)
    toast({
      title: "Preparing PDF",
      description: "Please wait while we generate your PDF...",
    })

    try {
      const fileName = `Resume_Analysis_${resume.file_name.replace(/\.[^/.]+$/, "")}`
      const success = await exportAnalysisAsPDF("analysis-content", fileName)

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
    <div className="space-y-8">
      {showCelebration && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full max-w-md">
            <Lottie animationData={celebrationAnimation} loop={false} className="w-full h-full" />
          </div>
        </motion.div>
      )}
      <div className="flex justify-end">
        <Button onClick={handleExportPDF} disabled={isExporting} className="mb-4">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </>
          )}
        </Button>
      </div>
      <div id="analysis-content" ref={analysisContentRef}>
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div
            className="w-full md:w-1/3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Score</CardTitle>
                  <CardDescription>Overall quality assessment</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 dark:text-gray-800"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-primary"
                        strokeWidth="10"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * analysis.score) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{getScoreText(analysis.score)}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Content</span>
                      <span>{Math.min(100, analysis.score + 5)}%</span>
                    </div>
                    <Progress value={Math.min(100, analysis.score + 5)} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span>Format</span>
                      <span>{Math.min(100, analysis.score - 5)}%</span>
                    </div>
                    <Progress value={Math.min(100, analysis.score - 5)} className="h-2" />

                    <div className="flex justify-between text-sm">
                      <span>Keywords</span>
                      <span>{Math.min(100, analysis.score - 10)}%</span>
                    </div>
                    <Progress value={Math.min(100, analysis.score - 10)} className="h-2" />
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/analysis/${resume.id}/export`}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </CardContent>
              </Card>

              {analysis.suggested_role && (
                <Card>
                  <CardHeader>
                    <CardTitle>Suggested Role</CardTitle>
                    <CardDescription>Based on your resume content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <span className="text-lg font-medium">{analysis.suggested_role}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.similarity_score !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>Job Match</CardTitle>
                    <CardDescription>Similarity to job description</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Match Score</span>
                      <span className={`font-bold ${getSimilarityColor(analysis.similarity_score)}`}>
                        {Math.round(analysis.similarity_score * 100)}%
                      </span>
                    </div>
                    <Progress value={analysis.similarity_score * 100} className="h-2" />
                    {analysis.similarity_explanation && (
                      <div className="pt-2 text-sm text-gray-600 dark:text-gray-400">
                        {analysis.similarity_explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>

          <motion.div
            className="w-full md:w-2/3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="strengths">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>

              <TabsContent value="strengths" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Strengths</CardTitle>
                    <CardDescription>What your resume does well</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weaknesses" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weaknesses</CardTitle>
                    <CardDescription>Areas that need improvement</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                    <CardDescription>Recommendations to improve your resume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="keywords" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Keywords Analysis</CardTitle>
                    <CardDescription>Keywords found and missing in your resume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Keywords Found</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords_found.map((keyword, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                {keyword}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Keywords Missing</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords_missing.map((keyword, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              >
                                {keyword}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>{" "}
      {/* Close the analysis-content div */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Full Analysis</CardTitle>
            <CardDescription>Detailed feedback on your resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              {analysis.full_analysis.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Job Description Comparison</CardTitle>
            <CardDescription>Compare your resume with a job description to see how well it matches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-primary mt-1" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paste a job description below to see how well your resume matches the requirements.
                </p>
              </div>
              <Textarea
                placeholder="Paste job description here..."
                className="min-h-[200px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCompare} disabled={isComparing || !jobDescription.trim()}>
              {isComparing ? "Comparing..." : "Compare with Job Description"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
