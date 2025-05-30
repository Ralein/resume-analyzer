import { neon } from "@neondatabase/serverless"

// Initialize the SQL client
const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Resume {
  id: number
  user_id: string
  file_name: string
  file_url: string
  content: string
  created_at: string
  analysis?: Analysis
}

export interface Analysis {
  id: number
  resume_id: number
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords_found: string[]
  keywords_missing: string[]
  full_analysis: string
  created_at: string
  suggested_role?: string
  similarity_score?: number
  similarity_explanation?: string
  job_description?: string
}

// Get or create a user
export async function getOrCreateUser(userId: string, email: string, name: string): Promise<string> {
  try {
    // Check if user exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `

    if (existingUsers.length > 0) {
      return existingUsers[0].id
    }

    // Create new user if not exists
    const newUser = await sql`
      INSERT INTO users (id, email, name)
      VALUES (${userId}, ${email}, ${name})
      RETURNING id
    `

    return newUser[0].id
  } catch (error) {
    console.error("Error getting or creating user:", error)
    throw error
  }
}

// Get all resumes for a user
export async function getUserResumes(userId: string): Promise<Resume[]> {
  try {
    const resumes = await sql`
      SELECT r.*, a.id as analysis_id, a.score, a.suggested_role
      FROM resumes r
      LEFT JOIN analyses a ON r.id = a.resume_id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `

    return resumes.map((resume): Resume => ({
      id: resume.id,
      user_id: resume.user_id,
      file_name: resume.file_name,
      file_url: resume.file_url,
      content: resume.content,
      created_at: resume.created_at,
      analysis: resume.analysis_id ? {
        id: resume.analysis_id,
        resume_id: resume.id,
        score: resume.score,
        strengths: resume.strengths || [],
        weaknesses: resume.weaknesses || [],
        suggestions: resume.suggestions || [],
        keywords_found: resume.keywords_found || [],
        keywords_missing: resume.keywords_missing || [],
        job_description: resume.job_description || '',
        full_analysis: resume.full_analysis || '',
        created_at: resume.analysis_created_at || resume.created_at,
        suggested_role: resume.suggested_role || '',
      } : undefined,
    }));
  } catch (error) {
    console.error("Error getting user resumes:", error)
    return []
  }
}

// Get a resume with its analysis
export async function getResumeWithAnalysis(resumeId: number): Promise<(Resume & { analysis: Analysis }) | null> {
  try {
    const resumes = await sql`
      SELECT 
        r.id, r.user_id, r.file_name, r.file_url, r.content, r.created_at,
        a.id as analysis_id, a.score, a.strengths, a.weaknesses, a.suggestions, 
        a.keywords_found, a.keywords_missing, a.full_analysis, a.created_at as analysis_created_at,
        a.suggested_role, a.similarity_score, a.similarity_explanation, a.job_description
      FROM resumes r
      LEFT JOIN analyses a ON r.id = a.resume_id
      WHERE r.id = ${resumeId}
    `

    if (resumes.length === 0) {
      return null
    }

    const resume = resumes[0]

    return {
      id: resume.id,
      user_id: resume.user_id,
      file_name: resume.file_name,
      file_url: resume.file_url,
      content: resume.content,
      created_at: resume.created_at,
      analysis: {
        id: resume.analysis_id,
        resume_id: resume.id,
        score: resume.score,
        strengths: resume.strengths,
        weaknesses: resume.weaknesses,
        suggestions: resume.suggestions,
        keywords_found: resume.keywords_found,
        keywords_missing: resume.keywords_missing,
        full_analysis: resume.full_analysis,
        created_at: resume.analysis_created_at,
        suggested_role: resume.suggested_role,
        similarity_score: resume.similarity_score,
        similarity_explanation: resume.similarity_explanation,
        job_description: resume.job_description,
      },
    }
  } catch (error) {
    console.error("Error getting resume with analysis:", error)
    return null
  }
}

// Create a new resume
export async function createResume(
  userId: string,
  fileName: string,
  fileUrl: string,
  content: string,
): Promise<number> {
  const result = await sql`
    INSERT INTO resumes (user_id, file_name, file_url, content)
    VALUES (${userId}, ${fileName}, ${fileUrl}, ${content})
    RETURNING id
  `

  return result[0].id
}

// Create a new analysis
export async function createAnalysis(
  resumeId: number,
  score: number,
  strengths: string[],
  weaknesses: string[],
  suggestions: string[],
  keywordsFound: string[],
  keywordsMissing: string[],
  fullAnalysis: string,
  suggestedRole?: string,
): Promise<number> {
  const result = await sql`
    INSERT INTO analyses (
      resume_id, score, strengths, weaknesses, suggestions, 
      keywords_found, keywords_missing, full_analysis, suggested_role
    )
    VALUES (
      ${resumeId}, ${score}, ${strengths}, ${weaknesses}, ${suggestions}, 
      ${keywordsFound}, ${keywordsMissing}, ${fullAnalysis}, ${suggestedRole}
    )
    RETURNING id
  `

  return result[0].id
}

// Update analysis with job similarity
export async function updateAnalysisWithJobSimilarity(
  analysisId: number,
  jobDescription: string,
  similarityScore: number,
  similarityExplanation: string,
): Promise<void> {
  await sql`
    UPDATE analyses
    SET job_description = ${jobDescription},
        similarity_score = ${similarityScore},
        similarity_explanation = ${similarityExplanation}
    WHERE id = ${analysisId}
  `
}

// Delete a resume and its analysis
export async function deleteResume(resumeId: number): Promise<void> {
  // First delete the analysis (due to foreign key constraint)
  await sql`
    DELETE FROM analyses
    WHERE resume_id = ${resumeId}
  `

  // Then delete the resume
  await sql`
    DELETE FROM resumes
    WHERE id = ${resumeId}
  `
}
