import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from rembg import remove
import os
import whisper           # Import Whisper
from ultralytics import YOLO # Import YOLO
from gfpgan import GFPGANer
# import openai

import torch
from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
from rembg import remove
import os
import whisper
from ultralytics import YOLO
from gfpgan import GFPGANer
# Import PySceneDetect
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector

class ThumbnailEngine:
    def __init__(self):
        # ... (Inisialisasi __init__ sama seperti sebelumnya) ...
        print("Initializing Advanced Engine...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load Models (SDXL, YOLO, Whisper, GFPGAN) sama seperti kode terakhir...
        torch_dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        print("Loading SDXL Model...")
        self.pipe = StableDiffusionXLPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch_dtype,
            use_safetensors=True,
            variant="fp16" if self.device == "cuda" else None
        )
        self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(self.pipe.scheduler.config)
        self.pipe = self.pipe.to(self.device)
        if self.device == "cuda":
            self.pipe.enable_attention_slicing()

        print("Loading YOLOv8...")
        self.yolo_model = YOLO('yolov8n.pt')

        print("Loading Whisper...")
        self.whisper_model = whisper.load_model("base")

        print("Loading GFPGAN...")
        self.face_enhancer = GFPGANer(
            model_path='https://github.com/TencentARC/GFPGAN/releases/download/v1.3.4/GFPGANv1.4.pth',
            upscale=1, arch='clean', channel_multiplier=2
        )

    def get_highlights_from_audio(self, video_path):
        """
        Transkrip audio dan generate PAIR text (Headline & Subheadline).
        """
        print("Transcribing audio & generating Headline Pair...")
        try:
            result = self.whisper_model.transcribe(video_path)
            text = result["text"]
            
            if len(text) < 10:
                return "WATCH THIS!", "YOU WON'T BELIEVE IT"
            
            # Split kalimat
            sentences = text.replace('?', '.').replace('!', '.').split('.')
            # Ambil kalimat pertama yang panjang
            main_sent = sentences[0] if len(sentences[0]) > 20 else (sentences[1] if len(sentences) > 1 else sentences[0])
            words = main_sent.split()
            
            # Logic Bagi Teks
            # Headline: 4-5 kata pertama (Hook)
            h1_count = min(5, len(words))
            h1_words = words[:h1_count]
            
            # Subheadline: 5 kata berikutnya (Detail)
            h2_count = min(h1_count + 5, len(words))
            h2_words = words[h1_count:h2_count]
            
            # Jika kalimat terlalu pendek, buat generic
            if len(h2_words) < 2:
                h2_text = "MUST WATCH"
            else:
                h2_text = " ".join(h2_words).upper()
                
            headline = " ".join(h1_words).upper() + "!"
            
            return headline, h2_text
            
        except Exception as e:
            print(f"Error audio: {e}")
            return "THIS IS", "INSANE"

    def extract_best_frame_scenes(self, video_path):
        """
        Menggunakan PySceneDetect untuk menemukan scene change,
        lalu memilih frame dengan orang terbaik dari sana.
        """
        print("Detecting Scenes (PySceneDetect)...")
        video_manager = VideoManager([video_path])
        video_manager.start()
        scene_manager = SceneManager()
        
        # Deteksi Scene: Threshold 30.0
        scene_manager.add_detector(ContentDetector(threshold=30.0))
        
        # Deteksi scene (Membaca full video secepat mungkin)
        scene_manager.detect_scenes(frame_source=video_manager)
        scene_list = scene_manager.get_scene_list()
        
        video_manager.release()
        
        # Ambil 1 frame di tengah setiap scene sebagai kandidat
        candidate_frames = []
        
        print(f"Found {len(scene_list)} scenes. Scanning for best person frame...")
        
        for scene in scene_list[:10]: # Batasi 10 scene pertama agar tidak lama
            # Ambil frame tengah scene
            start_frame = scene[0].get_frames()
            end_frame = scene[1].get_frames()
            mid_frame_num = (start_frame + end_frame) // 2
            
            # Ekstrak frame manual
            cap = cv2.VideoCapture(video_path)
            cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame_num)
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                # Analisa Frame ini dengan YOLO
                results = self.yolo_model(frame, verbose=False)
                max_conf = 0
                box = None
                
                for r in results:
                    for b in r.boxes:
                        if int(b.cls[0]) == 0: # Person
                            if float(b.conf[0]) > max_conf:
                                max_conf = float(b.conf[0])
                                box = b.xyxy[0].cpu().numpy().astype(int)
                
                if box is not None and max_conf > 0.5:
                    # Hitung Sharpness
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    score = cv2.Laplacian(gray, cv2.CV_64F).var()
                    # Gabungkan skor kepercayaan wajah + ketajaman
                    final_score = (max_conf * 200) + score
                    candidate_frames.append((final_score, frame, box))

        # Jika PySceneDetect gagal atau tidak ketemu orang, fallback ke sampling biasa
        if not candidate_frames:
            print("Scene Detection found no good person frames. Falling back to sampling.")
            return self.extract_best_person_fallback(video_path)

        # Pilih score tertinggi
        candidate_frames.sort(key=lambda x: x[0], reverse=True)
        best_frame_cv2 = candidate_frames[0][1]
        best_box = candidate_frames[0][2]
        
        # Convert to PIL
        best_frame_rgb = cv2.cvtColor(best_frame_cv2, cv2.COLOR_BGR2RGB)
        return Image.fromarray(best_frame_rgb), best_box

    def extract_best_person_fallback(self, video_path):
        """Fallback sampling jika scene detect gagal."""
        print("Running Fallback Sampling...")
        cap = cv2.VideoCapture(video_path)
        frames = []
        count = 0
        sample = 15
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            if count % sample == 0:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                score = cv2.Laplacian(gray, cv2.CV_64F).var()
                frames.append((score, frame))
            count+=1
        cap.release()
        
        if frames:
            frames.sort(key=lambda x: x[0], reverse=True)
            best = frames[0][1]
            return Image.fromarray(cv2.cvtColor(best, cv2.COLOR_BGR2RGB)), None
        return None, None


# ... (di dalam class) jika ingin llm
    # def get_highlights_from_audio(self, video_path):
    #     result = self.whisper_model.transcribe(video_path)
    #     text = result["text"]
        
    #     # Prompt ke ChatGPT
    #     response = openai.ChatCompletion.create(
    #         model="gpt-3.5-turbo",
    #         messages=[
    #             {"role": "system", "content": "Kamu adalah penulis thumbnail YouTube expert. Ubah teks berikut menjadi judul clickbait yang pendek (maks 3 kata), menggunakan CAPS LOCK, dan menarik."},
    #             {"role": "user", "content": text}
    #         ]
    #     )
        
    #     return response.choices[0].message.content

    
    def crop_upper_body(self, image, box):
        """
        Memotong gambar fokus pada Wajah dan Badan Atas.
        Jika box None (fallback), kembalikan gambar asli.
        """
        if box is None:
            print("No bounding box found, returning full image.")
            return image
            
        img_arr = np.array(image)
        x1, y1, x2, y2 = box
        
        # Hitung lebar dan tinggi box asli dari YOLO
        w = x2 - x1
        h = y2 - y1
        
        # LOGIKA CROP SMART:
        # YOLO mendeteksi seluruh badan (kaki ke kepala).
        # Kita mau Crop Fokus Wajah (Head & Shoulders).
        # Anggap tinggi wajah + bahu itu sekitar 60-70% dari tinggi badan YOLO.
        
        # Atur batas crop baru (New Y2)
        # Kita naikkan y1 sedikit (padding atas untuk rambut)
        padding_top = int(h * 0.05) 
        new_y1 = y1 - padding_top
        if new_y1 < 0: new_y1 = 0
        
        # Kita turunkan y2 (potong kaki), ambil sampai sekitar dada/pinggang
        # Misal ambil 70% dari tinggi badan asli
        new_y2 = y1 + int(h * 0.75) 
        
        # Pastikan tidak keluar batas gambar
        if new_y2 > img_arr.shape[0]: new_y2 = img_arr.shape[0]
        
        # Atur batas lebar (X axis) - Tambah padding samping sedikit
        padding_side = int(w * 0.1)
        new_x1 = x1 - padding_side
        new_x2 = x2 + padding_side
        
        # Clamp values (jangan kurang dari 0 atau lebih dari ukuran gambar)
        new_x1 = max(0, new_x1)
        new_x2 = min(img_arr.shape[1], new_x2)
        new_y1 = max(0, new_y1)
        
        # Lakukan Crop menggunakan numpy array slicing
        cropped_arr = img_arr[new_y1:new_y2, new_x1:new_x2]
        
        # Konversi balik ke PIL Image
        return Image.fromarray(cropped_arr)
    
    def enhance_face(self, image_rgba):
        """
        Memperbaiki wajah dengan GFPGAN TAPI menjaga transparansi (Alpha Channel).
        """
        print("Restoring face details & keeping transparency...")
        
        try:
            # 1. Validasi Input: Pastikan format RGBA
            if image_rgba.mode != 'RGBA':
                image_rgba = image_rgba.convert('RGBA')

            # 2. Pisahkan Channel Alpha (Mask Transparansi)
            # A adalah channel ke-4 (R, G, B, A)
            alpha_channel = image_rgba.split()[-1] 
            
            # Ambil bagian RGB saja untuk diproses oleh GFPGAN
            # Kita konversi ke RGB biasa (tanpa alpha) agar GFPGAN tidak bingung
            image_rgb = image_rgba.convert('RGB')

            # 3. Konversi ke NumPy (BGR untuk OpenCV/GFPGAN)
            img_np = np.array(image_rgb)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            # 4. Jalankan GFPGAN
            # has_aligned=False karena cropan kita tidak wajah murni
            _, _, restored_img = self.face_enhancer.enhance(
                img_bgr, 
                has_aligned=False, 
                only_center_face=False, 
                paste_back=True 
            )
            
            # 5. Konversi hasil GFPGAN kembali ke PIL Image (RGB)
            restored_rgb = cv2.cvtColor(restored_img, cv2.COLOR_BGR2RGB)
            restored_pil = Image.fromarray(restored_rgb)
            
            # 6. Gabungkan Kembali dengan Mask Alpha Asli
            # Pastikan ukuran alpha sama dengan hasil restore (jika ada perubahan pixel)
            if restored_pil.size != alpha_channel.size:
                alpha_channel = alpha_channel.resize(restored_pil.size, Image.Resampling.LANCZOS)
            
            # Convert restored RGB ke RGBA lalu tempel mask alpha
            final_rgba = restored_pil.convert('RGBA')
            final_rgba.putalpha(alpha_channel)
            
            return final_rgba

        except Exception as e:
            print(f"Error during face enhancement: {e}")
            # Jika gagal, kembalikan gambar asli (yang sudah transparan)
            return image_rgba
        
    def extract_best_frame_scenes(self, video_path):
        """
        Mencari Best Frame.
        Jika ada orang: Pilih frame orang terbaik.
        Jika TIDAK ada orang: Pilih "Core Scene" (Frame terbaik berdasarkan sharpness).
        """
        print("Detecting Scenes & Analyzing Content...")
        video_manager = VideoManager([video_path])
        video_manager.start()
        scene_manager = SceneManager()
        scene_manager.add_detector(ContentDetector(threshold=30.0))
        
        scene_manager.detect_scenes(frame_source=video_manager)
        scene_list = scene_manager.get_scene_list()
        video_manager.release()
        
        candidate_person_frames = [] # Frame yang ada orangnya
        candidate_general_frames = [] # Frame terbaik secara visual (Core Scene)
        
        # Batasi scan ke 10 scene pertama agar cepat
        for scene in scene_list[:10]: 
            start_frame = scene[0].get_frames()
            end_frame = scene[1].get_frames()
            mid_frame_num = (start_frame + end_frame) // 2
            
            # Ekstrak frame
            cap = cv2.VideoCapture(video_path)
            cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame_num)
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                # 1. Hitung Sharpness (Visual Quality Score)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                sharpness_score = cv2.Laplacian(gray, cv2.CV_64F).var()
                
                # 2. Simpan ke kandidat general (Core Scene)
                candidate_general_frames.append((sharpness_score, frame))
                
                # 3. Cek Orang (YOLO)
                results = self.yolo_model(frame, verbose=False)
                max_conf = 0
                box = None
                for r in results:
                    for b in r.boxes:
                        if int(b.cls[0]) == 0: # Person class
                            if float(b.conf[0]) > max_conf:
                                max_conf = float(b.conf[0])
                                box = b.xyxy[0].cpu().numpy().astype(int)
                
                # Jika ketemu orang, masukkan ke kandidat prioritas
                if box is not None and max_conf > 0.5:
                    # Beri skor tambahan karena ada orang
                    final_score = (max_conf * 200) + sharpness_score
                    candidate_person_frames.append((final_score, frame, box))

        # --- LOGIKA PEMILIHAN ---
        
        if candidate_person_frames:
            # PRIORITAS 1: Jika ada orang, pilih yang terbaik
            candidate_person_frames.sort(key=lambda x: x[0], reverse=True)
            best_frame_cv2 = candidate_person_frames[0][1]
            best_box = candidate_person_frames[0][2]
            print("Best Person Found.")
            
        else:
            # PRIORITAS 2: Tidak ada orang, pakai Core Scene (Visual Terbaik)
            print("No person found. Selecting Core Scene (Best Visual Frame).")
            candidate_general_frames.sort(key=lambda x: x[0], reverse=True)
            best_frame_cv2 = candidate_general_frames[0][1]
            best_box = None # Box None karena tidak ada wajah yang dijaga

        # Konversi ke PIL Image
        best_frame_rgb = cv2.cvtColor(best_frame_cv2, cv2.COLOR_BGR2RGB)
        return Image.fromarray(best_frame_rgb), best_box
    def generate_background(self, prompt, negative_prompt="text, watermark, blurry, low quality"):
        """Generate latar belakang."""
        try:
            image = self.pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                width=1280, height=720,
                num_inference_steps=20,
                guidance_scale=7.5
            ).images[0]
            return image
        except Exception as e:
            print(f"Error generating background: {e}")
            return None

    def remove_background(self, input_image):
        """Hapus background."""
        try:
            output = remove(input_image)
            if output.mode != "RGBA":
                output = output.convert("RGBA")
            return output
        except Exception as e:
            print(f"Error removing background: {e}")
            return input_image.convert("RGBA")

    def get_smart_text_position(self, image, face_box, text_list):
        """
        Cari posisi teks yang AMAN (Tidak menutupi wajah & Tidak terpotong layar).
        face_box: [x1, y1, x2, y2] dari YOLO.
        """
        draw = ImageDraw.Draw(image)
        
        # 1. Setup Font untuk mengukur ukuran teks
        try:
            font_path = "assets/impact.ttf"
            font = ImageFont.truetype(font_path, 80) if os.path.exists(font_path) else ImageFont.truetype("arial.ttf", 80)
        except:
            font = ImageFont.load_default()

        # 2. Hitung Dimensi Teks (Total Width & Height)
        # Kita asumsikan font size 80
        line_height = 90 # 80 font + 10 spacing
        total_height = len(text_list) * line_height
        
        max_width = 0
        for text in text_list:
            # Menggunakan textbbox untuk menghitung ukuran akurat
            bbox = draw.textbbox((0, 0), text, font=font)
            width = bbox[2] - bbox[0]
            if width > max_width:
                max_width = width

        # 3. Definisikan Kandidat Posisi (Margin aman dari pinggir layar)
        margin = 40
        img_w, img_h = image.size
        
        # Kandidat 1: Kiri Atas
        pos_top_left = (margin, margin)
        
        # Kandidat 2: Kanan Atas
        pos_top_right = (img_w - max_width - margin, margin)
        
        # Kandidat 3: Tengah Bawah (Fallback jika atas penuh)
        pos_bottom_center = ((img_w - max_width) // 2, img_h - total_height - margin - 50)
        
        candidates = [pos_top_left, pos_top_right, pos_bottom_center]
        best_pos = None

        # 4. Cek Kecocokan (Collision Detection)
        # Jika face_box None (fallback error), gunakan Top Left default
        if face_box is None:
            return pos_top_left

        fx1, fy1, fx2, fy2 = face_box
        
        for (x, y) in candidates:
            # Tentukan kotak area teks
            tx1, ty1 = x, y
            tx2, ty2 = x + max_width, y + total_height
            
            # Logika Cek Tabrakan (Intersection)
            # Jika area teks tidak overlap dengan area wajah, maka aman.
            no_overlap = (
                tx2 < fx1 or  # Teks ada di kiri wajah
                tx1 > fx2 or  # Teks ada di kanan wajah
                ty2 < fy1 or  # Teks ada di atas wajah
                ty1 > fy2     # Teks ada di bawah wajah
            )
            
            if no_overlap:
                best_pos = (x, y)
                break # Pilih yang pertama cocok
        
        # Jika semua kandidat menabrak wajah, posisikan di bawah wajah (di atas dada)
        if best_pos is None:
            best_pos = ((img_w - max_width) // 2, fy2 + 20)

        return best_pos
    def suggest_background_prompt(self, transcript):
        """
        Menganalisa transkrip audio untuk menebak gaya video dan mengembalikan prompt background yang cocok.
        """
        text_lower = transcript.lower()
        
        # 1. Gaming & Tech Style
        if any(word in text_lower for word in ['game', 'play', 'tech', 'review', 'gpu', 'cpu', 'mouse', 'keyboard']):
            return "High tech gaming room, neon rgb lights, cyberpunk style, dark background, 4k, high quality"
            
        # 2. Food / Cooking Style
        elif any(word in text_lower for word in ['food', 'cook', 'eat', 'recipe', 'delicious', 'makan', 'masak']):
            return "Warm cozy kitchen background, blurred bokeh lights, soft sunlight, cinematic depth, wooden texture"
            
        # 3. Nature / Travel Style
        elif any(word in text_lower for word in ['nature', 'view', 'mountain', 'sea', 'forest', 'travel', 'gunung', 'pantai']):
            return "Beautiful nature landscape, blue sky, sunlight, high resolution, ultra detailed, bright and fresh"
            
        # 4. Finance / Business / Education Style
        elif any(word in text_lower for word in ['money', 'business', 'finance', 'work', 'office', 'uang', 'kaya', 'kerja']):
            return "Modern luxury office, glass building, professional lighting, minimalist, clean white background"
            
        # 5. Horror / Mystery Style
        elif any(word in text_lower for word in ['scary', 'ghost', 'horror', 'dark', 'hantu', 'seram']):
            return "Dark spooky forest background, fog, mysterious atmosphere, low key lighting, horror style"
            
        # 6. Default Style (Studio)
        else:
            return "Professional studio background, dark grey gradient, soft spotlight lighting, clean, 8k, simple"
         
    def add_text(self, image, text, position):
        draw = ImageDraw.Draw(image)
        try:
            font_path = "assets/impact.ttf" 
            font = ImageFont.truetype(font_path, 80) if os.path.exists(font_path) else ImageFont.truetype("arial.ttf", 80)
        except:
            font = ImageFont.load_default()

        # Efek Stroke (Bayangan Tepi)
        draw.text((position[0]-3, position[1]-3), text, font=font, fill="black", stroke_width=6)
        # Teks Utama Putih
        draw.text((position[0], position[1]), text, font=font, fill="white")
        return image

    def compose(self, bg_image, subject_image, text_list, person_box=None):
        """
        Menggabungkan Background + Subject + Text.
        person_box: Digunakan untuk menghindari text menimpa wajah.
        """
        print("Compositing final image with Smart Text Placement...")
        
        # 1. Face Enhancement (Opsional, aktifkan jika mau)
        # if subject_image.mode != "RGBA":
        #     subject_image = subject_image.convert("RGBA")
        # subject_image = self.enhance_face(subject_image)
        
        # Pastikan Subject RGBA
        if subject_image.mode != "RGBA":
            subject_image = subject_image.convert("RGBA")
            
        # 2. Persiapan Background
        if bg_image.mode != "RGBA": bg_image = bg_image.convert("RGBA")
        final_bg = bg_image
        
        bg_w, bg_h = final_bg.size
        subj_w, subj_h = subject_image.size
        
        # 3. Resize Subject
        scale_ratio = (bg_w * 0.65) / subj_w
        new_size = (int(subj_w * scale_ratio), int(subj_h * scale_ratio))
        subject_resized = subject_image.resize(new_size, Image.Resampling.LANCZOS)
        
        # 4. Paste Subject
        paste_pos = ((bg_w - new_size[0]) // 2, bg_h - new_size[1] + 50)
        try:
            final_bg.paste(subject_resized, paste_pos, subject_resized)
        except:
            final_bg.paste(subject_resized, paste_pos)
            
        # 5. Text Placement dengan parameter person_box
        text_pos = self.get_smart_text_position(final_bg, person_box, text_list)
        
        final_img = final_bg.convert("RGB")
        for i, text in enumerate(text_list):
            # Kita gunakan fungsi add_text biasa, tapi posisinya sudah dihitung aman
            final_img = self.add_text(final_img, text, text_pos)
            # Update Y posisi untuk baris berikutnya
            text_pos = (text_pos[0], text_pos[1] + 90)
            
        return final_img