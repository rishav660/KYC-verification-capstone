# Digital KYC Verification System

> **🚀 Live Demo**: [https://frontend-three-ochre-64.vercel.app](https://frontend-three-ochre-64.vercel.app)  
> **📦 Repository**: [https://gitlab.com/rishavbora1020-group/kyc-capstone](https://gitlab.com/rishavbora1020-group/kyc-capstone)

A comprehensive web-based KYC (Know Your Customer) verification platform that automates identity verification using OCR, face matching, and duplicate detection algorithms.

## 🎯 Overview

This Digital KYC system enables users to complete identity verification entirely online by uploading identity documents, address proofs, and capturing a live selfie. The system automatically extracts information using OCR, performs face matching to verify identity, and detects duplicate submissions to prevent fraud.

## 🏗️ Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│   Backend    │────────▶│   MongoDB    │
│   (Vercel)   │◀────────│   (Render)   │◀────────│    Atlas     │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  Cloudinary  │
                         └──────────────┘
```

**Tech Stack**:
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB
- **ML/AI**: Tesseract.js (OCR) + face-api.js (Face Recognition)
- **Storage**: Cloudinary
- **Deployment**: Vercel + Render + MongoDB Atlas

## ✨ Key Features

### User Journey
1. **Personal Information** - Name, email, phone, DOB, gender with real-time validation
2. **Identity Proof** - Upload PAN/Aadhaar/Passport with automatic OCR extraction
3. **Address Proof** - Upload utility bill/bank statement with text extraction
4. **Passport Photo** (Optional) - For face matching verification
5. **Live Selfie** - Real-time webcam capture with face detection overlay
6. **Preview & Submit** - Review and edit before final submission

### Smart Algorithms

#### 1. OCR (Optical Character Recognition)
- Extracts text from documents using Tesseract.js
- Validates PAN, Aadhaar, and passport numbers with regex patterns
- 70% confidence threshold for accuracy

#### 2. Face Matching
- Uses face-api.js TensorFlow models
- Compares passport photo with live selfie
- 128-dimensional face descriptors with Euclidean distance matching

#### 3. Duplicate Detection (Two-Layer)
- **Layer 1**: Document number matching via OCR (~95% accuracy)
- **Layer 2**: Perceptual hashing (pHash) using DCT
  - Detects visually similar images even with different angles/lighting
  - Hamming distance < 10 indicates duplicate

#### 4. Quality Validation
- Brightness, blur, resolution, and file size checks
- Supports JPEG, PNG, and PDF formats

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### Local Development

**1. Clone Repository**
```bash
git clone https://gitlab.com/rishavbora1020-group/kyc-capstone.git
cd kyc-capstone
```

**2. Backend Setup**
```bash
cd backend
npm install

# Create .env file
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
PORT=5000

npm start
```

**3. Frontend Setup**
```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:5000

npm run dev
```

**4. Access**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🌐 Production Deployment

- **Frontend**: https://frontend-three-ochre-64.vercel.app (Vercel)
- **Backend**: https://kyc-capstone.onrender.com (Render)
- **Database**: MongoDB Atlas

## 🔒 Security

- HTTPS/TLS encryption
- Client and server-side input validation
- CORS restricted to trusted origins
- Environment variables for sensitive data
- NoSQL injection prevention
- 10MB file upload limit

## 📊 Performance

- Image compression (max 500KB)
- Lazy loading of ML models
- React code splitting
- CDN-served images via Cloudinary
- Optimized MongoDB indexing

## 📝 Future Enhancements

- [ ] Aadhaar OTP verification via UIDAI API
- [ ] DigiLocker integration
- [ ] Video KYC with enhanced liveness detection
- [ ] Multi-language support
- [ ] Admin dashboard with analytics
- [ ] Email/SMS notifications

## 👥 Team

**Developer**: Rishav Bora  
**Year**: 2024-2025

## 📄 License

This project is developed as a capstone project for academic purposes.

---

Made with ❤️ using React, Node.js, and AI/ML
