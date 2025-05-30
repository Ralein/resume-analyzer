import { neon } from "@neondatabase/serverless"
import { randomBytes, createHash } from "crypto"

const sql = neon(process.env.DATABASE_URL!)

interface User {
  id: string
  email: string
  name: string
  password_hash?: string
}

interface Session {
  token: string
  user_id: string
  expires_at: Date
}

// Get user by ID (session token)
export async function getUserById(sessionToken: string): Promise<User | null> {
  try {
    // First, get the user ID from the session
    const sessions = await sql`
      SELECT user_id FROM sessions WHERE token = ${sessionToken} AND expires_at > NOW()
    `

    if (sessions.length === 0) {
      return null
    }

    const userId = sessions[0].user_id

    // Then, get the user from neon_auth.users_sync
    const users = await sql`
      SELECT id, email, name FROM neon_auth.users_sync WHERE id = ${userId} AND deleted_at IS NULL
    `

    if (users.length === 0) {
      return null
    }

    return {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name
    }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

// Sign in user
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User | null; sessionToken: string | null }> {
  try {
    // Get user by email
    const users = await sql`
      SELECT u.id, u.email, u.name, c.password_hash
      FROM neon_auth.users_sync u
      JOIN credentials c ON u.id = c.user_id
      WHERE u.email = ${email} AND u.deleted_at IS NULL
    `

    if (users.length === 0) {
      return { user: null, sessionToken: null }
    }

    const user = users[0]

    // Verify password
    const passwordHash = createHash("sha256").update(password).digest("hex")

    if (passwordHash !== user.password_hash) {
      return { user: null, sessionToken: null }
    }

    // Create session
    const sessionToken = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 1 week from now

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${sessionToken}, ${user.id}, ${expiresAt})
    `

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      sessionToken,
    }
  } catch (error) {
    console.error("Error signing in:", error)
    return { user: null, sessionToken: null }
  }
}

// Sign up user
export async function signUp(
  email: string,
  name: string,
  password: string,
): Promise<{ user: User | null; sessionToken: string | null; error?: string }> {
  try {
    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM neon_auth.users_sync WHERE email = ${email} AND deleted_at IS NULL
    `

    if (existingUsers.length > 0) {
      return { user: null, sessionToken: null, error: "Email already in use" }
    }

    // Create user in neon_auth.users_sync
    // Note: In a real implementation, you would use Neon Auth's API to create the user
    // This is a simplified version for demonstration purposes
    const userId = randomBytes(16).toString("hex")
    const now = new Date()

    await sql`
      INSERT INTO neon_auth.users_sync (id, email, name, created_at)
      VALUES (${userId}, ${email}, ${name}, ${now})
    `

    // Store password hash
    const passwordHash = createHash("sha256").update(password).digest("hex")

    await sql`
      INSERT INTO credentials (user_id, password_hash)
      VALUES (${userId}, ${passwordHash})
    `

    // Create session
    const sessionToken = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 1 week from now

    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${sessionToken}, ${userId}, ${expiresAt})
    `

    return {
      user: {
        id: userId,
        email,
        name,
      },
      sessionToken,
    }
  } catch (error) {
    console.error("Error signing up:", error)
    return { user: null, sessionToken: null, error: "Failed to create user" }
  }
}
