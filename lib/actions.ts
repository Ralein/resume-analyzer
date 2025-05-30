"use server"

import { revalidatePath } from "next/cache"
import {
  getOrCreateUser,
  createResume,
  createAnalysis,
  updateAnalysisWithJobSimilarity,
  deleteResume,
  getResumeWithAnalysis,
} from "@/lib/db"
import { analyzeResumeContent, getSuggestedRole, getJobSimilarity, getRoleAnalysis } from "@/lib/ollama"
import { auth } from "@clerk/nextjs/server"

// Function to extract text from a resume file
async function extractTextFromResume(file: File): Promise<string> {
  // In a real app, you would use a library to extract text from PDF/DOCX
  // For demo purposes, we'll just return a placeholder text
  return `
John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer, ABC Tech
2020 - Present
- Led development of a React-based dashboard that improved user engagement by 40%
- Implemented CI/CD pipelines that reduced deployment time by 60%
- Mentored junior developers and conducted code reviews

Software Engineer, XYZ Solutions
2018 - 2020
- Developed RESTful APIs using Node.js and Express
- Optimized database queries resulting in 30% faster response times
- Collaborated with UX designers to implement responsive web designs

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018

SKILLS
JavaScript, TypeScript, React, Node.js, Express, MongoDB, SQL, Git, AWS, Docker
  `
}

// Main function to handle resume upload and analysis
export async function analyzeResume(formData: FormData) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return { success: false, error: "Authentication required" }
    }

    // Get form data
    const file = formData.get("file") as File
    const fileName = formData.get("fileName") as string

    if (!file || !fileName) {
      return { success: false, error: "Missing file or file name" }
    }

    // Get user details from Clerk
    const { clerkClient } = await import("@clerk/nextjs/server")
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)

    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Create or get user in our database
    await getOrCreateUser(userId, user.emailAddresses[0].emailAddress, `${user.firstName} ${user.lastName}`)

    // Extract text from resume
    const resumeText = await extractTextFromResume(file)

    // In a real app, you would upload the file to a storage service
    // and get a URL back. For demo purposes, we'll use a placeholder URL.
    const fileUrl = "/placeholder-resume.pdf"

    // Save resume to database
    const resumeId = await createResume(userId, fileName, fileUrl, resumeText)

    console.log("Starting AI analysis of resume...")

    // Get comprehensive analysis from Ollama API
    const analysis = await analyzeResumeContent(resumeText)
    console.log("Received AI analysis results")

    // Get suggested role from Ollama API
    let suggestedRole
    try {
      console.log("Getting suggested role from Ollama API...")
      suggestedRole = await getSuggestedRole(resumeText)
      console.log("Received suggested role:", suggestedRole)
    } catch (error) {
      console.error("Error getting suggested role:", error)
      suggestedRole = "Software Developer" // Default fallback
    }

    // Save analysis to database
    const analysisId = await createAnalysis(
      resumeId,
      analysis.score,
      analysis.strengths,
      analysis.weaknesses,
      analysis.suggestions,
      analysis.keywords_found,
      analysis.keywords_missing,
      analysis.full_analysis,
      suggestedRole,
    )

    // Revalidate paths to update UI
    revalidatePath("/dashboard")
    revalidatePath(`/analysis/${resumeId}`)

    return { success: true, resumeId }
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return { success: false, error: String(error) }
  }
}

// Function to compare resume with job description
export async function compareWithJobDescription(resumeId: number, jobDescription: string) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return { success: false, error: "Authentication required" }
    }

    // Get the resume from the database
    const resume = await getResumeWithAnalysis(resumeId)

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Verify that the resume belongs to the current user
    if (resume.user_id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Get similarity score from Ollama API
    console.log("Getting job similarity from Ollama API...")
    let similarityResult
    try {
      similarityResult = await getJobSimilarity(resume.content, jobDescription)
      console.log("Received job similarity result:", similarityResult)
    } catch (error) {
      console.error("Error getting job similarity:", error)
      similarityResult = { score: 0.5, explanation: "Error calculating similarity" }
    }

    // Update the analysis with the job similarity
    await updateAnalysisWithJobSimilarity(
      resume.analysis.id,
      jobDescription,
      similarityResult.score,
      similarityResult.explanation,
    )

    // Revalidate paths to update UI
    revalidatePath(`/analysis/${resumeId}`)

    return { success: true, score: similarityResult.score, explanation: similarityResult.explanation }
  } catch (error) {
    console.error("Error comparing with job description:", error)
    return { success: false, error: String(error) }
  }
}

// Function to delete a resume
export async function deleteResumeAction(resumeId: number) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return { success: false, error: "Authentication required" }
    }

    // Get the resume to verify ownership
    const resume = await getResumeWithAnalysis(resumeId)

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Verify that the resume belongs to the current user
    if (resume.user_id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    await deleteResume(resumeId)

    // Revalidate paths to update UI
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting resume:", error)
    return { success: false, error: String(error) }
  }
}

// Function to analyze role based on skills
export async function analyzeRole(formData: FormData) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return { success: false, error: "Authentication required" }
    }

    const skillsString = formData.get("skills") as string

    if (!skillsString) {
      return { success: false, error: "Skills are required" }
    }

    // Parse skills from comma-separated string
    const skills = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)

    if (skills.length === 0) {
      return { success: false, error: "At least one skill is required" }
    }

    // Get role analysis from Ollama API
    const { role, analysis } = await getRoleAnalysis(skills)

    return {
      success: true,
      role,
      analysis,
      skills,
    }
  } catch (error) {
    console.error("Error analyzing role:", error)
    return { success: false, error: String(error) }
  }
}

// Make sure all functions are properly exported
