import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt } = body

    // Check if this is a role suggestion request
    if (prompt.includes("suggest 1 suitable IT role")) {
      // Extract resume text
      const resumeText = prompt.split("Resume:")[1]?.trim() || ""

      // Simple logic to determine role based on keywords in the resume
      let role = "Software Developer"

      if (resumeText.toLowerCase().includes("react")) {
        role = "Frontend Developer"
      } else if (resumeText.toLowerCase().includes("node.js")) {
        role = "Backend Developer"
      } else if (resumeText.toLowerCase().includes("aws")) {
        role = "DevOps Engineer"
      } else if (resumeText.toLowerCase().includes("data")) {
        role = "Data Engineer"
      }

      return NextResponse.json({
        model: "mistral:latest",
        created_at: new Date().toISOString(),
        response: role,
        done: true,
      })
    }

    // Check if this is a job similarity request
    if (prompt.includes("Compare the following resume and job description")) {
      // Simple logic to determine similarity score
      const score = Math.random() * 0.5 + 0.3 // Random score between 0.3 and 0.8
      const explanation = "Skills partially match the job requirements"

      return NextResponse.json({
        model: "mistral:latest",
        created_at: new Date().toISOString(),
        response: `${score.toFixed(2)} - ${explanation}`,
        done: true,
      })
    }

    // Default response
    return NextResponse.json({
      model: "mistral:latest",
      created_at: new Date().toISOString(),
      response: "I'm not sure how to respond to that prompt.",
      done: true,
    })
  } catch (error) {
    console.error("Error in mock Ollama API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
