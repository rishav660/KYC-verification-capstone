import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Load face-api.js models from CDN
export async function loadFaceModels() {
    if (modelsLoaded) {
        console.log('✅ Face models already loaded');
        return true;
    }

    try {
        console.log('📦 Loading face recognition models...');

        const MODEL_URL = '/models'; // We'll serve models from public/models

        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        modelsLoaded = true;
        console.log('✅ Face recognition models loaded successfully');
        return true;
    } catch (error) {
        console.error('❌ Error loading face models:', error);
        return false;
    }
}

// Convert base64 to HTMLImageElement
function base64ToImage(base64String) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = base64String;
    });
}

// Detect face and get descriptor
async function getFaceDescriptor(base64Image, imageLabel = 'image') {
    try {
        const img = await base64ToImage(base64Image);

        const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            return {
                success: false,
                error: `No face detected in ${imageLabel}. Please ensure the photo shows a clear, front-facing view.`
            };
        }

        console.log(`✅ Face detected in ${imageLabel}`);

        return {
            success: true,
            descriptor: detection.descriptor
        };
    } catch (error) {
        console.error(`Error detecting face in ${imageLabel}:`, error);
        return {
            success: false,
            error: `Error processing ${imageLabel}: ${error.message}`
        };
    }
}

// Simple image similarity comparison (fallback if models don't load)
async function compareImagesSimilarity(img1Base64, img2Base64) {
    try {
        const img1 = await base64ToImage(img1Base64);
        const img2 = await base64ToImage(img2Base64);

        // Create canvases
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        const size = 200;

        canvas1.width = canvas1.height = size;
        canvas2.width = canvas2.height = size;

        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        // Draw images
        ctx1.drawImage(img1, 0, 0, size, size);
        ctx2.drawImage(img2, 0, 0, size, size);

        // Get image data
        const data1 = ctx1.getImageData(0, 0, size, size).data;
        const data2 = ctx2.getImageData(0, 0, size, size).data;

        // Calculate similarity
        let diff = 0;
        for (let i = 0; i < data1.length; i += 4) {
            const r = data1[i] - data2[i];
            const g = data1[i + 1] - data2[i + 1];
            const b = data1[i + 2] - data2[i + 2];
            diff += Math.sqrt(r * r + g * g + b * b);
        }

        const maxDiff = size * size * Math.sqrt(255 * 255 * 3);
        const similarity = ((maxDiff - diff) / maxDiff) * 100;

        return {
            match: similarity >= 60,
            confidence: Math.round(similarity),
            method: 'pixel-comparison'
        };
    } catch (error) {
        throw new Error(`Image comparison failed: ${error.message}`);
    }
}

// Main face comparison function
export async function compareFaces(passportPhotoBase64, selfieBase64) {
    try {
        console.log('🔍 Starting face comparison...');

        // Try to load models
        const modelsReady = await loadFaceModels();

        if (modelsReady) {
            // Use face-api.js for accurate face matching
            console.log('📸 Using face recognition (accurate method)...');

            const passportResult = await getFaceDescriptor(passportPhotoBase64, 'passport photo');
            if (!passportResult.success) {
                return {
                    match: false,
                    confidence: 0,
                    error: passportResult.error
                };
            }

            const selfieResult = await getFaceDescriptor(selfieBase64, 'selfie');
            if (!selfieResult.success) {
                return {
                    match: false,
                    confidence: 0,
                    error: selfieResult.error
                };
            }

            // Calculate Euclidean distance
            const distance = faceapi.euclideanDistance(
                passportResult.descriptor,
                selfieResult.descriptor
            );

            console.log('📊 Face distance:', distance.toFixed(4));

            const threshold = 0.6;
            const match = distance < threshold;
            const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

            console.log(`${match ? '✅' : '❌'} Match result:`, {
                match,
                confidence: `${confidence}%`,
                method: 'face-recognition'
            });

            return {
                match,
                confidence,
                distance: distance.toFixed(4),
                threshold,
                method: 'face-recognition'
            };
        } else {
            // Fallback to simple image comparison
            console.log('📸 Using image similarity (fallback method)...');
            return await compareImagesSimilarity(passportPhotoBase64, selfieBase64);
        }
    } catch (error) {
        console.error('❌ Error in face comparison:', error);

        // Try fallback method
        try {
            console.log('🔄 Trying fallback image comparison...');
            return await compareImagesSimilarity(passportPhotoBase64, selfieBase64);
        } catch (fallbackError) {
            return {
                match: false,
                confidence: 0,
                error: `Face matching failed: ${error.message}`
            };
        }
    }
}
