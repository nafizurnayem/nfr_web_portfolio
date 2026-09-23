/**
 * Static skill data — extracted from backend/app/db/seed.py so the frontend
 * can render without a running FastAPI backend.
 */

import type { Skill } from "../api";

export const STATIC_SKILLS: Skill[] = [
  // Image Processing & CV (primary focus)
  { id: 1, name: "OpenCV", category: "Image Processing & CV", proficiency: 95, sort_order: 0 },
  { id: 2, name: "Pillow (PIL)", category: "Image Processing & CV", proficiency: 90, sort_order: 1 },
  { id: 3, name: "Image Classification (CNN)", category: "Image Processing & CV", proficiency: 92, sort_order: 2 },
  { id: 4, name: "Object Detection (YOLO)", category: "Image Processing & CV", proficiency: 88, sort_order: 3 },
  { id: 5, name: "Image Segmentation (U-Net)", category: "Image Processing & CV", proficiency: 85, sort_order: 4 },
  { id: 6, name: "Image Filtering & Morphology", category: "Image Processing & CV", proficiency: 92, sort_order: 5 },
  { id: 7, name: "Edge & Feature Detection", category: "Image Processing & CV", proficiency: 90, sort_order: 6 },
  { id: 8, name: "Image Augmentation (albumentations)", category: "Image Processing & CV", proficiency: 85, sort_order: 7 },
  { id: 9, name: "Plant-Disease Detection", category: "Image Processing & CV", proficiency: 92, sort_order: 8 },

  // AI/ML & Data Science
  { id: 10, name: "PyTorch", category: "AI/ML & Data Science", proficiency: 88, sort_order: 10 },
  { id: 11, name: "TensorFlow", category: "AI/ML & Data Science", proficiency: 82, sort_order: 11 },
  { id: 12, name: "Keras", category: "AI/ML & Data Science", proficiency: 82, sort_order: 12 },
  { id: 13, name: "scikit-learn", category: "AI/ML & Data Science", proficiency: 85, sort_order: 13 },
  { id: 14, name: "Pandas", category: "AI/ML & Data Science", proficiency: 90, sort_order: 14 },
  { id: 15, name: "NumPy", category: "AI/ML & Data Science", proficiency: 90, sort_order: 15 },
  { id: 16, name: "Matplotlib", category: "AI/ML & Data Science", proficiency: 85, sort_order: 16 },

  // NLP & LLM
  { id: 17, name: "Hugging Face", category: "NLP & LLM", proficiency: 85, sort_order: 20 },
  { id: 18, name: "OpenAI API", category: "NLP & LLM", proficiency: 88, sort_order: 21 },
  { id: 19, name: "LangChain", category: "NLP & LLM", proficiency: 82, sort_order: 22 },
  { id: 20, name: "spaCy", category: "NLP & LLM", proficiency: 78, sort_order: 23 },
  { id: 21, name: "NLTK", category: "NLP & LLM", proficiency: 78, sort_order: 24 },

  // Languages
  { id: 22, name: "Python", category: "Languages", proficiency: 95, sort_order: 30 },
  { id: 23, name: "C++", category: "Languages", proficiency: 80, sort_order: 31 },
  { id: 24, name: "C", category: "Languages", proficiency: 80, sort_order: 32 },
  { id: 25, name: "Java", category: "Languages", proficiency: 75, sort_order: 33 },
  { id: 26, name: "C#", category: "Languages", proficiency: 70, sort_order: 34 },
  { id: 27, name: "JavaScript", category: "Languages", proficiency: 82, sort_order: 35 },
  { id: 28, name: "TypeScript", category: "Languages", proficiency: 80, sort_order: 36 },
  { id: 29, name: "HTML5", category: "Languages", proficiency: 90, sort_order: 37 },
  { id: 30, name: "CSS3", category: "Languages", proficiency: 88, sort_order: 38 },
  { id: 31, name: "MicroPython", category: "Languages", proficiency: 72, sort_order: 39 },

  // Robotics & Hardware
  { id: 32, name: "ESP32 / ESP32-S3", category: "Robotics & Hardware", proficiency: 90, sort_order: 40 },
  { id: 33, name: "Arduino", category: "Robotics & Hardware", proficiency: 88, sort_order: 41 },
  { id: 34, name: "Raspberry Pi", category: "Robotics & Hardware", proficiency: 85, sort_order: 42 },
  { id: 35, name: "PlatformIO", category: "Robotics & Hardware", proficiency: 82, sort_order: 43 },
  { id: 36, name: "MQTT (TLS)", category: "Robotics & Hardware", proficiency: 80, sort_order: 44 },
  { id: 37, name: "Fusion 360", category: "Robotics & Hardware", proficiency: 70, sort_order: 45 },
  { id: 38, name: "EasyEDA", category: "Robotics & Hardware", proficiency: 70, sort_order: 46 },

  // Backend & Data
  { id: 39, name: "FastAPI", category: "Backend & Data", proficiency: 88, sort_order: 60 },
  { id: 40, name: "Node.js / Express", category: "Backend & Data", proficiency: 82, sort_order: 61 },
  { id: 41, name: "PostgreSQL", category: "Backend & Data", proficiency: 78, sort_order: 62 },
  { id: 42, name: "SQLAlchemy", category: "Backend & Data", proficiency: 82, sort_order: 63 },
  { id: 43, name: "REST API design", category: "Backend & Data", proficiency: 88, sort_order: 64 },
  { id: 44, name: "MySQL", category: "Backend & Data", proficiency: 78, sort_order: 65 },

  // Frontend
  { id: 45, name: "React", category: "Frontend", proficiency: 85, sort_order: 70 },
  { id: 46, name: "Next.js", category: "Frontend", proficiency: 84, sort_order: 71 },
  { id: 47, name: "Tailwind CSS", category: "Frontend", proficiency: 88, sort_order: 72 },
  { id: 48, name: "Streamlit", category: "Frontend", proficiency: 85, sort_order: 73 },
  { id: 49, name: "Flutter", category: "Frontend", proficiency: 72, sort_order: 74 },

  // Development Tools
  { id: 50, name: "VS Code", category: "Development Tools", proficiency: 95, sort_order: 80 },
  { id: 51, name: "Jupyter", category: "Development Tools", proficiency: 92, sort_order: 81 },
  { id: 52, name: "Google Colab", category: "Development Tools", proficiency: 90, sort_order: 82 },
  { id: 53, name: "Git", category: "Development Tools", proficiency: 90, sort_order: 83 },
  { id: 54, name: "GitHub", category: "Development Tools", proficiency: 92, sort_order: 84 },
];
