'use client'

import { useState } from 'react'
import VideoUpload from '@/components/VideoUpload'
import VariantControls from '@/components/VariantControls'
import ProcessingStatus from '@/components/ProcessingStatus'
import VideoGrid from '@/components/VideoGrid'

export default function Home() {
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [variants, setVariants] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (file: File) => {
    setUploadedVideo(file)
  }

  const handleGenerateVariants = async (numVariants: number, options: any) => {
    setIsProcessing(true)
    setProgress(0)
    
    const formData = new FormData()
    formData.append('video', uploadedVideo as File)
    formData.append('num_variants', numVariants.toString())
    formData.append('options', JSON.stringify(options))

    try {
      const response = await fetch('http://localhost:8000/generate-variants', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate variants')
      }

      const data = await response.json()
      console.log('Response:', data)
      
      if (data.error) {
        console.error('Server error:', data.error)
        return
      }

      const variantUrls = data.variants.map((path: string) => 
        `http://localhost:8000${path}`
      )
      setVariants(variantUrls)
      setProgress(100)
    } catch (error) {
      console.error('Error generating variants:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto py-16 px-8">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">
            Video Variant Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Create unique video variants with intelligent modifications.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <VideoUpload onUpload={handleUpload} />
          </div>
          
          <div className="space-y-6">
            {uploadedVideo && (
              <VariantControls 
                onGenerate={handleGenerateVariants}
                disabled={isProcessing}
              />
            )}
            {isProcessing && (
              <ProcessingStatus progress={progress} />
            )}
          </div>
        </div>

        {variants.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Generated Variants
            </h2>
            <VideoGrid variants={variants} />
          </div>
        )}
      </div>
    </div>
  )
} 