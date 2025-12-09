require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/DB');

// Import routes
const kycRoutes = require('./routes/kycRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow localhost for development
        if (origin.includes('localhost')) return callback(null, true);

        // Allow all Vercel frontend deployments
        if (origin.includes('vercel.app')) return callback(null, true);

        // Otherwise block
        console.log('❌ CORS blocked:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' })); // Parse JSON with increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/kyc', kycRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'KYC Verification API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// Start server (only in development, not on Vercel)
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log('Backend running');
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 API available at http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
}

// Export for Vercel serverless
module.exports = app;
