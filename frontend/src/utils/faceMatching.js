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


// Main face comparison function
export async function compareFaces(passportPhotoBase64, selfieBase64) {
    try {
        console.log('🔍 Starting face comparison...');

        // STRICT REQUIREMENT: Face models MUST be loaded
        const modelsReady = await loadFaceModels();

        if (!modelsReady) {
            return {
                match: false,
                confidence: 0,
                error: 'Face recognition models failed to load. Please refresh the page and try again.'
            };
        }

        console.log('📸 Using face recognition with strict validation...');

        // STRICT REQUIREMENT: Passport photo MUST have a detectable face
        const passportResult = await getFaceDescriptor(passportPhotoBase64, 'passport photo');
        if (!passportResult.success) {
            return {
                match: false,
                confidence: 0,
                error: passportResult.error
            };
        }

        // STRICT REQUIREMENT: Selfie MUST have a detectable face
        const selfieResult = await getFaceDescriptor(selfieBase64, 'selfie');
        if (!selfieResult.success) {
            return {
                match: false,
                confidence: 0,
                error: selfieResult.error
            };
        }

        // Calculate Euclidean distance between face descriptors
        const distance = faceapi.euclideanDistance(
            passportResult.descriptor,
            selfieResult.descriptor
        );

        console.log('📊 Face distance:', distance.toFixed(4));

        // Threshold adjusted for stricter matching
        // Confidence = (1 - distance) * 100
        // To require minimum 60% confidence: distance must be <= 0.4
        // Examples:
        //   distance 0.30 → 70% confidence ✅ PASS
        //   distance 0.40 → 60% confidence ✅ PASS
        //   distance 0.50 → 50% confidence ❌ FAIL
        const threshold = 0.4;
        const match = distance < threshold;
        const confidence = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));

        console.log(`${match ? '✅' : '❌'} Match result:`, {
            match,
            confidence: `${confidence}%`,
            distance: distance.toFixed(4),
            threshold,
            method: 'face-recognition'
        });

        return {
            match,
            confidence,
            distance: distance.toFixed(4),
            threshold,
            method: 'face-recognition'
        };
    } catch (error) {
        console.error('❌ Error in face comparison:', error);

        // NO FALLBACK - Fail securely
        return {
            match: false,
            confidence: 0,
            error: `Face matching failed: ${error.message}. Please ensure both images contain clear, visible faces and try again.`
        };
    }
}
