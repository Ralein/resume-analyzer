"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Lottie from "lottie-react"
import resumeAnimation from "@/animations/resume-animation.json"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  const lottieRef = useRef<any>(null)

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(0.8)
    }
  }, [])

  function scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth"
    });
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Elevate Your Resume with AI
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Get instant AI-powered analysis and suggestions to improve your resume and land your dream job.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link href="/" passHref>
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={scrollToBottom}
                >
                  Get Started
                </Button>
              </Link>
            
            </div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full max-w-[500px]">
              <Lottie animationData={resumeAnimation} loop={true} lottieRef={lottieRef} className="w-full h-auto" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
