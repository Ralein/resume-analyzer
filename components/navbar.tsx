"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">NoviraAI</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Home
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/role-analysis"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/role-analysis" ? "text-primary" : "text-muted-foreground",
                )}
              >
                Role Analysis
              </Link>
            </SignedIn>
          </nav>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <SignedOut>
              <Button variant="outline" asChild>
                <SignInButton mode="modal" />
              </Button>
              <Button asChild>
                <SignUpButton mode="modal" />
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}
