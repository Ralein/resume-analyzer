"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useUser } from "@clerk/nextjs"
import uploadAnimation from "@/animations/upload-animation.json"
import { analyzeResume } from "@/lib/actions"

export function UploadResume() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const lottieRef = useRef<any>(null)
  const { isSignedIn } = useUser()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file type
      if (
        !["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(
          selectedFile.type,
        )
      ) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file.",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload a resume.",
        variant: "destructive",
      })
      router.push("/sign-in")
      return
    }

    setUploading(true)
    setProgress(0)
    setUploadStatus("Uploading resume...")

    try {
      // Simulate initial upload progress
      const uploadInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 30) {
            clearInterval(uploadInterval)
            return 30
          }
          return prev + 2
        })
      }, 100)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", file.name)

      // Clear upload interval and update status
      setTimeout(() => {
        clearInterval(uploadInterval)
        setProgress(30)
        setUploadStatus("Extracting text from resume...")

        // Simulate text extraction progress
        const extractionInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 50) {
              clearInterval(extractionInterval)
              return 50
            }
            return prev + 2
          })
        }, 100)

        // Clear extraction interval after a delay
        setTimeout(() => {
          clearInterval(extractionInterval)
          setProgress(50)
          setUploadStatus("Analyzing resume with AI (this may take a minute)...")
        }, 2000)
      }, 1500)

      // Start the actual analysis
      const result = await analyzeResume(formData)

      // Set progress to 100% when complete
      setProgress(100)
      setUploadStatus("Analysis complete!")

      if (result.success) {
        toast({
          title: "Resume analyzed successfully",
          description: "Your resume has been analyzed. You'll be redirected to the results page shortly.",
        })

        // Redirect to the analysis page
        setTimeout(() => {
          router.push(`/analysis/${result.resumeId}`)
        }, 1500)
      } else {
        throw new Error(result.error || "Failed to analyze resume")
      }
    } catch (error) {
      console.error("Error uploading resume:", error)
      toast({
        title: "Error analyzing resume",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-40 h-40">
            <Lottie animationData={uploadAnimation} loop={true} lottieRef={lottieRef} className="w-full h-full" />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-medium">Upload Your Resume</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload your resume in PDF or DOCX format to get started.
            </p>
          </div>

          {file ? (
            <div className="w-full space-y-4">
              <div className="flex items-center p-3 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <span className="text-sm font-medium truncate">{file.name}</span>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{progress}% complete</p>
                    <p className="text-xs text-gray-500">{uploadStatus}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1" onClick={() => setFile(null)} disabled={uploading}>
                  Change
                </Button>
                <Button className="flex-1" onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Analyze Resume"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Drag and drop your resume here, or click to browse
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx"
                />
              </div>
              <p className="text-xs text-center text-gray-500">Supported formats: PDF, DOCX (Max size: 5MB)</p>
              <div className="flex items-center justify-center text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>Analysis may take up to 2-3 minutes due to AI processing</span>
              </div>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
