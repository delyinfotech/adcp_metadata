"""

DEPENDENCIES:
pip install gradio deepface opencv-python tensorflow
pip install transformers torch pillow numpy
pip install openai-whisper librosa soundfile
pip install scenedetect[opencv] pytesseract pdf2image PyPDF2
"""
import requests
import gradio as gr
import mimetypes
from pathlib import Path
import json
import warnings
import sys
import cv2
import torch
import numpy as np
from PIL import Image

warnings.filterwarnings('ignore')

# Safe imports with fallbacks
print("🔧 Initializing AI Metadata Extractor...")

# Check Python version
if sys.version_info < (3, 8):
    print("⚠️ Python 3.8+ required. Current version:", sys.version)

# Core imports
try:
    import numpy as np
    print(f"✅ NumPy {np.__version__}")
except ImportError:
    print("❌ NumPy not found. Install: pip install numpy")
    sys.exit(1)

try:
    from PIL import Image
    print("✅ PIL/Pillow loaded")
except ImportError:
    print("❌ Pillow not found. Install: pip install Pillow")
    sys.exit(1)

# PyTorch
TORCH_AVAILABLE = False
try:
    import torch
    TORCH_AVAILABLE = True
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"✅ PyTorch {torch.__version__} (device: {device})")
except ImportError:
    device = "cpu"
    print("⚠️ PyTorch not available. Install: pip install torch")

# Transformers
TRANSFORMERS_AVAILABLE = False
try:
    from transformers import (
        BlipProcessor, BlipForConditionalGeneration,  # Fixed: Using BLIP not BLIP-2
        CLIPProcessor, CLIPModel,
        BartForConditionalGeneration, BartTokenizer,
        pipeline
    )
    TRANSFORMERS_AVAILABLE = True
    print("✅ Transformers loaded")
except ImportError:
    print("⚠️ Transformers not available. Install: pip install transformers")

# Whisper
WHISPER_AVAILABLE = False
try:
    import whisper
    WHISPER_AVAILABLE = True
    print("✅ Whisper loaded")
except ImportError:
    print("⚠️ Whisper not available. Install: pip install openai-whisper")

# DeepFace for face recognition
DEEPFACE_AVAILABLE = False
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("✅ DeepFace loaded")
except ImportError:
    print("⚠️ DeepFace not available. Install: pip install deepface")

# OpenCV
CV2_AVAILABLE = False
try:
    import cv2
    CV2_AVAILABLE = True
    print("✅ OpenCV loaded")
except ImportError:
    print("⚠️ OpenCV not available. Install: pip install opencv-python")

# Audio processing
LIBROSA_AVAILABLE = False
try:
    import librosa
    import soundfile as sf
    LIBROSA_AVAILABLE = True
    print("✅ Librosa loaded")
except ImportError:
    print("⚠️ Librosa not available. Install: pip install librosa soundfile")

# OCR
OCR_AVAILABLE = False
try:
    import pytesseract
    from pdf2image import convert_from_path
    from PyPDF2 import PdfReader
    OCR_AVAILABLE = True
    print("✅ OCR tools loaded")
except ImportError:
    print("⚠️ OCR not available. Install: pip install pytesseract pdf2image PyPDF2")

# SceneDetect
SCENEDETECT_AVAILABLE = False   
try:
    from scenedetect import detect, ContentDetector
    SCENEDETECT_AVAILABLE = True
    print("✅ SceneDetect loaded")
except ImportError:
    print("⚠️ SceneDetect not available. Install: pip install scenedetect[opencv]")

print("=" * 50)


class MetadataExtractor:
    def __init__(self, face_db_path=None):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.face_db_path = face_db_path
        self.known_faces_db = {}
        self.luxand_api_token = "ISI_API_TOKEN_ANDA_DISINI"
        self.luxand_base_url = "https://api.luxand.cloud"
        
        if face_db_path and Path(face_db_path).exists():
            self.load_face_database(face_db_path)

        print(f"🖥️ Using device: {self.device}")
        
        # Load face database if provided
        if face_db_path and Path(face_db_path).exists():
            print(f"📂 Loading face database from: {face_db_path}")
            self.load_face_database(face_db_path)
    
    def load_face_database(self, db_path):
        """Load celebrity face database from folder structure"""
        try:
            db_path = Path(db_path)
            celebrity_folders = [f for f in db_path.iterdir() if f.is_dir()]
            
            print(f"👥 Found {len(celebrity_folders)} celebrities in database")
            
            for celeb_folder in celebrity_folders:
                celeb_name = celeb_folder.name.replace('_', ' ')
                self.known_faces_db[celeb_name] = str(celeb_folder)
            
            print(f"✅ Face database loaded: {len(self.known_faces_db)} celebrities")
            
        except Exception as e:
            print(f"❌ Failed to load face database: {e}")
        
    def load_blip(self):
        """Load BLIP-2 dengan Kuantisasi 4-bit (Sangat Kecil & Cepat)"""
        if "BLIP2" not in self.models:
            try:
                from transformers import Blip2Processor, Blip2ForConditionalGeneration
                import torch
                
                model_id = "Salesforce/blip2-opt-2.7b"
                print(f"📥 Loading Compressed BLIP-2: {model_id}...")
                
                processor = Blip2Processor.from_pretrained(model_id)
                # OPTIMASI: Load dalam 4-bit untuk memangkas penggunaan VRAM dari 15GB ke ~3.5GB
                model = Blip2ForConditionalGeneration.from_pretrained(
                    model_id,
                    load_in_4bit=True,
                    device_map="auto",
                    torch_dtype=torch.float16
                )
                
                self.models["BLIP2"] = (processor, model)
                print("✅ BLIP-2 (4-bit) Loaded")
            except Exception as e:
                print(f"❌ BLIP-2 failed: {e}")
                return None
        return self.models.get("BLIP2")

    
    def load_clip(self):
        """Load CLIP model"""
        if not TRANSFORMERS_AVAILABLE or not TORCH_AVAILABLE:
            return None
            
        if "CLIP" not in self.models:
            try:
                print("📥 Loading CLIP...")
                processor = CLIPProcessor.from_pretrained(
                    "openai/clip-vit-base-patch32"
                )
                model = CLIPModel.from_pretrained(
                    "openai/clip-vit-base-patch32"
                )
                if self.device == "cuda":
                    model = model.to(self.device)
                self.models["CLIP"] = (processor, model)
                print("✅ CLIP loaded")
            except Exception as e:
                print(f"❌ CLIP load failed: {e}")
                return None
        return self.models.get("CLIP")
    
    def load_whisper(self):
        """Load Whisper model"""
        if not WHISPER_AVAILABLE:
            return None
            
        if "Whisper" not in self.models:
            try:
                print("📥 Loading Whisper...")
                model = whisper.load_model("base", device=self.device)  # Changed to 'base' for faster loading
                self.models["Whisper"] = model
                print("✅ Whisper loaded")
            except Exception as e:
                print(f"❌ Whisper load failed: {e}")
                return None
        return self.models.get("Whisper")
    
    def load_llm(self):
        """Load Mistral-7B dalam mode 4-bit agar tidak crash di Windows"""
        if "LLM" not in self.models:
            try:
                from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
                
                # Menggunakan varian BNB-4bit yang sudah dikompresi
                model_id = "unsloth/mistral-7b-instruct-v0.3-bnb-4bit"
                print(f"📥 Loading 4-bit LLM: {model_id}...")

                tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=False)
                pipe = pipeline(
                    "text-generation",
                    model=model_id,
                    tokenizer=tokenizer,
                    device_map="auto" # Otomatis bagi beban antara GPU dan RAM
                )
                self.models["LLM"] = pipe
                print("✅ LLM (4-bit) Loaded")
            except Exception as e:
                print(f"❌ LLM failed: {e}")
                return None
        return self.models["LLM"]
    
    def load_bart(self):
        """Load BART model"""
        if not TRANSFORMERS_AVAILABLE or not TORCH_AVAILABLE:
            return None
            
        if "BART" not in self.models:
            try:
                print("📥 Loading BART...")
                tokenizer = BartTokenizer.from_pretrained(
                    "facebook/bart-large-cnn"
                )
                model = BartForConditionalGeneration.from_pretrained(
                    "facebook/bart-large-cnn"
                )
                if self.device == "cuda":
                    model = model.to(self.device)
                self.models["BART"] = (tokenizer, model)
                print("✅ BART loaded")
            except Exception as e:
                print(f"❌ BART load failed: {e}")
                return None
        return self.models.get("BART")
    
    def load_nsfw_detector(self):
        """Load NSFW detector"""
        if not TRANSFORMERS_AVAILABLE or not TORCH_AVAILABLE:
            return None
            
        if "NSFW" not in self.models:
            try:
                print("📥 Loading NSFW detector...")
                classifier = pipeline(
                    "image-classification",
                    model="Falconsai/nsfw_image_detection",
                    device=0 if self.device == "cuda" else -1
                )
                self.models["NSFW"] = classifier
                print("✅ NSFW detector loaded")
            except Exception as e:
                print(f"❌ NSFW detector load failed: {e}")
                return None
        return self.models.get("NSFW")
    
    def detect_file_type(self, file_path):
        """Detect file type"""
        if file_path is None:
            return None
            
        mime_type, _ = mimetypes.guess_type(file_path)
        
        if mime_type:
            if mime_type.startswith('image/'):
                return 'image'
            elif mime_type.startswith('video/'):
                return 'video'
            elif mime_type.startswith('audio/'):
                return 'audio'
            elif 'pdf' in mime_type or 'text' in mime_type:
                return 'document'
        
        # Fallback: check extension
        ext = Path(file_path).suffix.lower()
        if ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            return 'image'
        elif ext in ['.mp4', '.avi', '.mov', '.mkv']:
            return 'video'
        elif ext in ['.mp3', '.wav', '.flac', '.m4a']:
            return 'audio'
        elif ext in ['.pdf', '.txt', '.doc', '.docx']:
            return 'document'
            
        return 'unknown'
    
    def get_available_models(self, file_type):
        """Get available models for file type"""
        models = {
            'image': [],
            'video': [],
            'audio': [],
            'document': []
        }
        
        # Image models
        if TRANSFORMERS_AVAILABLE and TORCH_AVAILABLE:
            models['image'].extend(['BLIP-2', 'CLIP', 'Policy Engine'])
        if DEEPFACE_AVAILABLE:
            models['image'].append('Face Recognition')
        
        # Video models
        if WHISPER_AVAILABLE:
            models['video'].append('Whisper')
        if TRANSFORMERS_AVAILABLE:
            models['video'].append('CLIP')
        if CV2_AVAILABLE:
            models['video'].append('Scene Detector')
        if DEEPFACE_AVAILABLE:
            models['video'].append('Face Recognition')
        
        # Audio models
        if WHISPER_AVAILABLE:
            models['audio'].append('Whisper')
        
        # Document models
        if TRANSFORMERS_AVAILABLE and TORCH_AVAILABLE:
            models['document'].append('BART')
        if OCR_AVAILABLE:
            models['document'].append('OCR')
        
        return models.get(file_type, [])
    
    def extract_faces_luxand(self, file_path):
        """Ekstraksi wajah menggunakan Luxand Cloud API"""
        url = f"{self.luxand_base_url}/photo/search/v2"
        headers = {"token": self.luxand_api_token}
        
        try:
            with open(file_path, "rb") as f:
                files = {"photo": f}
                # Mencari wajah yang dikenal dalam koleksi Luxand Anda
                response = requests.post(url, headers=headers, files=files)
                data = response.json()

            if response.status_code != 200:
                return {"error": f"Luxand API Error: {data.get('message', 'Unknown error')}"}

            results = {
                "model": "Luxand Cloud AI",
                "total_faces": len(data),
                "faces": []
            }

            for face in data:
                results["faces"].append({
                    "name": face.get("name", "Unknown"),
                    "probability": f"{face.get('probability', 0)*100:.2f}%",
                    "rectangle": face.get("rectangle"),
                    # Luxand juga bisa memberikan atribut jika endpoint diganti ke /photo/detect
                    "id": face.get("uuid")
                })

            return results

        except Exception as e:
            return {"error": f"Luxand Integration failed: {str(e)}"}
    
    def extract_image_blip(self, file_path):
        """Extract with BLIP"""
        try:
            result = self.load_blip()
            if result is None:
                return {"error": "BLIP not available"}
            
            processor, model = result
            image = Image.open(file_path).convert('RGB')
            
            inputs = processor(image, return_tensors="pt")
            if self.device == "cuda":
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                output = model.generate(**inputs, max_length=50)
            
            caption = processor.decode(output[0], skip_special_tokens=True)
            
            return {
                "model": "BLIP-2",
                "caption": caption,
                "image_size": f"{image.size[0]}x{image.size[1]}",
                "format": image.format or "Unknown"
            }
            
        except Exception as e:
            return {"error": f"BLIP failed: {str(e)}"}
    
    def extract_image_clip(self, file_path):
        """Extract with CLIP"""
        try:
            result = self.load_clip()
            if result is None:
                return {"error": "CLIP not available"}
            
            processor, model = result
            image = Image.open(file_path).convert('RGB')
            
            categories = [
                "a photo of a person", "a photo of nature",
                "a photo of a building", "a photo of food",
                "a photo of an animal", "a landscape photo"
            ]
            
            inputs = processor(
                text=categories,
                images=image,
                return_tensors="pt",
                padding=True
            )
            
            if self.device == "cuda":
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = model(**inputs)
                probs = outputs.logits_per_image.softmax(dim=1)
            
            top_probs, top_indices = torch.topk(probs[0], k=3)
            top_categories = [
                {categories[idx]: f"{prob.item()*100:.1f}%"}
                for idx, prob in zip(top_indices, top_probs)
            ]
            
            return {
                "model": "CLIP",
                "top_categories": top_categories,
                "confidence": f"{top_probs[0].item()*100:.1f}%"
            }
            
        except Exception as e:
            return {"error": f"CLIP failed: {str(e)}"}
    
    def extract_faces_image(self, file_path):
        """Versi Optimasi Tinggi untuk Deteksi Wajah & Selebriti"""
        if not DEEPFACE_AVAILABLE:
            return {"error": "DeepFace not available"}
        
        try:
            # OPTIMASI 1: Gunakan RetinaFace untuk deteksi yang jauh lebih kuat
            # OPTIMASI 2: Gunakan Facenet512 untuk recognition yang lebih presisi
            
            print(f"👤 Analyzing faces with High-Precision Model...")
            
            # Cari kecocokan di database terlebih dahulu
            celebrity_results = []
            if self.face_db_path:
                try:
                    dfs = DeepFace.find(
                        img_path=file_path,
                        db_path=self.face_db_path,
                        model_name='Facenet512',      # Model recognition terkuat
                        detector_backend='retinaface', # Detector paling akurat
                        distance_metric='cosine',      # Metric paling stabil
                        enforce_detection=False,
                        align=True,                    # Menyejajarkan posisi wajah
                        silent=True
                    )
                    celebrity_results = dfs
                except Exception as e:
                    print(f"Database search error: {e}")

            # Analisis atribut (Umur, Gender, Emosi)
            analysis = DeepFace.analyze(
                img_path=file_path,
                actions=['age', 'gender', 'emotion'],
                detector_backend='retinaface',
                enforce_detection=False,
                align=True,
                silent=True
            )

            # Mapping hasil
            results = {"model": "DeepFace Optimized (RetinaFace + Facenet512)", "faces": []}
            
            # Pastikan analysis selalu berupa list
            if not isinstance(analysis, list):
                analysis = [analysis]

            for idx, face_data in enumerate(analysis):
                face_info = {
                    "face_id": idx + 1,
                    "age": face_data.get('age'),
                    "gender": face_data.get('dominant_gender'),
                    "emotion": face_data.get('dominant_emotion'),
                    "celebrity_match": "Unknown",
                    "confidence": f"{face_data.get('face_confidence', 0)*100:.2f}%"
                }

                # Cek hasil dari fungsi find()
                if celebrity_results and len(celebrity_results) > idx:
                    df = celebrity_results[idx]
                    if not df.empty:
                        best_match = df.iloc[0]
                        # Ambang batas (threshold) untuk Facenet512 + Cosine biasanya 0.3
                        if best_match['distance'] < 0.35: 
                            celeb_name = Path(best_match['identity']).parent.name.replace('_', ' ')
                            match_conf = (1 - best_match['distance']) * 100
                            face_info["celebrity_match"] = celeb_name
                            face_info["match_confidence"] = f"{match_conf:.2f}%"

                results["faces"].append(face_info)
            
            return results
            
        except Exception as e:
            return {"error": f"High-precision face recognition failed: {str(e)}"}
    def update_preview(self, file_obj):
        if file_obj is None:
            return None, None
        
        file_path = file_obj.name
        file_type = self.detect_file_type(file_path)
        
        if file_type == 'image':
            return file_path, None
        elif file_type == 'video':
            return None, file_path
        return None, None
    
    def extract_faces_video(self, file_path):
        """Extract faces from video with timestamps and celebrity recognition"""
        if not DEEPFACE_AVAILABLE or not CV2_AVAILABLE:
            return {"error": "DeepFace or OpenCV not available"}
        
        try:
            print(f"👤 Analyzing faces in video: {file_path}")
            
            cap = cv2.VideoCapture(file_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = 0
            
            face_appearances = {}
            temp_frame_path = "temp_frame.jpg"
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process every 30 frames (1 second for 30fps video)
                if frame_count % 30 == 0:
                    timestamp = frame_count / fps
                    
                    # Save frame temporarily
                    cv2.imwrite(temp_frame_path, frame)
                    
                    try:
                        # Try celebrity recognition first if database exists
                        celebrity_found = None
                        if self.face_db_path and self.known_faces_db:
                            try:
                                dfs = DeepFace.find(
                                    img_path=temp_frame_path,
                                    db_path=self.face_db_path,
                                    model_name='Facenet512',
                                    distance_metric='cosine',
                                    enforce_detection=False,
                                    silent=True
                                )
                                
                                if isinstance(dfs, list) and len(dfs) > 0:
                                    df = dfs[0]
                                    if not df.empty:
                                        best_match_path = df.iloc[0]['identity']
                                        distance = df.iloc[0]['distance']
                                        celebrity_name = Path(best_match_path).parent.name.replace('_', ' ')
                                        confidence = (1 - distance) * 100
                                        
                                        if confidence > 50:  # Threshold for celebrity recognition
                                            celebrity_found = {
                                                "name": celebrity_name,
                                                "confidence": confidence
                                            }
                            except:
                                pass
                        
                        # Analyze face attributes
                        analysis = DeepFace.analyze(
                            img_path=temp_frame_path,
                            actions=['age', 'gender', 'race', 'emotion'],
                            enforce_detection=False,
                            silent=True
                        )
                        
                        if isinstance(analysis, list) and len(analysis) > 0:
                            face_analysis = analysis[0]
                            
                            # Create unique face identifier
                            if celebrity_found:
                                face_id = celebrity_found["name"]
                            else:
                                face_id = f"{face_analysis.get('dominant_gender')}_{face_analysis.get('age')}"
                            
                            if face_id not in face_appearances:
                                face_appearances[face_id] = {
                                    "is_celebrity": celebrity_found is not None,
                                    "celebrity_confidence": f"{celebrity_found['confidence']:.2f}%" if celebrity_found else "N/A",
                                    "age": face_analysis.get('age'),
                                    "gender": face_analysis.get('dominant_gender'),
                                    "race": face_analysis.get('dominant_race'),
                                    "appearances": []
                                }
                            
                            face_appearances[face_id]["appearances"].append({
                                "timestamp": f"{int(timestamp//60):02d}:{int(timestamp%60):02d}",
                                "seconds": f"{timestamp:.2f}s",
                                "emotion": face_analysis.get('dominant_emotion')
                            })
                            
                    except Exception as e:
                        print(f"Frame {frame_count} analysis failed: {e}")
                
                frame_count += 1
                
                # Limit processing to first 5 minutes for demo (remove this for full video)
                # if frame_count > fps * 300:  # 5 minutes
                #     break
            
            cap.release()
            
            # Clean up temp file
            if Path(temp_frame_path).exists():
                Path(temp_frame_path).unlink()
            
            # Format results with time ranges
            results = {
                "model": "DeepFace Video Analysis",
                "total_unique_faces": len(face_appearances),
                "celebrities_found": sum(1 for data in face_appearances.values() if data["is_celebrity"]),
                "faces": []
            }
            
            for face_id, data in face_appearances.items():
                appearances = data["appearances"]
                face_result = {
                    "name": face_id,
                    "is_celebrity": data["is_celebrity"],
                    "age": data["age"],
                    "gender": data["gender"],
                    "race": data["race"],
                    "first_appearance": appearances[0]["timestamp"],
                    "last_appearance": appearances[-1]["timestamp"],
                    "total_appearances": len(appearances),
                    "timestamps": appearances[:10]  # Limit to first 10 appearances
                }
                
                if data["is_celebrity"]:
                    face_result["celebrity_confidence"] = data["celebrity_confidence"]
                
                results["faces"].append(face_result)
            
            return results
            
        except Exception as e:
            return {"error": f"Video face recognition failed: {str(e)}"}
    
    def extract_policy_engine_image(self, file_path):
        """Policy Engine for images"""
        try:
            image = Image.open(file_path).convert('RGB')
            
            # NSFW Detection
            nsfw_classifier = self.load_nsfw_detector()
            if nsfw_classifier:
                nsfw_results = nsfw_classifier(image)
                nsfw_score = next(
                    (item['score'] for item in nsfw_results if item['label'] == 'nsfw'),
                    0
                )
            else:
                nsfw_score = 0
            
            # Simple violence detection
            img_array = np.array(image)
            red_ratio = np.mean(img_array[:,:,0]) / 255.0
            violence_score = min(red_ratio * 2, 1.0) if red_ratio > 0.4 else 0.1
            
            # Safety assessment
            safety_score = 1.0 - max(nsfw_score, violence_score)
            
            if safety_score >= 0.8:
                status = "SAFE ✅"
                risk_level = "Low"
            elif safety_score >= 0.5:
                status = "REVIEW REQUIRED ⚠️"
                risk_level = "Medium"
            else:
                status = "BLOCKED ❌"
                risk_level = "High"
            
            violations = []
            if nsfw_score > 0.5:
                violations.append("NSFW Content")
            if violence_score > 0.6:
                violations.append("Violence/Gore")
            
            return {
                "model": "Policy Engine",
                "status": status,
                "safety_score": f"{safety_score*100:.1f}%",
                "risk_level": risk_level,
                "nsfw_confidence": f"{nsfw_score*100:.1f}%",
                "violence_confidence": f"{violence_score*100:.1f}%",
                "violations": violations if violations else ["None"],
                "action": "Block" if risk_level == "High" else "Review" if risk_level == "Medium" else "Allow"
            }
            
        except Exception as e:
            return {"error": f"Policy Engine failed: {str(e)}"}
        
    def extract_scenes(self, video_path):
        """Detect scenes and summarize each scene with AI"""
        if not SCENEDETECT_AVAILABLE or not CV2_AVAILABLE:
            return {"error": "PySceneDetect or OpenCV not installed"}

        try:
            print(f"🎬 Analyzing scenes for: {video_path}")
            scene_list = detect(video_path, ContentDetector())
            
            results = []
            all_captions = []
            
            cap = cv2.VideoCapture(video_path)
            
            for i, scene in enumerate(scene_list):
                start_time = scene[0].get_seconds()
                end_time = scene[1].get_seconds()
                mid_frame = int((scene[0].get_frames() + scene[1].get_frames()) / 2)
                
                cap.set(cv2.CAP_PROP_POS_FRAMES, mid_frame)
                ret, frame = cap.read()
                
                scene_description = "Could not analyze frame"
                if ret:
                    pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                    res = self.extract_image_blip_internal(pil_img)
                    scene_description = res.get("caption", "No description")
                
                all_captions.append(scene_description)
                
                results.append({
                    "scene_no": i + 1,
                    "start": f"{int(start_time//60):02d}:{int(start_time%60):02d}",
                    "end": f"{int(end_time//60):02d}:{int(end_time%60):02d}",
                    "start_seconds": f"{start_time:.2f}s",
                    "end_seconds": f"{end_time:.2f}s",
                    "visual_description": scene_description
                })

            cap.release()

            combined_context = " ".join(all_captions)
            summary = self.summarize_text(combined_context) if len(all_captions) > 0 else "N/A"
            
            words = combined_context.lower().split()
            tags = list(set([w for w in words if len(w) > 4]))[:8]

            return {
                "total_scenes": len(results),
                "video_summary": summary,
                "key_tags": tags,
                "scenes": results
            }

        except Exception as e:
            return {"error": f"Scene detection failed: {str(e)}"}
            
    def extract_audio_whisper(self, file_path):
        """Extract with Whisper -> Auto Summarize with BART"""
        try:
            if not WHISPER_AVAILABLE:
                return {"error": "Whisper not available"}
            
            model = self.load_whisper()
            if model is None:
                return {"error": "Failed to load Whisper"}
            
            result = model.transcribe(file_path, fp16=False)
            full_text = result["text"]
            
            duration_val = 0
            if LIBROSA_AVAILABLE:
                duration_val = librosa.get_duration(path=file_path)
            else:
                duration_val = result.get('duration', 0)

            summary = "Text too short to summarize"
            if len(full_text.split()) > 20:
                summary = self.summarize_text(full_text)
            
            return {
                "model": "Whisper + BART",
                "language": result.get("language", "en"),
                "duration": f"{int(duration_val//60):02d}:{int(duration_val%60):02d}",
                "duration_seconds": f"{duration_val:.2f}s",
                "word_count": len(full_text.split()),
                "summary": summary,
                "transcript": full_text
            }
            
        except Exception as e:
            return {"error": f"Whisper failed: {str(e)}"}
    def summarize_text(self, text):
        """Ringkasan menggunakan Prompt Engineering (Mistral/Llama Style)"""
        llm_pipe = self.load_llm()
        if llm_pipe is None:
            return "LLM tidak tersedia."

        # Membuat Prompt agar model fokus meringkas, bukan menjawab pertanyaan
        # Mistral menggunakan format [INST] ... [/INST]
        prompt = f"""[INST] You are an expert summarizer. Please provide a concise and clear summary of the following transcript. 
        Focus on the main key points and ignore filler words:

        {text[:2500]} 
        [/INST]"""

        try:
            # Generate summary
            outputs = llm_pipe(
                prompt,
                max_new_tokens=250,
                do_sample=True,
                temperature=0.7,
                top_k=50,
                top_p=0.95
            )
            
            # Mengambil hasil teks setelah bagian [/INST]
            full_response = outputs[0]["generated_text"]
            summary = full_response.split("[/INST]")[-1].strip()
            return summary
        except Exception as e:
            return f"Error during summarization: {str(e)}"
        
    # using bart for summarization
    # def summarize_text(self, text):
    #     """Helper function to call BART"""
    #     res = self.load_bart()
    #     if res is None:
    #         return "BART not available"
    #     tokenizer, model = res
        
    #     inputs = tokenizer(text[:1024], return_tensors="pt", truncation=True).to(self.device)
        
    #     with torch.no_grad():
    #         summary_ids = model.generate(
    #             inputs["input_ids"], 
    #             max_length=150, 
    #             min_length=40, 
    #             num_beams=4,
    #             early_stopping=True
    #         )
    #     return tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    def extract_image_blip_internal(self, pil_img):
        """Internal helper for BLIP"""
        res = self.load_blip()
        if not res:
            return {}
        processor, model = res
        inputs = processor(pil_img, return_tensors="pt").to(self.device)
        with torch.no_grad():
            output = model.generate(**inputs, max_length=50)
        return {"caption": processor.decode(output[0], skip_special_tokens=True)}
    
    def extract_document_bart(self, file_path):
        """Extract with BART"""
        try:
            result = self.load_bart()
            if result is None:
                return {"error": "BART not available"}
            
            tokenizer, model = result
            
            ext = Path(file_path).suffix.lower()
            
            if ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            elif ext == '.pdf' and OCR_AVAILABLE:
                try:
                    reader = PdfReader(file_path)
                    text = " ".join([page.extract_text() for page in reader.pages])
                except:
                    return {"error": "Could not extract PDF text"}
            else:
                return {"error": f"Unsupported format: {ext}"}
            
            text_chunk = text[:1024]
            inputs = tokenizer(
                text_chunk,
                return_tensors="pt",
                max_length=1024,
                truncation=True
            )
            
            if self.device == "cuda":
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                summary_ids = model.generate(
                    inputs["input_ids"],
                    max_length=150,
                    min_length=40,
                    num_beams=4
                )
            
            summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
            
            return {
                "model": "BART",
                "summary": summary,
                "original_words": len(text.split()),
                "summary_words": len(summary.split())
            }
            
        except Exception as e:
            return {"error": f"BART failed: {str(e)}"}
    
    def process_file(self, file_obj, selected_model):
        """Main file processing function"""
        if file_obj is None: 
            return "❌ No file uploaded", {}
        
        file_path = file_obj.name
        file_type = self.detect_file_type(file_path)
        
        if file_type == 'unknown':
            return "❌ Unsupported file type", {}
        
        file_size = Path(file_path).stat().st_size / 1024
        file_info = f"""
📁 **File Information:**
- **Name**: {Path(file_path).name}
- **Type**: {file_type.upper()}
- **Size**: {file_size:.2f} KB
- **Model**: {selected_model}
- **Device**: {self.device.upper()}
        """
        
        metadata = {"error": "Model not implemented"}
        
        try:
            if selected_model == "BLIP-2" and file_type == 'image':
                metadata = self.extract_image_blip(file_path)
                if "caption" in metadata:
                    metadata["summary"] = self.summarize_text(metadata.get("caption", ""))
            elif selected_model == "CLIP" and file_type == 'image':
                metadata = self.extract_image_clip(file_path)
            elif selected_model == "Policy Engine" and file_type == 'image':
                metadata = self.extract_policy_engine_image(file_path)
            elif selected_model == "Face Recognition" and file_type == 'image':
                metadata = self.extract_faces_image(file_path)
            elif selected_model == "Face Recognition" and file_type == 'video':
                metadata = self.extract_faces_video(file_path)
            elif selected_model == "Whisper" and file_type in ['audio', 'video']:
                metadata = self.extract_audio_whisper(file_path)
            elif selected_model == "BART" and file_type == 'document':
                metadata = self.extract_document_bart(file_path)
            elif selected_model == "Scene Detector" and file_type == 'video':
                metadata = self.extract_scenes(file_path)
            elif selected_model == "Luxand Cloud":
                metadata = self.extract_faces_luxand(file_path)
            else:
                metadata = {
                    "error": f"{selected_model} not compatible with {file_type}"
                }
        except Exception as e:
            metadata = {"error": f"Extraction failed: {str(e)}"}
        
        return file_info, metadata


# Initialize with face database path
# GANTI PATH INI DENGAN PATH FOLDER ANDA!
FACE_DB_PATH = r"C:\Users\dely\Downloads\politisi"  # <-- EDIT THIS!

extractor = MetadataExtractor(face_db_path=FACE_DB_PATH)


def create_interface():
    with gr.Blocks(theme=gr.themes.Soft(), title="AI Metadata Pro") as demo:
        gr.Markdown("# 🎯 AI Metadata Extractor - Optimized")
        
        with gr.Row():
            # KOLOM KIRI: Input
            with gr.Column(scale=1):
                file_input = gr.File(label="Upload File")
                model_choice = gr.Radio(
                    choices=["BLIP-2", "CLIP", "Luxand Cloud", "Face Recognition", "Whisper", "LLM Summarizer"],
                    label="Pilih Model",
                    value="BLIP-2"
                )
                extract_btn = gr.Button("🚀 Jalankan Analisis", variant="primary")
                file_info = gr.Markdown("### ℹ️ Info File")

            # KOLOM KANAN: Preview & Result
            with gr.Column(scale=1):
                # Preview Media
                img_preview = gr.Image(label="Preview Gambar", visible=False)
                video_preview = gr.Video(label="Preview Video", visible=False)
                
                # Hasil JSON
                results = gr.JSON(label="📊 Hasil Analisis")

        # Logic handler untuk meminimalkan Connection Reset
        def update_ui_preview(file):
            if file is None: return gr.update(visible=False), gr.update(visible=False)
            mime = mimetypes.guess_type(file.name)[0] or ""
            if "image" in mime:
                return gr.update(value=file.name, visible=True), gr.update(visible=False)
            if "video" in mime:
                return gr.update(visible=False), gr.update(value=file.name, visible=True)
            return gr.update(visible=False), gr.update(visible=False)

        file_input.change(fn=update_ui_preview, inputs=file_input, outputs=[img_preview, video_preview])
        
        extract_btn.click(
            fn=extractor.process_file,
            inputs=[file_input, model_choice],
            outputs=[file_info, results]
        )
        
    return demo

if __name__ == "__main__":
    # Tambahkan queue() untuk menangani banyak request dan mencegah 10054 error
    demo = create_interface()
    demo.queue().launch(max_threads=1)