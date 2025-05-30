import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signIn } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const { user, sessionToken } = await signIn(email, password)

    if (!user || !sessionToken) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    (await
      // Set session cookie
      cookies()).set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Error signing in:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
