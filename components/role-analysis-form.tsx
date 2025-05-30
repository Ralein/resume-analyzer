"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Search,
  Copy,
  FileText,
  Code,
  Users,
  Wrench,
  GraduationCap,
  Award,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeRole } from "@/lib/actions"
import { compareWithJobDescription } from "@/lib/actions"

export function RoleAnalysisForm() {
  const [skills, setSkills] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [roleAnalysis, setRoleAnalysis] = useState<{
    role: string
    analysis: string
    skills: string[]
  } | null>(null)
  const [resumes, setResumes] = useState<{ id: number; file_name: string }[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const analysisRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!skills.trim()) {
      toast({
        title: "Skills required",
        description: "Please enter at least one skill to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus("Analyzing skills...")

    try {
      const formData = new FormData()
      formData.append("skills", skills)

      setAnalysisStatus("Identifying suitable role...")

      // Small delay to show status updates
      await new Promise((resolve) => setTimeout(resolve, 10000))

      const result = await analyzeRole(formData)

      if (result.success) {
        setAnalysisStatus("Generating detailed role analysis...")

        // Small delay to show status updates
        await new Promise((resolve) => setTimeout(resolve, 10000))

        setRoleAnalysis(prev => ({
          ...prev,
          role: result.role ?? prev?.role ?? "",
          analysis: result.analysis ?? prev?.analysis ?? "",
          skills: Array.isArray(result.skills) ? result.skills : prev?.skills ?? [],
        }))

        setAnalysisStatus("Analysis complete!")

        // Scroll to analysis results after a short delay
        setTimeout(() => {
          if (analysisRef.current) {
            analysisRef.current.scrollIntoView({ behavior: "smooth" })
          }
        }, 10000)

        // Fetch user's resumes for comparison
        try {
          const response = await fetch("/api/resumes")
          if (response.ok) {
            const userResumes = await response.json()
            setResumes(userResumes)
          }
        } catch (error) {
          console.error("Error fetching resumes:", error)
        }
      } else {
        throw new Error(result.error || "Failed to analyze role")
      }
    } catch (error) {
      toast({
        title: "Error analyzing role",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopyAnalysis = () => {
    if (!roleAnalysis) return

    navigator.clipboard.writeText(roleAnalysis.analysis)
    toast({
      title: "Copied to clipboard",
      description: "The role analysis has been copied to your clipboard.",
    })
  }

  const handleCompare = async () => {
    if (!roleAnalysis || !selectedResumeId) {
      toast({
        title: "Selection required",
        description: "Please select a resume to compare with the role analysis.",
        variant: "destructive",
      })
      return
    }

    setIsComparing(true)

    try {
      const result = await compareWithJobDescription(selectedResumeId, roleAnalysis.analysis)

      if (result.success) {
        toast({
          title: "Comparison complete",
          description: "Your resume has been compared with the role analysis.",
        })

        // Redirect to the analysis page
        router.push(`/analysis/${selectedResumeId}`)
      } else {
        throw new Error(result.error || "Failed to compare with role analysis")
      }
    } catch (error) {
      toast({
        title: "Error comparing with role analysis",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsComparing(false)
    }
  }

  // Function to parse and structure the analysis content
  const parseAnalysisContent = (analysis: string) => {
    const sections: Record<string, string[]> = {
      technicalSkills: [],
      softSkills: [],
      tools: [],
      experienceLevel: [],
      certifications: [],
      careerPath: [],
      keyResponsibilities: [],
      other: [],
    }

    let currentSection = "other"

    analysis.split("\n").forEach((line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) return

      if (trimmedLine.toLowerCase().includes("technical skills")) {
        currentSection = "technicalSkills"
      } else if (trimmedLine.toLowerCase().includes("soft skills")) {
        currentSection = "softSkills"
      } else if (trimmedLine.toLowerCase().includes("tools")) {
        currentSection = "tools"
      } else if (trimmedLine.toLowerCase().includes("experience level")) {
        currentSection = "experienceLevel"
      } else if (trimmedLine.toLowerCase().includes("certifications")) {
        currentSection = "certifications"
      } else if (trimmedLine.toLowerCase().includes("career path")) {
        currentSection = "careerPath"
      } else if (
        trimmedLine.toLowerCase().includes("key responsibilities") ||
        trimmedLine.toLowerCase().includes("responsibilities")
      ) {
        currentSection = "keyResponsibilities"
      } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("•")) {
        sections[currentSection].push(trimmedLine.substring(1).trim())
      } else if (trimmedLine.startsWith("#")) {
        // Skip headers as we're organizing by content
      } else {
        sections[currentSection].push(trimmedLine)
      }
    })

    return sections
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Skills</CardTitle>
          <CardDescription>
            Enter your technical skills separated by commas (e.g., JavaScript, React, Node.js)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <Input
              placeholder="Enter skills separated by commas..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button type="submit" disabled={isAnalyzing || !skills.trim()}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {analysisStatus}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Role
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {roleAnalysis && (
          <motion.div
            ref={analysisRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{roleAnalysis.role}</h2>
                      <p className="text-white/80 mt-1">Based on your skills</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roleAnalysis.skills.map((skill, index) => (
                        <Badge key={index} className="bg-white/20 hover:bg-white/30 text-white">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="technical">Technical Skills</TabsTrigger>
                  <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                </TabsList>

                {roleAnalysis.analysis &&
                  (() => {
                    const parsedContent = parseAnalysisContent(roleAnalysis.analysis)

                    return (
                      <>
                        <TabsContent value="overview" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <ClipboardList className="mr-2 h-5 w-5" />
                                Role Overview
                              </CardTitle>
                              <CardDescription>
                                A comprehensive overview of the {roleAnalysis.role} role
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <Code className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Technical Skills</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.technicalSkills.slice(0, 3).map((skill, i) => (
                                      <li key={i}>{skill}</li>
                                    ))}
                                    {parsedContent.technicalSkills.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{parsedContent.technicalSkills.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                </motion.div>

                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <Users className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Soft Skills</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.softSkills.slice(0, 3).map((skill, i) => (
                                      <li key={i}>{skill}</li>
                                    ))}
                                    {parsedContent.softSkills.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{parsedContent.softSkills.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                </motion.div>

                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <Wrench className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Tools</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.tools.slice(0, 3).map((tool, i) => (
                                      <li key={i}>{tool}</li>
                                    ))}
                                    {parsedContent.tools.length > 3 && (
                                      <li className="text-muted-foreground">+{parsedContent.tools.length - 3} more</li>
                                    )}
                                  </ul>
                                </motion.div>

                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Experience Level</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.experienceLevel.map((exp, i) => (
                                      <li key={i}>{exp}</li>
                                    ))}
                                  </ul>
                                </motion.div>

                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <Award className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Certifications</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.certifications.slice(0, 3).map((cert, i) => (
                                      <li key={i}>{cert}</li>
                                    ))}
                                    {parsedContent.certifications.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{parsedContent.certifications.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                </motion.div>

                                <motion.div
                                  className="flex flex-col gap-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  <div className="flex items-center text-primary">
                                    <ArrowUpRight className="mr-2 h-5 w-5" />
                                    <h3 className="font-semibold">Career Path</h3>
                                  </div>
                                  <ul className="space-y-1 pl-7 list-disc text-sm">
                                    {parsedContent.careerPath.slice(0, 3).map((path, i) => (
                                      <li key={i}>{path}</li>
                                    ))}
                                    {parsedContent.careerPath.length > 3 && (
                                      <li className="text-muted-foreground">
                                        +{parsedContent.careerPath.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="technical" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Code className="mr-2 h-5 w-5" />
                                Technical Skills
                              </CardTitle>
                              <CardDescription>
                                Technical skills required for the {roleAnalysis.role} role
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsedContent.technicalSkills.map((skill, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-start p-3 rounded-md border bg-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{skill}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="soft" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Soft Skills
                              </CardTitle>
                              <CardDescription>
                                Interpersonal and non-technical skills for the {roleAnalysis.role} role
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsedContent.softSkills.map((skill, index) => (
                                  <motion.div
                                    key={index}
                                    className="flex items-start p-3 rounded-md border bg-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{skill}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="tools" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Wrench className="mr-2 h-5 w-5" />
                                Tools & Technologies
                              </CardTitle>
                              <CardDescription>
                                Tools and technologies commonly used in the {roleAnalysis.role} role
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {parsedContent.tools.map((tool, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Badge variant="outline" className="px-3 py-1 text-sm">
                                      {tool}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="experience" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <GraduationCap className="mr-2 h-5 w-5" />
                                Experience & Career Path
                              </CardTitle>
                              <CardDescription>
                                Experience levels and career progression for the {roleAnalysis.role} role
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
                                  <ul className="space-y-2">
                                    {parsedContent.experienceLevel.map((exp, index) => (
                                      <motion.li
                                        key={index}
                                        className="flex items-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                      >
                                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{exp}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Career Path</h3>
                                  <ul className="space-y-2">
                                    {parsedContent.careerPath.map((path, index) => (
                                      <motion.li
                                        key={index}
                                        className="flex items-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 + 0.3 }}
                                      >
                                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{path}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="certifications" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <Award className="mr-2 h-5 w-5" />
                                Recommended Certifications
                              </CardTitle>
                              <CardDescription>
                                Certifications that can boost your career as a {roleAnalysis.role}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parsedContent.certifications.map((cert, index) => (
                                  <motion.div
                                    key={index}
                                    className="p-4 border rounded-lg bg-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <div className="flex items-center mb-2">
                                      <Award className="h-5 w-5 text-primary mr-2" />
                                      <h4 className="font-medium">{cert}</h4>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="responsibilities" className="mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <ClipboardList className="mr-2 h-5 w-5" />
                                Key Responsibilities
                              </CardTitle>
                              <CardDescription>
                                Main duties and responsibilities of a {roleAnalysis.role}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-3">
                                {parsedContent.keyResponsibilities.map((resp, index) => (
                                  <motion.li
                                    key={index}
                                    className="flex items-start p-3 rounded-md border bg-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{resp}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </>
                    )
                  })()}
              </Tabs>

              <Card>
                <CardHeader>
                  <CardTitle>Compare with Your Resume</CardTitle>
                  <CardDescription>See how well your resume matches this role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedResumeId !== null ? String(selectedResumeId) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedResumeId(val === "" ? null : Number(val));
                      }}
                      disabled={resumes.length === 0}
                    >
                      <option value="">Select a resume to compare</option>
                      {resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.file_name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <Button onClick={handleCompare} disabled={isComparing || !selectedResumeId}>
                        {isComparing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Comparing...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Compare
                          </>
                        )}
                      </Button>

                      <Button variant="outline" onClick={handleCopyAnalysis}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
