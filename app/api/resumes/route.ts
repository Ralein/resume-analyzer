import { NextResponse } from "next/server"
import { getUserResumes } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const authResult = await auth();
    const { userId } = authResult;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const resumes = await getUserResumes(userId)

    return NextResponse.json(
      resumes.map((resume) => ({
        id: resume.id,
        file_name: resume.file_name,
      })),
    )
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
