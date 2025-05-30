import type { Metadata } from "next"
import { RoleAnalysisForm } from "@/components/role-analysis-form"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "NoviraAI - Role Analysis",
  description: "Get a detailed analysis of IT roles based on your skills",
}

export default async function RoleAnalysisPage() {
  const authResult = await auth();
  const { userId } = authResult;

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Role-Based Analysis</h1>
          <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[700px]">
            Enter your skills to get a detailed analysis of a suitable IT role and compare it with your resume.
          </p>
        </div>

        <RoleAnalysisForm />
      </div>
    </div>
  )
}
