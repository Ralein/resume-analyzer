// Ollama API client for resume analysis

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

// Use the real Ollama API URL
const OLLAMA_API_URL = "http://10.10.99.24:11434/api/generate"

// Helper function to make Ollama API calls with increased timeout
async function callOllamaAPI(prompt: string, retries = 3, timeout = 120000): Promise<string> {
  let attempt = 0

  while (attempt < retries) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral:latest",
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response ? data.response.trim() : ""
    } catch (error) {
      attempt++

      if (attempt >= retries) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt * 2))
    }
  }

  throw new Error("Failed after multiple attempts")
}

// Get a comprehensive analysis of the resume
export async function analyzeResumeContent(resumeText: string): Promise<{
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords_found: string[]
  keywords_missing: string[]
  full_analysis: string
}> {
  try {
    // Optimized prompt - more concise and focused
    const prompt = `
Analyze this resume and return JSON with:
{
  "score": [0-100],
  "strengths": [3-5 key strengths],
  "weaknesses": [3-5 key weaknesses],
  "suggestions": [3-5 specific improvements],
  "keywords_found": [important skills found],
  "keywords_missing": [important missing skills],
  "full_analysis": [brief paragraph]
}

Resume:
${resumeText}
`

    const response = await callOllamaAPI(prompt, 3, 180000) // 3 minute timeout

    try {
      const analysisData = JSON.parse(response)
      return {
        score: analysisData.score || 70,
        strengths: analysisData.strengths || [],
        weaknesses: analysisData.weaknesses || [],
        suggestions: analysisData.suggestions || [],
        keywords_found: analysisData.keywords_found || [],
        keywords_missing: analysisData.keywords_missing || [],
        full_analysis: analysisData.full_analysis || "Analysis not available",
      }
    } catch (parseError) {
      // Attempt to extract information from unstructured response
      const fallbackAnalysis = extractFallbackAnalysis(response)
      return fallbackAnalysis
    }
  } catch (error) {
    return {
      score: 70,
      strengths: ["Could not analyze strengths"],
      weaknesses: ["Could not analyze weaknesses"],
      suggestions: ["Could not generate suggestions"],
      keywords_found: [],
      keywords_missing: [],
      full_analysis: "Failed to analyze the resume. Please try again later.",
    }
  }
}

// Extract information from unstructured response
function extractFallbackAnalysis(text: string) {
  const defaultAnalysis = {
    score: 70,
    strengths: [] as string[],
    weaknesses: [] as string[],
    suggestions: [] as string[],
    keywords_found: [] as string[],
    keywords_missing: [] as string[],
    full_analysis: text.substring(0, 500),
  }

  // Try to find score
  const scoreMatch = text.match(/score:?\s*(\d+)/i)
  if (scoreMatch && scoreMatch[1]) {
    const score = Number.parseInt(scoreMatch[1], 10)
    if (!isNaN(score) && score >= 0 && score <= 100) {
      defaultAnalysis.score = score
    }
  }

  // Try to find strengths
  if (text.includes("Strengths") || text.includes("STRENGTHS")) {
    const strengthsMatch = text.match(/Strengths:?([\s\S]*?)(?:Weaknesses|WEAKNESSES|$)/i)
    if (strengthsMatch && strengthsMatch[1]) {
      defaultAnalysis.strengths = strengthsMatch[1]
        .split(/\n|•|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 10 && s.length < 100)
        .slice(0, 5)
    }
  }

  // Try to find weaknesses
  if (text.includes("Weaknesses") || text.includes("WEAKNESSES")) {
    const weaknessesMatch = text.match(/Weaknesses:?([\s\S]*?)(?:Suggestions|SUGGESTIONS|$)/i)
    if (weaknessesMatch && weaknessesMatch[1]) {
      defaultAnalysis.weaknesses = weaknessesMatch[1]
        .split(/\n|•|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 10 && s.length < 100)
        .slice(0, 5)
    }
  }

  // Try to find suggestions
  if (text.includes("Suggestions") || text.includes("SUGGESTIONS")) {
    const suggestionsMatch = text.match(/Suggestions:?([\s\S]*?)(?:Keywords|KEYWORDS|$)/i)
    if (suggestionsMatch && suggestionsMatch[1]) {
      defaultAnalysis.suggestions = suggestionsMatch[1]
        .split(/\n|•|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 10 && s.length < 100)
        .slice(0, 5)
    }
  }

  // Try to find keywords found
  if (text.includes("Keywords Found") || text.includes("KEYWORDS FOUND")) {
    const keywordsFoundMatch = text.match(/Keywords Found:?([\s\S]*?)(?:Keywords Missing|KEYWORDS MISSING|$)/i)
    if (keywordsFoundMatch && keywordsFoundMatch[1]) {
      defaultAnalysis.keywords_found = keywordsFoundMatch[1]
        .split(/\n|•|,|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 2 && s.length < 30)
        .slice(0, 10)
    }
  }

  // Try to find keywords missing
  if (text.includes("Keywords Missing") || text.includes("KEYWORDS MISSING")) {
    const keywordsMissingMatch = text.match(/Keywords Missing:?([\s\S]*?)(?:Full Analysis|FULL ANALYSIS|$)/i)
    if (keywordsMissingMatch && keywordsMissingMatch[1]) {
      defaultAnalysis.keywords_missing = keywordsMissingMatch[1]
        .split(/\n|•|,|\./)
        .map((s) => s.trim())
        .filter((s) => s.length > 2 && s.length < 30)
        .slice(0, 10)
    }
  }

  return defaultAnalysis
}

// Get suggested role from Ollama API
export async function getSuggestedRole(resumeText: string): Promise<string> {
  try {
    // Optimized prompt - more direct and concise
    const prompt = `Based on these skills, suggest 1 IT role name only:

${resumeText}`

    const response = await callOllamaAPI(prompt, 3, 60000)
    return response || "Software Developer"
  } catch (error) {
    return "Software Developer" // Default fallback
  }
}

// Get similarity between resume and job description
export async function getJobSimilarity(
  resumeText: string,
  jobDescription: string,
): Promise<{ score: number; explanation: string }> {
  try {
    // Optimized prompt - more concise and focused
    const prompt = `Compare resume to job description. Return JSON:
{
  "score": [0-1 match score],
  "explanation": "[brief reason]"
}

Resume:
${resumeText}

Job:
${jobDescription}
`

    const response = await callOllamaAPI(prompt, 3, 120000) // 2 minute timeout

    try {
      const data = JSON.parse(response)
      return {
        score: data.score || 0.5,
        explanation: data.explanation || "No explanation provided",
      }
    } catch (parseError) {
      // Try to extract score and explanation from text
      const scoreMatch = response.match(/score[:\s]*([0-9.]+)/i)
      const score = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 0.5

      const explanationMatch = response.match(/explanation[:\s]*(.*)/i)
      const explanation = explanationMatch ? explanationMatch[1].trim() : "Score based on skill match"

      return { score, explanation }
    }
  } catch (error) {
    return { score: 0.5, explanation: "Error calculating similarity" }
  }
}

// Get detailed role analysis based on skills
export async function getRoleAnalysis(skills: string[]): Promise<{
  role: string
  analysis: string
}> {
  try {
    // Optimized prompt - more direct and concise
    const rolePrompt = `Suggest 1 IT role name for these skills: ${skills.join(", ")}`

    const roleResponse = await callOllamaAPI(rolePrompt, 3, 60000)
    const suggestedRole = roleResponse.trim()

    // Optimized prompt for analysis - more focused
    const analysisPrompt = `For the IT role "${suggestedRole}", provide markdown with:
- Technical skills
- Soft skills
- Tools
- Experience level
- Certifications
- Career path
- Key responsibilities`

    const analysisResponse = await callOllamaAPI(analysisPrompt, 3, 120000)

    return {
      role: suggestedRole,
      analysis: analysisResponse,
    }
  } catch (error) {
    return {
      role: "Software Developer",
      analysis: "Failed to generate role analysis. Please try again later.",
    }
  }
}
