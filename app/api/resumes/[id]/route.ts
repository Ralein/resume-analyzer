import { NextResponse } from "next/server"
import { getResumeWithAnalysis } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const authResult = await auth();
    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const resumeId = Number.parseInt(params.id)

    if (isNaN(resumeId)) {
      return NextResponse.json({ error: "Invalid resume ID" }, { status: 400 })
    }

    const resume = await getResumeWithAnalysis(resumeId)

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Verify that the resume belongs to the current user
    if (resume.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error("Error fetching resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
