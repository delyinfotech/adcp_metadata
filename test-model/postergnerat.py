"""
Video Poster Generator menggunakan AI Models - FIXED VERSION
Dependencies:
pip install gradio torch transformers diffusers opencv-python pillow numpy accelerate xformers
"""

import gradio as gr
import cv2
import torch
import numpy as np
from PIL import Image
import tempfile
import os
from transformers import CLIPProcessor, CLIPModel
from diffusers import StableDiffusionXLImg2ImgPipeline, AutoPipelineForImage2Image
from diffusers import DPMSolverMultistepScheduler

# Check device
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Load Models
class ModelLoader:
    def __init__(self):
        self.clip_model = None
        self.clip_processor = None
        self.sdxl_pipe = None
        
    def load_clip(self):
        if self.clip_model is None:
            print("Loading CLIP model...")
            self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").to(device)
            self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
        return self.clip_model, self.clip_processor
    
    def load_sdxl(self):
        if self.sdxl_pipe is None:
            print("Loading Stable Diffusion XL Img2Img...")
            # PERBAIKAN 1: Gunakan Img2Img pipeline, bukan text2img
            self.sdxl_pipe = AutoPipelineForImage2Image.from_pretrained(
                "stabilityai/stable-diffusion-xl-refiner-1.0",  # Refiner lebih baik untuk img2img
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                variant="fp16" if device == "cuda" else None,
                use_safetensors=True
            )
            
            # PERBAIKAN 2: Gunakan scheduler yang lebih baik untuk preservasi detail
            self.sdxl_pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                self.sdxl_pipe.scheduler.config
            )
            
            self.sdxl_pipe = self.sdxl_pipe.to(device)
            
            if device == "cuda":
                # Enable optimizations
                try:
                    self.sdxl_pipe.enable_xformers_memory_efficient_attention()
                except:
                    print("xformers not available, using default attention")
                self.sdxl_pipe.enable_vae_slicing()
                self.sdxl_pipe.enable_model_cpu_offload()
                
        return self.sdxl_pipe

models = ModelLoader()

def extract_frames(video_path, num_frames=5, method="uniform"):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    frames = []
    timestamps = []
    
    if method == "uniform":
        interval = total_frames // (num_frames + 1)
        for i in range(1, num_frames + 1):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i * interval)
            ret, frame = cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(Image.fromarray(frame_rgb))
                timestamp = (i * interval) / fps
                timestamps.append(f"{int(timestamp//60):02d}:{int(timestamp%60):02d}")
    
    cap.release()
    return frames, timestamps

def score_frames_with_clip(frames, query="interesting cinematic moment"):
    clip_model, clip_processor = models.load_clip()
    scores = []
    for frame in frames:
        inputs = clip_processor(
            text=[query, "boring scene", "blurry image"],
            images=frame,
            return_tensors="pt",
            padding=True
        ).to(device)
        
        with torch.no_grad():
            outputs = clip_model(**inputs)
            probs = outputs.logits_per_image.softmax(dim=1)
            score = probs[0][0].item()
            scores.append(score)
    return scores

def extract_and_score_frames(video_path, num_frames, extraction_method, progress=gr.Progress()):
    if video_path is None:
        return None, "Please upload a video first"
    
    progress(0.2, desc="Extracting frames...")
    frames, timestamps = extract_frames(video_path, num_frames, extraction_method)
    
    progress(0.6, desc="Scoring frames with CLIP...")
    scores = score_frames_with_clip(frames)
    
    frame_data = list(zip(frames, timestamps, scores))
    frame_data.sort(key=lambda x: x[2], reverse=True)
    
    progress(1.0, desc="Done!")
    
    gallery_data = []
    info_text = "**Extracted Frames (sorted by quality):**\n\n"
    
    for idx, (frame, timestamp, score) in enumerate(frame_data):
        gallery_data.append(frame)
        info_text += f"Frame {idx+1}: Time {timestamp} | Quality Score: {score:.3f}\n"
    
    return gallery_data, info_text

def generate_poster(selected_frame, style, prompt_addition, num_inference_steps, guidance_scale, strength, progress=gr.Progress()):
    if selected_frame is None:
        return None, "Please select a frame first"
    
    # Handle different input types from Gradio
    if isinstance(selected_frame, dict):
        if 'image' in selected_frame:
            img_data = selected_frame['image']
            if isinstance(img_data, dict) and 'path' in img_data:
                selected_frame = Image.open(img_data['path']).convert("RGB")
            else:
                selected_frame = Image.open(img_data).convert("RGB")
        else:
            selected_frame = selected_frame.get("composite") or selected_frame.get("background")
    
    if isinstance(selected_frame, str):
        selected_frame = Image.open(selected_frame).convert("RGB")
    
    if not isinstance(selected_frame, Image.Image):
        return None, "Error: Invalid image format"

    # PERBAIKAN 3: Style prompts yang lebih fokus pada enhancement, bukan perubahan total
    style_prompts = {
        "cinematic": "professional movie poster, enhanced lighting and colors, cinematic composition, film grain, dramatic atmosphere, masterpiece quality",
        "artistic": "artistic poster design, enhanced colors and contrast, beautiful composition, professional illustration style, high quality artwork",
        "realistic": "enhanced photorealistic quality, professional color grading, sharp details, studio lighting, high resolution photography",
        "anime": "anime poster style, vibrant colors, professional anime illustration, detailed character art, studio quality",
        "vintage": "vintage poster aesthetic, retro color palette, classic film poster style, nostalgic atmosphere, aged paper texture",
        "minimalist": "minimalist poster design, clean aesthetic, professional composition, simple elegant style, modern design",
        "noir": "film noir poster style, dramatic contrast, moody lighting, black and white with color accents, classic cinema aesthetic"
    }
    
    base_prompt = style_prompts.get(style, style_prompts["cinematic"])
    
    # PERBAIKAN 4: Prompt construction yang lebih baik
    if prompt_addition and prompt_addition.strip():
        full_prompt = f"{prompt_addition}, {base_prompt}"
    else:
        full_prompt = base_prompt
    
    # PERBAIKAN 5: Negative prompt yang lebih comprehensive
    negative_prompt = "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text, signature, username, error, cropped, worst quality, low quality, jpeg artifacts, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs"
    
    progress(0.3, desc="Loading model...")
    pipe = models.load_sdxl()
    
    progress(0.5, desc="Generating poster...")
    
    # PERBAIKAN 6: Resize dengan mempertahankan aspect ratio
    original_size = selected_frame.size
    target_size = 1024
    
    # Calculate new size maintaining aspect ratio
    aspect_ratio = original_size[0] / original_size[1]
    if aspect_ratio > 1:
        new_width = target_size
        new_height = int(target_size / aspect_ratio)
    else:
        new_height = target_size
        new_width = int(target_size * aspect_ratio)
    
    # Resize to multiple of 8 (required by SDXL)
    new_width = (new_width // 8) * 8
    new_height = (new_height // 8) * 8
    
    frame_resized = selected_frame.resize((new_width, new_height), Image.LANCZOS)
    
    # PERBAIKAN 7: Parameter generation yang lebih tepat
    result = pipe(
        prompt=full_prompt,
        negative_prompt=negative_prompt,
        image=frame_resized,
        num_inference_steps=int(num_inference_steps),
        guidance_scale=float(guidance_scale),
        strength=float(strength),  # Ini adalah parameter KUNCI - mengontrol seberapa banyak perubahan
    ).images[0]
    
    progress(1.0, desc="Done!")
    
    info = f"""**Generated Poster**

**Style:** {style}
**Prompt:** {full_prompt}
**Inference Steps:** {num_inference_steps}
**Guidance Scale:** {guidance_scale}
**Strength:** {strength} (Lower = more similar to original)
**Resolution:** {new_width}x{new_height}
"""
    
    return result, info

# Build Gradio Interface
with gr.Blocks(title="AI Video Poster Generator", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🎬 AI Video Poster Generator (FIXED VERSION)
    
    Transform your video frames into stunning posters using Stable Diffusion XL
    
    **Key Improvements:**
    - ✅ Uses proper Img2Img pipeline (preserves source image)
    - ✅ Adjustable strength parameter (control similarity to original)
    - ✅ Better aspect ratio handling
    - ✅ Enhanced prompts for better results
    """)
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 📤 Step 1: Upload Video")
            video_input = gr.Video(label="Upload Video")
            
            gr.Markdown("### ⚙️ Step 2: Extract Frames")
            num_frames = gr.Slider(3, 10, value=5, step=1, label="Number of frames")
            extraction_method = gr.Radio(["uniform", "intelligent"], value="uniform", label="Extraction Method")
            extract_btn = gr.Button("🎞️ Extract Frames", variant="primary", size="lg")
            
        with gr.Column(scale=2):
            gr.Markdown("### 🖼️ Step 3: Select Frame")
            frame_gallery = gr.Gallery(
                label="Extracted Frames (Click to select)", 
                columns=3, 
                height="auto",
                object_fit="contain"
            )
            frame_info = gr.Markdown("_Frames will appear here after extraction_")
    
    gr.Markdown("---")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### 🎨 Step 4: Generate Poster")
            selected_frame_display = gr.Image(label="Selected Frame", type="pil")
            
            style_choice = gr.Dropdown(
                ["cinematic", "artistic", "realistic", "anime", "vintage", "minimalist", "noir"], 
                value="cinematic", 
                label="Poster Style"
            )
            
            prompt_addition = gr.Textbox(
                label="Additional Prompt (Optional)",
                placeholder="e.g., 'epic action scene, hero portrait, sunset background'",
                lines=2
            )
            
            gr.Markdown("### ⚡ Generation Settings")
            
            # PERBAIKAN 8: Strength slider yang lebih jelas
            strength_slider = gr.Slider(
                0.3, 0.9, 
                value=0.5, 
                step=0.05, 
                label="Transformation Strength",
                info="Lower = more similar to original (0.3-0.5 recommended)"
            )
            
            with gr.Accordion("🔧 Advanced Settings", open=False):
                num_steps = gr.Slider(
                    20, 50, 
                    value=30, 
                    step=5, 
                    label="Inference Steps",
                    info="Higher = better quality but slower"
                )
                cfg_scale = gr.Slider(
                    5, 15, 
                    value=7.5, 
                    step=0.5, 
                    label="Guidance Scale",
                    info="How closely to follow the prompt"
                )
            
            generate_btn = gr.Button("✨ Generate Poster", variant="primary", size="lg")
            
        with gr.Column(scale=2):
            gr.Markdown("### 🎭 Generated Poster")
            output_image = gr.Image(label="AI-Generated Poster", type="pil", height=600)
            output_info = gr.Markdown("_Generated poster info will appear here_")
            
            with gr.Row():
                download_btn = gr.DownloadButton("💾 Download Poster", variant="secondary")

    # Event Handlers
    def on_gallery_select(evt: gr.SelectData):
        try:
            return evt.value['image']['path']
        except:
            return evt.value['image']

    extract_btn.click(
        fn=extract_and_score_frames, 
        inputs=[video_input, num_frames, extraction_method], 
        outputs=[frame_gallery, frame_info]
    )
    
    frame_gallery.select(
        fn=on_gallery_select, 
        outputs=[selected_frame_display]
    )
    
    generate_btn.click(
        fn=generate_poster, 
        inputs=[selected_frame_display, style_choice, prompt_addition, num_steps, cfg_scale, strength_slider], 
        outputs=[output_image, output_info]
    )
    
    # Examples section
    gr.Markdown("""
    ---
    ### 💡 Tips for Best Results:
    
    **For images similar to original:**
    - Use **Strength: 0.3-0.5** (preserves original composition)
    - Choose "realistic" or "cinematic" style
    - Add specific details in prompt
    
    **For more artistic transformation:**
    - Use **Strength: 0.6-0.8** (more creative freedom)
    - Try "artistic", "anime", or "vintage" styles
    - Experiment with different prompts
    
    **Recommended Settings:**
    - Steps: 30-40 (good balance)
    - Guidance Scale: 7-8 (natural results)
    - Strength: 0.4-0.5 (poster enhancement with similarity)
    """)

if __name__ == "__main__":
    demo.launch(

    )