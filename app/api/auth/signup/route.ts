import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { signUp } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    const { user, sessionToken, error } = await signUp(email, name, password)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    if (!user || !sessionToken) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
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
    console.error("Error signing up:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
