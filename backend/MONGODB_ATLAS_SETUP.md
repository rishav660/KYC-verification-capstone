# MongoDB Atlas Setup - Step by Step Guide

## ✅ You need to complete these steps manually

### Step 1: Create MongoDB Atlas Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google/GitHub account
3. Complete the registration form

### Step 2: Create FREE Cluster
1. Click "Create" under "M0 FREE" tier
2. Choose Provider: AWS (or any)
3. Choose Region: Closest to you (e.g., Mumbai, Singapore)
4. Cluster Name: `KYC-Cluster`
5. Click "Create Deployment"

### Step 3: Create Database User
1. Username: `kycuser`
2. Password: Click "Autogenerate" and SAVE IT
   ⚠️ IMPORTANT: Copy this password somewhere safe!
3. Click "Create Database User"

### Step 4: Configure Network Access
1. Choose: "Add My Current IP Address"
   OR
   For testing: "Allow Access from Anywhere" (0.0.0.0/0)
2. Click "Finish and Close"

### Step 5: Get Connection String
1. Click "Connect" button on your cluster
2. Choose "Drivers"
3. Select: Node.js driver
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://kycuser:<password>@kyc-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Create .env File
1. In the `backend/` folder, create a new file named: `.env`
2. Open it and paste this content:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://kycuser:YOUR_PASSWORD_HERE@kyc-cluster.xxxxx.mongodb.net/kyc-verification?retryWrites=true&w=majority

# Cloudinary (leave as-is for now)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo

# Server
PORT=5000
NODE_ENV=development
```

3. REPLACE in the MONGO_URI:
   - `YOUR_PASSWORD_HERE` → Your actual database password
   - `kyc-cluster.xxxxx` → Your actual cluster address from Atlas
   - Make sure `/kyc-verification` is added before the `?`

4. Save the file

### Step 7: Start Backend Server
1. Open terminal in `backend` folder
2. Run:
   ```bash
   node src/server.js
   ```

3. You should see:
   ```
   Backend running
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   🚀 Server running on port 5000
   📍 API available at http://localhost:5000
   🏥 Health check: http://localhost:5000/health
   ```

### Step 8: Test the Connection
Visit in browser: http://localhost:5000/health

You should see:
```json
{
  "success": true,
  "message": "KYC Verification API is running",
  "timestamp": "..."
}
```

## 🎯 Quick Reference

**MongoDB Atlas Dashboard**: https://cloud.mongodb.com/

**Your Connection String Format**:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

**Example**:
```
mongodb+srv://kycuser:mySecurePass123@kyc-cluster.abc12.mongodb.net/kyc-verification?retryWrites=true&w=majority
```

## ❓ Troubleshooting

**"MongooseError: The uri parameter to openUri() must be a string"**
- Solution: Check that MONGO_URI in .env file is set correctly

**"Authentication failed"**
- Solution: Double-check your password in the connection string

**"Connection timeout"**
- Solution: Check IP whitelist in Atlas (Network Access)

**"Cannot read .env"**
- Solution: Make sure .env file is in the `backend/` folder (not backend/src/)

## 🔐 Security Tips
1. Never commit .env file to git (already in .gitignore)
2. Use strong passwords for database users
3. For production, use specific IP whitelist (not 0.0.0.0/0)
4. Rotate credentials periodically

---

Once you've completed these steps, let me know and we can test the backend!
