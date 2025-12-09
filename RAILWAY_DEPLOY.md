# Railway Deployment for Backend

## Prerequisites
- Railway account (sign up at https://railway.app)
- Railway CLI installed

## Deployment Steps

### 1. Install Railway CLI
```powershell
npm install -g @railway/cli
```

### 2. Login to Railway
```powershell
railway login
```

### 3. Deploy Backend
Navigate to backend directory and run:
```powershell
cd backend
railway init
railway up
```

### 4. Set Environment Variables
After deployment, go to Railway Dashboard and add:
- `MONGO_URI`: Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `CORS_ORIGIN`: Your frontend URL (will be set after deployment)
- `PORT`: 5000 (Railway will override this automatically)

### 5. Get Backend URL
Railway will provide a public URL like: `https://your-backend.up.railway.app`

### 6. Update Frontend
Update the frontend's `VITE_API_URL` environment variable in Vercel to point to the Railway backend URL.

## Advantages of Railway
- No serverless function limitations (no 4.5MB payload limit)
- Persistent connections (better for MongoDB)
- Simpler CORS configuration
- Better logging and debugging
- Lower latency for large requests
