"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { FileText, ChevronRight, BarChart, Briefcase, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { deleteResumeAction } from "@/lib/actions"

interface Resume {
  id: number
  file_name: string
  created_at: string
  analysis?: {
    id: number
    score: number
    suggested_role?: string
  }
}

interface ResumeListProps {
  resumes: Resume[]
}

export function ResumeList({ resumes: initialResumes }: ResumeListProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes)
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async (resumeId: number) => {
    setIsDeleting(true)

    try {
      const result = await deleteResumeAction(resumeId)

      if (result.success) {
        setResumes(resumes.filter((resume) => resume.id !== resumeId))
        toast({
          title: "Resume deleted",
          description: "The resume has been successfully deleted.",
        })
      } else {
        throw new Error(result.error || "Failed to delete resume")
      }
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast({
        title: "Error",
        description: "Failed to delete the resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setResumeToDelete(null)
    }
  }

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No resumes yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload your first resume to get started.</p>
          <Button asChild>
            <Link href="/">Upload Resume</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
        <Button asChild>
          <Link href="/">Upload New</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {resumes.map((resume, index) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center p-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/analysis/${resume.id}`} className="block">
                      <h3 className="text-lg font-medium truncate hover:text-primary transition-colors">
                        {resume.file_name}
                      </h3>
                    </Link>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="mr-3">
                        Uploaded {formatDistanceToNow(new Date(resume.created_at), { addSuffix: true })}
                      </span>
                      {resume.analysis?.suggested_role && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          <span>{resume.analysis.suggested_role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resume.analysis ? (
                      <div className="flex items-center mr-4">
                        <BarChart className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="font-medium">{resume.analysis.score}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-yellow-500 mr-2">Processing</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResumeToDelete(resume.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/analysis/${resume.id}`}>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={resumeToDelete !== null} onOpenChange={(open) => !open && setResumeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resume and all associated analysis data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (resumeToDelete !== null) {
                  handleDelete(resumeToDelete)
                }
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
