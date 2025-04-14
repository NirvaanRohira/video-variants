'use client'

import * as React from 'react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X } from 'lucide-react'

interface VideoUploadProps {
  onUpload: (file: File) => void
}

export default function VideoUpload({ onUpload }: VideoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB')
        return
      }
      onUpload(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
      setError(null)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxFiles: 1
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        {!preview ? (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 space-y-2">
              <p className="text-base font-medium text-gray-700">
                Drag and drop your video here
              </p>
              <p className="text-sm text-gray-500">
                Supports MP4, MOV, AVI (max 100MB)
              </p>
            </div>
          </>
        ) : (
          <div className="relative">
            <video
              src={preview}
              controls
              className="w-full rounded-lg shadow-sm"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
                onUpload(null as any)
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/70 text-white hover:bg-gray-900/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 