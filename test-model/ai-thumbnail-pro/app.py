import gradio as gr
from src.core import ThumbnailEngine

engine = None

def load_engine():
    global engine
    if engine is None:
        engine = ThumbnailEngine()
    return "Model Ready! ✅"

# --- FUNGSI 1: AUTO BACKGROUND (Menebak Gaya Video) ---
def suggest_prompt(video_path):
    """
    Menebak prompt background berdasarkan isi video.
    """
    load_engine()
    if video_path is None:
        return ""
    try:
        # Ambil transkrip dulu
        result = engine.whisper_model.transcribe(video_path)
        transcript = result["text"]
        
        # Gunakan fungsi suggest_background_prompt dari core.py
        prompt = engine.suggest_background_prompt(transcript)
        return prompt
    except Exception as e:
        print(f"Error suggesting prompt: {e}")
        return "Cinematic lighting, dark studio background, 4k" # Fallback

# --- FUNGSI 2: AUTO HEADLINE (Isi 2 Kotak Teks) ---
def generate_headline_pair(video_path):
    """
    Mengisi Headline dan Subheadline secara otomatis.
    """
    load_engine()
    if video_path is None:
        return "", ""
    try:
        top_text, bottom_text = engine.get_highlights_from_audio(video_path)
        return top_text, bottom_text
    except Exception as e:
        print(f"Error generating headline: {e}")
        return "THIS IS", "INSANE"

# --- FUNGSI 3: PROSES UTAMA (Generate Thumbnail) ---
def process_video(video_path, prompt, text_top, text_bottom, progress=gr.Progress()):
    if video_path is None:
        return None, None, "❌ Error: Mohon upload video terlebih dahulu."
    
    try:
        progress(0.1, desc="Loading AI Engine...")
        load_engine()
        
        progress(0.2, desc="Scanning Video Scenes (Smart Detection)...")
        # Panggil logika Core Scene / Orang
        best_frame_img, person_box = engine.extract_best_frame_scenes(video_path)
        
        if best_frame_img is None:
            return None, None, "❌ Error: Gagal mengambil frame video."

        # Cek Jika ada orang atau tidak
        if person_box is None:
            # Tidak ada orang -> Crop Tengah (Core Scene)
            print("Core Scene detected. Processing full frame object.")
            w, h = best_frame_img.size
            # Ambil kotak tengah 800x800
            left = (w - 800) // 2
            top = (h - 800) // 2
            right = (w + 800) // 2
            bottom = (h + 800) // 2
            cropped_subject = best_frame_img.crop((left, top, right, bottom))
        else:
            # Ada orang -> Crop Wajah/Badan
            progress(0.4, desc="Cropping Subject (Face & Body)...")
            cropped_subject = engine.crop_upper_body(best_frame_img, person_box)

        progress(0.6, desc="Removing Background...")
        subject_no_bg = engine.remove_background(cropped_subject)
        
        progress(0.75, desc="Generating Artistic Background...")
        bg_img = engine.generate_background(prompt)
        
        if bg_img is None:
            return None, None, "❌ Error: Gagal generate background."
            
        progress(0.9, desc="Compositing Final Image...")
        final_img = engine.compose(
            bg_img, 
            subject_no_bg, 
            [text_top, text_bottom],
            person_box = person_box
        )
        
        # KEMBALIKAN 3 HASIL: Final, Preview, Status
        return final_img, best_frame_img, "✅ Thumbnail Selesai!"
        
    except Exception as e:
        print(f"System Error: {e}")
        return None, None, f"❌ Terjadi Error: {str(e)}"

# --- UI GRADIO ---
with gr.Blocks(title="AI Smart Thumbnail Pro") as demo:
    gr.Markdown("# 🎬 AI Thumbnail Pro (Core Scene & Smart Context)")
    gr.Markdown("Fitur: Otomatis menebak background, text, dan memilih scene terbaik (Orang/Objek).")
    
    with gr.Row():
        with gr.Column(scale=1):
            # Input Video
            video_input = gr.Video(label="1. Upload Source Video")
            
            # Settings
            with gr.Accordion("⚙️ Smart Settings", open=True):
                # Prompt Background
                prompt_input = gr.Textbox(
                    label="2. Background Prompt", 
                    value="Cinematic lighting, dark studio, 4k",
                    lines=2
                )
                # Tombol Auto Background (MENGHILANG PADA VERSI SEBELUMNYA)
                auto_bg_btn = gr.Button("🎨 Auto-Background (Based on Topic)", size="sm", variant="secondary")
                
                gr.Markdown("---") # Garis pemisah
                
                # Tombol Auto Text
                auto_text_btn = gr.Button("✨ Auto-Generate Headline & Subheadline", size="lg", variant="secondary")
                
                # Input Text
                text_top = gr.Textbox(label="3. Headline (Top)", value="THIS IS")
                text_bottom = gr.Textbox(label="4. Subheadline (Bottom)", value="INSANE!")
                
            # Tombol Generate Utama
            generate_btn = gr.Button("🚀 Generate Thumbnail", variant="primary", size="lg")
            status_msg = gr.Textbox(label="Status", interactive=False)

        with gr.Column(scale=1):
            # Output Preview Scene
            preview_scene = gr.Image(label="🔍 Best Scene Selected (Preview)", type="pil")
            # Output Final
            output_image = gr.Image(label="5. Final Result")

    # --- EVENT LISTENERS (PENTING) ---
    
    # 1. Event Auto Background (Kirim video, terima prompt)
    auto_bg_btn.click(
        fn=suggest_prompt,
        inputs=[video_input],
        outputs=[prompt_input]
    )

    # 2. Event Auto Text (Kirim video, terima top & bottom)
    auto_text_btn.click(
        fn=generate_headline_pair,
        inputs=[video_input],
        outputs=[text_top, text_bottom]
    )

    # 3. Event Generate Utama
    generate_btn.click(
        fn=process_video,
        inputs=[video_input, prompt_input, text_top, text_bottom],
        outputs=[output_image, preview_scene, status_msg]
    )

if __name__ == "__main__":
    demo.launch()