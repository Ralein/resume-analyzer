import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear session cookie
    (await
      // Clear session cookie
      cookies()).delete("session_token")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
