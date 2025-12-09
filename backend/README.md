# KYC Verification Backend

Node.js Express backend for KYC (Know Your Customer) verification system.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── DB.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary configuration
│   ├── controllers/           # Route controllers (to be implemented)
│   ├── models/
│   │   └── KYC.js             # KYC data model
│   ├── routes/
│   │   └── kycRoutes.js       # KYC API routes
│   ├── utils/                 # Utility functions
│   └── server.js              # Express app entry point
├── .env.example               # Environment variables template
├── .gitignore
└── package.json
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend root directory:

```bash
cp .env.example .env
```

Then update the following values:

```env
# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 📡 API Endpoints

### Health Check
- **GET** `/health`
  - Check if API is running
  - Returns: `{ success: true, message: "KYC Verification API is running" }`

### KYC Submission
- **POST** `/api/kyc/submit-kyc`
  - Submit KYC documents
  - Body: 
    ```json
    {
      "idProofType": "Aadhaar Card",
      "idProofImage": "base64_string",
      "addressProofType": "Voter ID",
      "addressProofImage": "base64_string",
      "selfieImage": "base64_string"
    }
    ```
  - Returns: `{ success: true, data: { kycId, status, submittedAt } }`

### KYC Status
- **GET** `/api/kyc/status/:kycId`
  - Get KYC verification status
  - Returns: `{ success: true, data: { kycId, status, message } }`

## 🗄️ Database Schema

### KYC Model
```javascript
{
  userId: String,
  idProofType: String,
  idProofURL: String,
  addressProofType: String,
  addressProofURL: String,
  selfieURL: String,
  status: String (default: "pending"),
  createdAt: Date,
  updatedAt: Date
}
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **dotenv** - Environment variables
- **cors** - Cross-Origin Resource Sharing
- **cloudinary** - Cloud image storage
- **multer** - File upload middleware
- **multer-storage-cloudinary** - Cloudinary storage for multer

## 🔧 Development

The server includes:
- ✅ CORS configured for `http://localhost:5173` (frontend)
- ✅ JSON parsing with 50MB limit (for base64 images)
- ✅ MongoDB connection
- ✅ Cloudinary integration
- ✅ Error handling middleware
- ✅ Health check endpoint

## 🌐 CORS Configuration

Currently configured to accept requests from:
- `http://localhost:5173` (Vite dev server)

To add more origins, update the CORS configuration in `src/server.js`.

## 📝 Notes

- The current implementation uses dummy responses for KYC submission
- Base64 image upload is supported (limit: 50MB)
- MongoDB connection is required for production
- Cloudinary credentials needed for image storage

## 🔜 Next Steps

1. Set up MongoDB Atlas account
2. Configure Cloudinary account
3. Implement KYC controller with actual Cloudinary upload
4. Add authentication/authorization
5. Implement email notifications
6. Add rate limiting
