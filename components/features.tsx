"use client"

import { motion } from "framer-motion"
import { CheckCircle, FileText, LineChart, Zap } from "lucide-react"

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: "Smart Resume Analysis",
    description:
      "Our AI analyzes your resume against industry standards and job requirements to provide actionable insights.",
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: "Keyword Optimization",
    description:
      "Identify missing keywords and phrases that are crucial for passing through Applicant Tracking Systems (ATS).",
  },
  {
    icon: <LineChart className="h-10 w-10 text-primary" />,
    title: "Detailed Scoring",
    description: "Get a comprehensive score with breakdown of strengths and areas for improvement in your resume.",
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Instant Suggestions",
    description: "Receive personalized suggestions to enhance your resume's impact and effectiveness.",
  },
]

export function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our AI-powered resume analyzer provides comprehensive insights to help you stand out from the competition.
            </p>
          </div>
        </div>
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm"
              variants={itemVariants}
            >
              <div className="p-2 rounded-full bg-primary/10">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
