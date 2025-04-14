'use client'

import * as React from 'react'
import { Download, Play, Pause } from 'lucide-react'

interface VideoGridProps {
  variants: string[]
}

export default function VideoGrid({ variants }: VideoGridProps) {
  const [playing, setPlaying] = React.useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {variants.map((variant, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            <video
              src={variant}
              className="w-full h-full object-cover"
              controls={playing === index}
              onPlay={() => setPlaying(index)}
              onPause={() => setPlaying(null)}
            />
            {playing !== index && (
              <button 
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                onClick={() => setPlaying(index)}
              >
                <Play className="h-12 w-12 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Variant {index + 1}
              </span>
              <a
                href={variant}
                download={`variant-${index + 1}.mp4`}
                className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 