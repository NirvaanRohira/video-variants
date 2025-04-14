'use client'

import * as React from 'react'
import { Progress } from './ui/Progress'
import { Loader2 } from 'lucide-react'

interface ProcessingStatusProps {
  progress: number
}

export default function ProcessingStatus({ progress }: ProcessingStatusProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <h3 className="text-base font-medium text-gray-900">Processing Video</h3>
        </div>
        
        <div className="space-y-4">
          <Progress value={progress} />
          <p className="text-sm text-gray-600">
            Generating variants... {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  )
} 