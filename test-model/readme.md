# 🎯 AI Metadata Extractor - Professional Edition

Aplikasi berbasis Gradio untuk ekstraksi metadata otomatis dari berbagai jenis file (gambar, video, audio, dokumen) menggunakan berbagai model AI state-of-the-art.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Model AI yang Tersedia](#model-ai-yang-tersedia)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Cara Penggunaan](#cara-penggunaan)
- [Troubleshooting](#troubleshooting)
- [Catatan Penting](#catatan-penting)

---

## ✨ Fitur Utama

- **Multi-Format Support**: Gambar, Video, Audio, Dokumen (PDF/TXT)
- **Face Recognition**: Deteksi wajah + pengenalan selebriti dengan database custom
- **Scene Detection**: Analisis scene-by-scene untuk video
- **Speech-to-Text**: Transkripsi audio/video otomatis
- **Content Moderation**: Policy engine untuk NSFW & violence detection
- **AI Summarization**: Ringkasan otomatis menggunakan LLM
- **Cloud Integration**: Luxand Cloud API untuk face recognition

---

## 🤖 Model AI yang Tersedia

### 1. **BLIP-2** (Image Captioning)
- **Fungsi**: Generate deskripsi otomatis dari gambar
- **Model**: `Salesforce/blip2-opt-2.7b`
- **Requirements**:
  ```
  transformers>=4.35.0
  torch>=2.0.0
  accelerate>=0.24.0
  bitsandbytes>=0.41.0
  ```

### 2. **CLIP** (Image Classification)
- **Fungsi**: Klasifikasi gambar dengan zero-shot learning
- **Model**: `openai/clip-vit-base-patch32`
- **Requirements**:
  ```
  transformers>=4.35.0
  torch>=2.0.0
  pillow>=10.0.0
  ```

### 3. **Whisper** (Speech-to-Text)
- **Fungsi**: Transkripsi audio/video ke teks
- **Model**: `openai/whisper-base`
- **Requirements**:
  ```
  openai-whisper>=20231117
  torch>=2.0.0,<2.1.0  # ⚠️ KONFLIK dengan PySceneDetect
  ffmpeg-python>=0.2.0
  librosa>=0.10.0
  soundfile>=0.12.0
  ```

### 4. **DeepFace** (Face Recognition)
- **Fungsi**: Deteksi wajah, atribut, dan pengenalan selebriti
- **Backend**: RetinaFace + Facenet512
- **Requirements**:
  ```
  deepface>=0.0.79
  opencv-python>=4.8.0
  tensorflow>=2.14.0
  mtcnn>=0.1.1
  retina-face>=0.0.13
  ```

### 5. **PySceneDetect** (Scene Detection)
- **Fungsi**: Deteksi pergantian scene dalam video
- **Requirements**:
  ```
  scenedetect[opencv]>=0.6.2
  opencv-python>=4.8.0
  torch>=2.1.0  # ⚠️ KONFLIK dengan Whisper
  ```

### 6. **Mistral-7B** (Text Summarization)
- **Fungsi**: Ringkasan teks otomatis dengan LLM
- **Model**: `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`
- **Requirements**:
  ```
  transformers>=4.35.0
  torch>=2.0.0
  accelerate>=0.24.0
  bitsandbytes>=0.41.0
  ```

### 7. **BART** (Alternative Summarizer)
- **Fungsi**: Summarization untuk dokumen
- **Model**: `facebook/bart-large-cnn`
- **Requirements**:
  ```
  transformers>=4.35.0
  torch>=2.0.0
  ```

### 8. **NSFW Detector** (Content Moderation)
- **Fungsi**: Deteksi konten sensitif
- **Model**: `Falconsai/nsfw_image_detection`
- **Requirements**:
  ```
  transformers>=4.35.0
  torch>=2.0.0
  ```

---

## 🔧 Instalasi

### Prasyarat
- Python 3.8 - 3.11 (recommended: 3.10)
- CUDA 11.8+ (opsional, untuk GPU acceleration)
- FFmpeg (untuk audio/video processing)
- Tesseract OCR (untuk OCR features)

### Langkah Instalasi

#### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd ai-metadata-extractor
```

#### 2️⃣ Buat Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate  # Windows
```

#### 3️⃣ Install Dependencies

**⚠️ PENTING: Pilih salah satu environment**

**Option A: Full Install (TANPA PySceneDetect)**
```bash
pip install gradio>=4.0.0
pip install transformers>=4.35.0 torch>=2.0.0 accelerate bitsandbytes
pip install openai-whisper librosa soundfile
pip install deepface opencv-python tensorflow
pip install pytesseract pdf2image PyPDF2
pip install Pillow numpy requests
```

**Option B: Full Install (TANPA Whisper)**
```bash
pip install gradio>=4.0.0
pip install transformers>=4.35.0 torch>=2.1.0 accelerate bitsandbytes
pip install scenedetect[opencv]
pip install deepface opencv-python tensorflow
pip install pytesseract pdf2image PyPDF2
pip install Pillow numpy requests
```

**Option C: Install Minimal (Hanya Image Processing)**
```bash
pip install gradio>=4.0.0
pip install transformers torch accelerate bitsandbytes
pip install deepface opencv-python
pip install Pillow numpy requests
```

#### 4️⃣ Install FFmpeg (untuk audio/video)

**Windows:**
```bash
# Download dari: https://ffmpeg.org/download.html
# Tambahkan ke PATH environment variable
```

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**MacOS:**
```bash
brew install ffmpeg
```

#### 5️⃣ Install Tesseract OCR (opsional)

**Windows:**
```bash
# Download dari: https://github.com/UB-Mannheim/tesseract/wiki
```

**Linux:**
```bash
sudo apt install tesseract-ocr
```

---

## 🔐 Konfigurasi

### 1. Hugging Face Authentication

Beberapa model memerlukan autentikasi Hugging Face:

```bash
# Install CLI
pip install huggingface_hub

# Login
huggingface-cli login

# Paste your token when prompted
# Get token from: https://huggingface.co/settings/tokens
```

### 2. Face Database Setup

Untuk fitur celebrity recognition, siapkan folder database:

```
politisi/
├── jokowi/
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── photo3.jpg
├── prabowo/
│   ├── photo1.jpg
│   └── photo2.jpg
└── anies_baswedan/
    ├── photo1.jpg
    └── photo2.jpg
```

Edit path di file `app.py`:
```python
FACE_DB_PATH = r"C:\path\to\your\politisi"  # Ganti dengan path Anda
```

### 3. Luxand Cloud API (opsional)

Untuk menggunakan Luxand Cloud:

1. Daftar di: https://luxand.cloud
2. Dapatkan API Token
3. Edit di `app.py`:
```python
self.luxand_api_token = "YOUR_API_TOKEN_HERE"
```

---

## 🚀 Cara Penggunaan

### Menjalankan Aplikasi

```bash
python app.py
```

Akses di browser: `http://localhost:7860`

### Workflow

1. **Upload File**: Drag & drop atau klik untuk memilih file
2. **Pilih Model**: 
   - Gambar: BLIP-2, CLIP, Face Recognition, Policy Engine
   - Video: Whisper, Scene Detector, Face Recognition
   - Audio: Whisper
   - Dokumen: BART, OCR
3. **Klik "Jalankan Analisis"**: Tunggu proses selesai
4. **Lihat Hasil**: Preview + metadata JSON

### Contoh Output

**Image Analysis (BLIP-2):**
```json
{
  "model": "BLIP-2",
  "caption": "a group of people standing in front of a building",
  "summary": "The image shows several individuals gathered outdoors...",
  "image_size": "1920x1080",
  "format": "JPEG"
}
```

**Face Recognition:**
```json
{
  "model": "DeepFace Optimized",
  "faces": [
    {
      "face_id": 1,
      "celebrity_match": "Joko Widodo",
      "match_confidence": "87.34%",
      "age": 62,
      "gender": "Man",
      "emotion": "happy"
    }
  ]
}
```

---

## ⚠️ Troubleshooting

### Error: "Connection Reset by Peer (10054)"
**Solusi**: 
```python
# Sudah ditambahkan di code:
demo.queue().launch(max_threads=1)
```

### Error: "CUDA out of memory"
**Solusi**: Gunakan quantization 4-bit (sudah default) atau CPU:
```python
device = "cpu"  # Force CPU mode
```

### Error: "Whisper + PySceneDetect conflict"
**Penyebab**: PyTorch version mismatch
- Whisper: `torch<2.1.0`
- PySceneDetect: `torch>=2.1.0`

**Solusi**: Gunakan environment terpisah:
```bash
# Environment 1: Whisper
pip install torch==2.0.1

# Environment 2: PySceneDetect
pip install torch==2.1.0
```

### Error: "Model not found" dari Hugging Face
**Solusi**:
```bash
huggingface-cli login
# Paste token from: https://huggingface.co/settings/tokens
```

### Error: "FFmpeg not found"
**Solusi**: Install FFmpeg dan tambahkan ke PATH

---

## 📊 Requirements Summary

### Minimum Requirements (Image Only)
```
Python 3.8+
RAM: 8GB
Storage: 5GB
GPU: Optional (GTX 1060 6GB+)
```

### Full Installation
```
Python 3.10
RAM: 16GB
Storage: 20GB
GPU: RTX 3060 12GB+ (recommended)
VRAM: 8GB+ untuk semua model
```

### File `requirements.txt`

```txt
gradio>=4.0.0
transformers>=4.35.0
torch>=2.0.0
accelerate>=0.24.0
bitsandbytes>=0.41.0
Pillow>=10.0.0
numpy>=1.24.0
opencv-python>=4.8.0
requests>=2.31.0

# Optional: Whisper (konflik dengan PySceneDetect)
openai-whisper>=20231117
librosa>=0.10.0
soundfile>=0.12.0

# Optional: PySceneDetect (konflik dengan Whisper)
# scenedetect[opencv]>=0.6.2

# Optional: Face Recognition
deepface>=0.0.79
tensorflow>=2.14.0

# Optional: OCR
pytesseract>=0.3.10
pdf2image>=1.16.3
PyPDF2>=3.0.1
```

---

## 📝 Catatan Penting

1. **GPU Memory**: Model BLIP-2 & Mistral-7B memerlukan ~4GB VRAM (4-bit mode)
2. **First Run**: Download model memerlukan waktu (10-30 menit)
3. **Face Database**: Minimal 3 foto per orang untuk accuracy terbaik
4. **Video Processing**: Besar file >100MB akan memakan waktu lama
5. **Luxand API**: Free tier limited 100 requests/month

---

## 🤝 Contributing

Pull requests welcome! Untuk perubahan besar, buka issue terlebih dahulu.

## 📄 License

MIT License - bebas digunakan untuk komersial & personal

## 👨‍💻 Author

Dikembangkan dengan ❤️ menggunakan state-of-the-art AI models

---

## 🔗 Resources

- [Gradio Documentation](https://gradio.app/docs)
- [Hugging Face Models](https://huggingface.co/models)
- [DeepFace Guide](https://github.com/serengil/deepface)
- [Whisper Documentation](https://github.com/openai/whisper)
- [PySceneDetect Docs](https://scenedetect.com)
