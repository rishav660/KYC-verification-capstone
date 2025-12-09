const express = require('express');
const router = express.Router();
const { cloudinary } = require('../config/cloudinary');
const KYC = require('../models/KYC');
const Tesseract = require('tesseract.js');
const { generatePerceptualHash, findSimilarImage } = require('../utils/imageHash');

// POST /api/kyc/submit-kyc
router.post('/submit-kyc', async (req, res) => {
    try {
        const {
            idProofType,
            idProofImage,
            addressProofType,
            addressProofImage,
            selfieImage,
            userId = 'default_user',
        } = req.body;

        if (!idProofType || !idProofImage || !addressProofType || !addressProofImage || !selfieImage) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        console.log('📥 Received KYC submission');
        console.log('📄 ID Proof Type:', idProofType);
        console.log('📄 Address Proof Type:', addressProofType);

        // STEP 1: Generate perceptual hashes for duplicate detection
        console.log('🔐 Generating perceptual hashes...');
        const idProofHash = await generatePerceptualHash(idProofImage);
        const addressProofHash = await generatePerceptualHash(addressProofImage);
        console.log('✅ Perceptual hashes generated');

        let extractedNumber = null;

        // STEP 2: OCR-based duplicate detection for ID Proof (Layer 1)
        if (idProofType === "PAN Card" || idProofType === "Aadhaar Card") {
            try {
                console.log('🔍 Layer 1: Performing OCR for duplicate detection...');

                const { data: { text } } = await Tesseract.recognize(
                    idProofImage,
                    'eng',
                    {
                        logger: m => console.log(m.progress ? `OCR Progress: ${Math.round(m.progress * 100)}%` : '')
                    }
                );

                console.log('📝 Extracted text from ID proof');

                if (idProofType === "PAN Card") {
                    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
                    const aadhaarRegex = /\b\d{12}\b/;

                    const panMatches = text.match(panRegex);
                    const aadhaarMatches = text.match(aadhaarRegex);

                    if (aadhaarMatches && !panMatches) {
                        console.log('❌ Wrong document type: Aadhaar detected but PAN Card expected');
                        return res.status(400).json({
                            success: false,
                            wrongDocumentType: true,
                            message: 'Wrong document type detected. You selected PAN Card but uploaded an Aadhaar Card. Please upload the correct document.'
                        });
                    }

                    extractedNumber = panMatches ? panMatches[0] : null;

                    if (extractedNumber) {
                        console.log('🎯 PAN Number extracted:', extractedNumber);
                    }
                } else if (idProofType === "Aadhaar Card") {
                    const aadhaarRegex = /\b\d{12}\b/;
                    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

                    const aadhaarMatches = text.match(aadhaarRegex);
                    const panMatches = text.match(panRegex);

                    if (panMatches && !aadhaarMatches) {
                        console.log('❌ Wrong document type: PAN detected but Aadhaar Card expected');
                        return res.status(400).json({
                            success: false,
                            wrongDocumentType: true,
                            message: 'Wrong document type detected. You selected Aadhaar Card but uploaded a PAN Card. Please upload the correct document.'
                        });
                    }

                    extractedNumber = aadhaarMatches ? aadhaarMatches[0] : null;

                    if (extractedNumber) {
                        console.log('🎯 Aadhaar Number extracted:', extractedNumber);
                    }
                }

                // Check for duplicates using OCR number
                if (extractedNumber) {
                    const existing = await KYC.findOne({
                        idProofType,
                        extractedNumber
                    });

                    if (existing) {
                        console.log('⚠️ Duplicate detected via OCR (Layer 1)!');
                        return res.status(400).json({
                            success: false,
                            duplicate: true,
                            message: `This ${idProofType} has already been submitted. Duplicate detected via document number.`
                        });
                    } else {
                        console.log('✅ Layer 1 (OCR): No duplicate found');
                    }
                } else {
                    console.log('⚠️ Layer 1 (OCR): Could not extract number (may be masked e-Aadhaar)');
                }
            } catch (ocrError) {
                console.warn('⚠️ Layer 1 (OCR) failed:', ocrError.message);
            }
        }

        // STEP 3: Perceptual hash-based duplicate detection (Layer 2)
        if (idProofHash) {
            console.log('🔍 Layer 2: Checking for similar images using perceptual hash...');

            // Get all existing documents of the same type
            const existingDocs = await KYC.find({
                idProofType,
                idProofHash: { $exists: true, $ne: null }
            }).select('idProofHash');

            if (existingDocs.length > 0) {
                const existingHashes = existingDocs.map(doc => doc.idProofHash);
                const similarImage = findSimilarImage(existingHashes, idProofHash, 10);

                if (similarImage.isSimilar) {
                    console.log(`⚠️ Duplicate detected via perceptual hash (Layer 2)! Similarity: ${similarImage.similarity}%`);
                    return res.status(400).json({
                        success: false,
                        duplicate: true,
                        message: `This ${idProofType} appears to be a duplicate. A visually similar document has already been submitted (${similarImage.similarity}% match).`
                    });
                } else {
                    console.log('✅ Layer 2 (Perceptual Hash): No similar image found');
                }
            } else {
                console.log('ℹ️ Layer 2: No existing documents to compare');
            }
        }

        // Upload images to Cloudinary or store as base64
        let idProofURL, addressProofURL, selfieURL;

        const isCloudinaryConfigured =
            process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET &&
            process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
            process.env.CLOUDINARY_API_KEY !== 'demo';

        if (isCloudinaryConfigured) {
            try {
                console.log('📤 Uploading images to Cloudinary...');

                const idProofUpload = await cloudinary.uploader.upload(idProofImage, {
                    folder: 'kyc_docs/id_proofs',
                    resource_type: 'auto',
                });
                console.log('✅ ID Proof uploaded:', idProofUpload.secure_url);

                const addressProofUpload = await cloudinary.uploader.upload(addressProofImage, {
                    folder: 'kyc_docs/address_proofs',
                    resource_type: 'auto',
                });
                console.log('✅ Address Proof uploaded:', addressProofUpload.secure_url);

                const selfieUpload = await cloudinary.uploader.upload(selfieImage, {
                    folder: 'kyc_docs/selfies',
                    resource_type: 'auto',
                });
                console.log('✅ Selfie uploaded:', selfieUpload.secure_url);

                idProofURL = idProofUpload.secure_url;
                addressProofURL = addressProofUpload.secure_url;
                selfieURL = selfieUpload.secure_url;
            } catch (cloudinaryError) {
                console.warn('⚠️ Cloudinary upload failed, storing base64 in DB:', cloudinaryError.message);
                idProofURL = idProofImage;
                addressProofURL = addressProofImage;
                selfieURL = selfieImage;
            }
        } else {
            console.log('ℹ️ Cloudinary not configured, storing base64 images in MongoDB');
            idProofURL = idProofImage;
            addressProofURL = addressProofImage;
            selfieURL = selfieImage;
        }

        // Create KYC record with perceptual hashes
        const kycRecord = new KYC({
            userId,
            idProofType,
            idProofURL,
            extractedNumber,
            idProofHash,
            addressProofType,
            addressProofURL,
            addressProofHash,
            selfieURL,
            status: 'pending',
        });

        await kycRecord.save();

        console.log('✅ KYC record saved successfully with perceptual hashes');

        res.status(201).json({
            success: true,
            message: 'KYC submitted successfully',
            kycId: kycRecord._id,
            data: {
                submittedAt: kycRecord.createdAt,
                status: kycRecord.status,
            },
        });
    } catch (error) {
        console.error('❌ Error in KYC submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
});

// POST /api/kyc/match-faces (for face matching feature)
router.post('/match-faces', async (req, res) => {
    try {
        const { passportPhoto, selfie } = req.body;

        if (!passportPhoto || !selfie) {
            return res.status(400).json({
                success: false,
                error: 'Both passport photo and selfie are required'
            });
        }

        // Simple response for now - client-side face matching is being used
        res.json({
            match: true,
            confidence: 85,
            message: 'Face matching is performed on the client side'
        });
    } catch (error) {
        console.error('Face matching error:', error);
        res.status(500).json({
            success: false,
            error: 'Face matching failed'
        });
    }
});

module.exports = router;
