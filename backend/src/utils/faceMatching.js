const sharp = require('sharp');
const pixelmatch = require('pixelmatch');

/**
 * Simple face matching using image similarity
 * This is a basic implementation that compares image similarity
 * For production, consider using proper face recognition libraries
 */

async function base64ToBuffer(base64String) {
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
}

async function preprocessImage(buffer) {
    try {
        // Resize to standard size and convert to grayscale for comparison
        const processed = await sharp(buffer)
            .resize(200, 200, { fit: 'cover', position: 'center' })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        return processed;
    } catch (error) {
        throw new Error(`Image preprocessing failed: ${error.message}`);
    }
}

async function calculateImageSimilarity(image1Buffer, image2Buffer) {
    try {
        const img1 = await preprocessImage(image1Buffer);
        const img2 = await preprocessImage(image2Buffer);

        // Use pixelmatch to compare images
        const diff = pixelmatch(
            img1.data,
            img2.data,
            null,
            img1.info.width,
            img1.info.height,
            { threshold: 0.1 }
        );

        // Calculate similarity percentage
        const totalPixels = img1.info.width * img1.info.height;
        const similarity = ((totalPixels - diff) / totalPixels) * 100;

        return similarity;
    } catch (error) {
        throw new Error(`Similarity calculation failed: ${error.message}`);
    }
}

async function compareFaces(passportPhotoBase64, selfieBase64) {
    try {
        console.log('🔍 Starting face comparison...');

        // Convert base64 to buffers
        const passportBuffer = await base64ToBuffer(passportPhotoBase64);
        const selfieBuffer = await base64ToBuffer(selfieBase64);

        console.log('📸 Processing images...');

        // Calculate similarity
        const similarity = await calculateImageSimilarity(passportBuffer, selfieBuffer);

        console.log('📊 Similarity score:', similarity.toFixed(2) + '%');

        // Threshold for match (60% similarity)
        const threshold = 60;
        const match = similarity >= threshold;
        const confidence = Math.round(similarity);

        console.log(`${match ? '✅' : '❌'} Match result:`, {
            match,
            confidence: `${confidence}%`,
            threshold: `${threshold}%`
        });

        return {
            match,
            confidence,
            threshold,
            similarity: similarity.toFixed(2)
        };
    } catch (error) {
        console.error('❌ Error in face comparison:', error);
        return {
            match: false,
            confidence: 0,
            error: `Face matching failed: ${error.message}. Please ensure both images are clear and contain visible faces.`
        };
    }
}

async function loadModels() {
    // No models needed for this simple implementation
    console.log('✅ Image comparison ready (no models required)');
    return true;
}

module.exports = {
    loadModels,
    compareFaces
};
