'use client'

import * as React from 'react'
import { useState } from 'react'
import { Slider } from './ui/Slider'
import { Toggle } from './ui/Toggle'

interface VariantControlsProps {
  onGenerate: (numVariants: number, options: any) => void
  disabled?: boolean
}

export default function VariantControls({ onGenerate, disabled }: VariantControlsProps) {
  const [numVariants, setNumVariants] = useState(3)
  const [options, setOptions] = useState({
    adjustFramerate: true,
    adjustColor: true,
    adjustAudio: true,
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-8">
        Generation Options
      </h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Number of Variants: {numVariants}
          </label>
          <Slider
            defaultValue={[3]}
            min={1}
            max={10}
            step={1}
            value={[numVariants]}
            onValueChange={(value) => setNumVariants(value[0])}
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Modification Types
          </label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(options).map(([key, value]) => (
              <Toggle
                key={key}
                pressed={value}
                onPressedChange={(pressed) => 
                  setOptions(prev => ({ ...prev, [key]: pressed }))
                }
                className="px-4 py-2 rounded-md text-sm font-medium"
              >
                {key.replace('adjust', '')}
              </Toggle>
            ))}
          </div>
        </div>

        <button
          onClick={() => onGenerate(numVariants, options)}
          disabled={disabled}
          className={`w-full py-4 px-4 rounded-md text-sm font-medium text-white transition-colors
            ${disabled 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {disabled ? 'Generating...' : `Generate ${numVariants} Variants`}
        </button>
      </div>
    </div>
  )
} 