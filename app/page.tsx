import type { Metadata } from "next"
import { UploadResume } from "@/components/upload-resume"
import { HeroSection } from "@/components/hero-section"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "NoviraAI",
  description:
    "Upload your resume and get AI-powered analysis and suggestions to improve your chances of landing your dream job.",
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />
        <Features />
        <HowItWorks />
        <section className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Improve Your Resume?
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload your resume now and get instant AI-powered feedback and suggestions.
                </p>
              </div>
              <UploadResume />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
