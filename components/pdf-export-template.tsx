"use client"

import { forwardRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Resume {
  id: number
  file_name: string
  file_url: string
  content: string
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

interface PDFExportTemplateProps {
  resume: Resume
  analysis: Analysis
}

export const PDFExportTemplate = forwardRef<HTMLDivElement, PDFExportTemplateProps>(({ resume, analysis }, ref) => {
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

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Resume Analysis Report</h1>
        <p className="text-gray-500 mt-2">
          {resume.file_name} - Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resume Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-500"
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
                  <span className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                  <span className="text-sm text-gray-500">{getScoreText(analysis.score)}</span>
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
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {analysis.suggested_role && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Suggested Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{analysis.suggested_role}</p>
              </CardContent>
            </Card>
          )}

          {analysis.similarity_score !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Job Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Match Score</span>
                  <span className="font-bold">{Math.round(analysis.similarity_score * 100)}%</span>
                </div>
                <Progress value={analysis.similarity_score * 100} className="h-2" />
                {analysis.similarity_explanation && (
                  <div className="pt-2 text-sm text-gray-600">{analysis.similarity_explanation}</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Keywords Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords_found.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keywords Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords_missing.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Full Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {analysis.full_analysis.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-gray-500 text-sm mt-8">
        <p>Generated by NoviraAI - {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
})

PDFExportTemplate.displayName = "PDFExportTemplate"
