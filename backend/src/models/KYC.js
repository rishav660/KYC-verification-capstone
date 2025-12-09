const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    idProofType: {
        type: String,
        required: true,
    },
    idProofURL: {
        type: String,
        required: true,
    },
    extractedNumber: {
        type: String,
        default: null,
    },
    // Image hash for duplicate detection (fallback when OCR fails)
    idProofHash: {
        type: String,
        default: null,
    },
    addressProofType: {
        type: String,
        required: true,
    },
    addressProofExtractedNumber: {
        type: String,
        default: null,
    },
    addressProofURL: {
        type: String,
        required: true,
    },
    // Image hash for duplicate detection (fallback when OCR fails)
    addressProofHash: {
        type: String,
        default: null,
    },
    selfieURL: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the updatedAt field on save
kycSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const KYC = mongoose.model('KYC', kycSchema);

module.exports = KYC;
