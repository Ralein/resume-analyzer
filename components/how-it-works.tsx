"use client"

import { motion } from "framer-motion"
import { Upload, Search, CheckSquare, ThumbsUp } from "lucide-react"

const steps = [
  {
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: "Upload Your Resume",
    description: "Simply upload your resume in PDF or DOCX format.",
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "AI Analysis",
    description: "Our AI analyzes your resume against industry standards and job requirements.",
  },
  {
    icon: <CheckSquare className="h-10 w-10 text-primary" />,
    title: "Get Detailed Feedback",
    description: "Receive a comprehensive analysis with strengths, weaknesses, and suggestions.",
  },
  {
    icon: <ThumbsUp className="h-10 w-10 text-primary" />,
    title: "Improve & Apply",
    description: "Apply the suggestions to improve your resume and increase your chances of landing interviews.",
  },
]

export function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Get your resume analyzed in just a few simple steps.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">{step.icon}</div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
                  <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
