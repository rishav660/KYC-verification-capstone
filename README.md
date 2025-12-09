# Digital KYC Verification System

A comprehensive web-based KYC (Know Your Customer) verification platform that automates identity verification using OCR, face matching, and duplicate detection algorithms.

## 🎯 Project Overview

This Digital KYC system enables users to complete identity verification entirely online by uploading identity documents, address proofs, and capturing a live selfie. The system automatically extracts information using OCR, performs face matching to verify identity, and detects duplicate submissions to prevent fraud.

## 🏗️ System Architecture

### Architecture Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │────────▶│   Backend    │────────▶│   MongoDB    │
│   (Vercel)   │◀────────│   (Render)   │◀────────│    Atlas     │
└──────────────┘         └──────────────┘         └──────────────┘
                                │
                                │
                                ▼
                         ┌──────────────┐
                         │  Cloudinary  │
                         │   (Storage)  │
                         └──────────────┘
```

### Component Breakdown

#### **Frontend (React + Vite)**
- **Framework**: React 18 with Vite for fast development
- **Routing**: React Router DOM for multi-step form navigation
- **Styling**: TailwindCSS for responsive, modern UI
- **State Management**: React Context API for sharing KYC data across steps
- **Client-side Processing**:
  - Tesseract.js for OCR validation
  - face-api.js for face detection and matching
  - Image compression before upload

#### **Backend (Node.js + Express)**
- **Framework**: Express.js for REST API
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary for document and image storage
- **Image Processing**: Sharp for server-side image manipulation
- **OCR**: Tesseract.js for extracting text from documents

#### **Database (MongoDB Atlas)**
- **KYC Submissions Collection**: Stores all user KYC data
- **Fields**: Personal info, document URLs, extracted data, timestamps
- **Indexing**: Optimized for duplicate detection queries

## 🔧 Technologies Used

### Frontend Stack
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework for component-based architecture |
| Vite | Build tool for fast development and optimized production builds |
| TailwindCSS | Utility-first CSS framework for styling |
| React Router DOM | Client-side routing for multi-step form |
| Axios | HTTP client for API communication |
| Tesseract.js | OCR engine for client-side text extraction |
| face-api.js | Face detection and recognition |
| browser-image-compression | Image compression before upload |
| PDF.js | PDF rendering and processing |

### Backend Stack
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime environment |
| Express.js | Web application framework |
| MongoDB | NoSQL database for data persistence |
| Mongoose | ODM for MongoDB with schema validation |
| Cloudinary | Cloud storage for images and documents |
| Multer | Middleware for handling multipart/form-data |
| Sharp | High-performance image processing |
| Tesseract.js | OCR for server-side text extraction |
| dotenv | Environment variable management |
| CORS | Cross-origin resource sharing configuration |

### Deployment Infrastructure
| Component | Platform |
|-----------|----------|
| Frontend | Vercel (Serverless) |
| Backend | Render (Always-on Node.js) |
| Database | MongoDB Atlas (Cloud) |
| Storage | Cloudinary |
| Version Control | GitLab |

## 🧮 Algorithms & Features

### 1. **Optical Character Recognition (OCR)**

**Algorithm**: Tesseract OCR Engine
- **Purpose**: Extract text from uploaded documents (PAN, Aadhaar, Passport)
- **Implementation**:
  ```javascript
  // Client-side preprocessing
  1. Convert image to grayscale
  2. Apply contrast enhancement
  3. Resize to optimal dimensions (max 1920px)
  4. Run Tesseract.js with language configuration
  ```
- **Validation**: Regex patterns for PAN, Aadhaar, and passport numbers
- **Confidence Threshold**: 70% accuracy minimum

### 2. **Face Matching & Liveness Detection**

**Algorithm**: face-api.js (TensorFlow.js based)
- **Models Used**:
  - SSD MobilNetV1 for face detection
  - Face Landmark Detection (68-point model)
  - Face Recognition model (128-dimensional face descriptors)
- **Process**:
  ```javascript
  1. Detect face in passport photo
  2. Extract 128-dimensional face descriptor
  3. Detect face in live selfie
  4. Extract face descriptor from selfie
  5. Calculate Euclidean distance between descriptors
  6. Match if distance < 0.6 (configurable threshold)
  ```
- **Security**: Client-side validation + server-side verification

### 3. **Duplicate Detection System**

**Two-Layer Approach**:

#### **Layer 1: Document Number Matching**
- Extract document numbers using OCR
- Check MongoDB for existing submissions with same number
- **Accuracy**: ~95% (dependent on OCR quality)

#### **Layer 2: Perceptual Hashing (pHash)**
- **Algorithm**: Discrete Cosine Transform (DCT) based hashing
- **Process**:
  ```javascript
  1. Resize image to 32x32 pixels
  2. Convert to grayscale
  3. Apply DCT (Discrete Cosine Transform)
  4. Extract low-frequency components
  5. Generate 64-bit hash
  6. Compare using Hamming distance
  ```
- **Threshold**: Hamming distance < 10 indicates duplicate
- **Advantage**: Detects visually similar images even if:
  - Photo is taken from different angles
  - Different lighting conditions
  - Minor edits or filters applied

### 4. **Image Quality Validation**

**Checks Performed**:
- **Brightness**: Mean pixel value between 40-220
- **Blur Detection**: Laplacian variance > 100
- **Resolution**: Minimum 800x600 pixels
- **File Size**: After compression, < 500KB
- **Format**: JPEG, PNG, or PDF

### 5. **Data Validation & Sanitization**

**Input Validation**:
- Email: RFC 5322 compliant regex
- Phone: Indian mobile number format (+91 10-digit)
- PAN: `[A-Z]{5}[0-9]{4}[A-Z]`
- Aadhaar: 12-digit number with Verhoeff algorithm
- Address: Minimum length, special character filtering

**Security Measures**:
- XSS prevention through input sanitization
- NoSQL injection prevention via Mongoose
- CORS configured for trusted origins only
- Environment variables for sensitive data

## 📋 Features

### User Journey

1. **Personal Information**
   - Full name, email, phone, date of birth, gender
   - Real-time validation with error messages

2. **Identity Proof (PAN/Aadhaar/Passport)**
   - Upload or capture via webcam
   - Automatic OCR extraction of document number
   - Image quality validation
   - Support for PDF documents (including password-protected)

3. **Address Proof**
   - Upload utility bill, bank statement, or rental agreement
   - OCR text extraction for verification
   - Quality checks

4. **Passport Photo (Optional)**
   - For face matching with selfie
   - Face detection validation
   - If skipped, face matching is disabled

5. **Live Selfie Capture**
   - Real-time webcam integration
   - Face detection overlay
   - Optional face matching with passport photo
   - Liveness detection cues

6. **Preview & Submit**
   - Review all submitted data
   - Edit any section before submission
   - Duplicate detection on submission
   - Success/error feedback

### Admin Features
- View all KYC submissions in MongoDB
- Download submitted documents from Cloudinary
- Search by document number or user details
- Flag suspicious submissions

## 🚀 Setup & Installation

### Prerequisites
```bash
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Git
```

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
cat > .env << EOF
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
PORT=5000
EOF

npm start
```

**3. Frontend Setup**
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

npm run dev
```

**4. Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🌐 Production Deployment

### Current Deployment
- **Frontend**: https://frontend-three-ochre-64.vercel.app
- **Backend**: https://kyc-capstone.onrender.com
- **Database**: MongoDB Atlas (Cloud)

### Environment Variables

**Backend (Render)**
```
MONGO_URI=<MongoDB connection string>
CLOUDINARY_CLOUD_NAME=<Cloudinary cloud name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
CORS_ORIGIN=https://frontend-three-ochre-64.vercel.app
NODE_ENV=production
```

**Frontend (Vercel)**
```
VITE_API_URL=https://kyc-capstone.onrender.com
```

## 📊 Performance Optimization

1. **Image Compression**: All images compressed to max 500KB before upload
2. **Lazy Loading**: face-api.js models loaded on-demand
3. **Code Splitting**: React components split for faster initial load
4. **CDN**: Cloudinary serves images via global CDN
5. **Caching**: MongoDB queries optimized with proper indexing
6. **Build Optimization**: Vite tree-shaking and minification

## 🔒 Security Measures

- **HTTPS**: All communication encrypted via TLS
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Client and server-side validation
- **CORS**: Restricted to trusted origins
- **MongoDB**: IP whitelisting enabled
- **Rate Limiting**: Prevent API abuse (can be added)
- **File Upload Limits**: 10MB max file size

## 📝 Future Enhancements

- [ ] Aadhaar OTP verification via UIDAI API
- [ ] DigiLocker integration for verified documents
- [ ] Video KYC with liveness detection
- [ ] Multi-language support
- [ ] Admin dashboard with analytics
- [ ] Email/SMS notifications
- [ ] Document expiry tracking
- [ ] Blockchain-based verification certificates

## 👥 Team

**Developer**: Rishav Bora
**Institution**: [Your College Name]
**Course**: [Your Course Name]
**Year**: 2024-2025

## 📄 License

This project is developed as a capstone project for academic purposes.

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- face-api.js for face recognition
- MongoDB Atlas for database hosting
- Cloudinary for media storage
- Render & Vercel for deployment platforms

---

**Live Demo**: [https://frontend-three-ochre-64.vercel.app](https://frontend-three-ochre-64.vercel.app)

**Repository**: [https://gitlab.com/rishavbora1020-group/kyc-capstone](https://gitlab.com/rishavbora1020-group/kyc-capstone)
