import os
import shutil
import tempfile
import random
from typing import List, Dict
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import ffmpeg
import json
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create and mount temp directory for video storage
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)
app.mount("/videos", StaticFiles(directory="temp"), name="videos")

def get_random_transformations() -> Dict:
    """Generate random transformation parameters"""
    return {
        'crop_factor': random.uniform(0.85, 0.95),
        'hue_shift': random.uniform(-15, 15),  # Reduced range for subtlety
        'saturation': random.uniform(0.9, 1.1), # Reduced range
        'contrast': random.uniform(0.95, 1.05),
        'brightness': random.uniform(-0.05, 0.05),
        'speed': random.uniform(0.97, 1.03),  # This affects both video and audio
    }

def process_variant(input_path: str, output_path: str, options: dict) -> str:
    try:
        transforms = get_random_transformations()
        stream = ffmpeg.input(input_path)
        
        # Video processing chain
        video = stream.video
        
        if options.get('adjustFramerate', True):
            # Apply speed change to video
            if transforms['speed'] != 1.0:
                video = ffmpeg.filter(video, 'setpts', f'{1/transforms["speed"]}*PTS')
        
        if options.get('adjustColor', True):
            # Apply color adjustments
            video = ffmpeg.filter(video, 'hue', 
                                h=transforms['hue_shift'],
                                s=transforms['saturation'])
            video = ffmpeg.filter(video, 'eq',
                                contrast=transforms['contrast'],
                                brightness=transforms['brightness'])
        
        # Apply crop and rescale
        width = f'iw*{transforms["crop_factor"]}'
        height = f'ih*{transforms["crop_factor"]}'
        x = f'(iw-{width})/2'
        y = f'(ih-{height})/2'
        video = ffmpeg.filter(video, 'crop', width, height, x, y)
        video = ffmpeg.filter(video, 'scale', 1280, 720)
        
        # Audio processing chain
        audio = stream.audio
        
        if options.get('adjustAudio', True):
            # Apply same speed change to audio to maintain sync
            if transforms['speed'] != 1.0:
                audio = ffmpeg.filter(audio, 'atempo', transforms['speed'])
        
        # Combine streams and output
        stream = ffmpeg.output(video, audio, output_path,
                             **{'c:v': 'libx264',
                                'crf': random.randint(18, 23),
                                'preset': 'medium'})
        
        ffmpeg.run(stream, overwrite_output=True)
        return output_path
        
    except ffmpeg.Error as e:
        print('FFmpeg error:', e.stderr.decode() if e.stderr else str(e))
        raise

@app.post("/generate-variants")
async def generate_variants(
    video: UploadFile = File(...),
    num_variants: int = Form(...),
    options: str = Form(...)
):
    try:
        # Create unique directory for this upload
        upload_dir = TEMP_DIR / f"upload_{os.urandom(8).hex()}"
        upload_dir.mkdir(exist_ok=True)
        
        # Save uploaded video
        input_path = upload_dir / "input.mp4"
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # Parse options
        options_dict = json.loads(options)
        
        # Generate variants
        variant_paths = []
        print(f"Generating {num_variants} variants")
        
        for i in range(int(num_variants)):
            output_path = upload_dir / f"variant_{i}.mp4"
            try:
                process_variant(str(input_path), str(output_path), options_dict)
                variant_paths.append(f"/videos/{upload_dir.name}/variant_{i}.mp4")
            except Exception as e:
                print(f"Error processing variant {i}: {e}")
                continue
        
        if not variant_paths:
            return {"error": "Failed to generate any variants"}
            
        return {"variants": variant_paths}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 