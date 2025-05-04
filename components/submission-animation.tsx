"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Server, Clock } from "lucide-react"

interface ModelInfo {
  id: string
  name: string
  color: string // We'll ignore this and use sky blue for all
}

interface SubmissionAnimationProps {
  elapsedTime: number
  models: ModelInfo[]
}

export default function SubmissionAnimation({ elapsedTime, models }: SubmissionAnimationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const messages = [
    "Testing AI models...",
    "Returning model token sizes...",
    "Calculating electricity consumption...",
    "Estimating CO2 footprint...",
  ]

  // Determine which message to show based on elapsed time
  useEffect(() => {
    if (elapsedTime < 5) {
      setCurrentMessageIndex(0)
    } else if (elapsedTime < 10) {
      setCurrentMessageIndex(1)
    } else if (elapsedTime < 15) {
      setCurrentMessageIndex(2)
    } else {
      setCurrentMessageIndex(3)
    }
  }, [elapsedTime])

  return (
    <div className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-6">
      {/* Single message at the top */}
      <div className="text-center mb-6">
        <p className="text-zinc-200 text-lg font-medium">{messages[currentMessageIndex]}</p>
        <p className="text-zinc-400 text-sm mt-2">
          Total time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
        </p>
      </div>

      {/* Individual model animations */}
      <div className="space-y-4">
        {models.map((model, index) => (
          <ModelAnimation key={model.id} model={model} delay={index * 0.3} elapsedTime={elapsedTime} />
        ))}
      </div>
    </div>
  )
}

interface ModelAnimationProps {
  model: ModelInfo
  delay: number
  elapsedTime: number
}

function ModelAnimation({ model, delay, elapsedTime }: ModelAnimationProps) {
  // Simulate random response times between 5-25 seconds
  const [estimatedTime] = useState(Math.floor(Math.random() * 20) + 5)
  const [isComplete, setIsComplete] = useState(false)

  // Check if this model's "response" is complete based on elapsed time and random estimate
  useEffect(() => {
    if (elapsedTime >= estimatedTime && !isComplete) {
      setIsComplete(true)
    }
  }, [elapsedTime, estimatedTime, isComplete])

  return (
    <div className="flex items-center">
      {/* Model indicator */}
      <div className="flex items-center w-40 mr-4">
        <div className="h-3 w-3 rounded-full bg-sky-400 mr-2"></div>
        <span className="text-zinc-300 text-sm truncate">{model.name}</span>
      </div>

      {/* Animation track */}
      <div className="relative flex-grow h-8 bg-zinc-900 rounded-md overflow-hidden">
        {/* Progress bar */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-sky-400 bg-opacity-20"
          initial={{ width: 0 }}
          animate={{
            width: isComplete ? "100%" : `${(elapsedTime / estimatedTime) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Ping dot */}
        {!isComplete && (
          <motion.div
            className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-sky-400"
            initial={{ x: 10 }}
            animate={{ x: [10, "calc(100% - 10px)", 10] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Server icon */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Server className={`w-4 h-4 ${isComplete ? "text-sky-400" : "text-zinc-600"}`} />
        </div>

        {/* Time counter */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
          <Clock className="w-3 h-3 text-zinc-500 mr-1" />
          <span className="text-xs text-zinc-400">
            {isComplete ? `${estimatedTime}s` : `${Math.min(elapsedTime, estimatedTime)}s / ~${estimatedTime}s`}
          </span>
        </div>
      </div>
    </div>
  )
}
