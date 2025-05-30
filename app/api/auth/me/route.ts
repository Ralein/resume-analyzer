import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = (await cookieStore).get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserById(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
