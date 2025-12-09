const imghash = require('imghash');

/**
 * Generate a perceptual hash of an image for duplicate detection
 * Perceptual hashing creates a fingerprint based on visual content,
 * allowing detection of similar images even if they're not identical
 */
async function generatePerceptualHash(base64Image) {
    try {
        // Remove data URL prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate perceptual hash (16-bit hash by default)
        const hash = await imghash.hash(buffer, 16);

        console.log('🔐 Generated perceptual hash:', hash);
        return hash;
    } catch (error) {
        console.error('❌ Error generating perceptual hash:', error);
        return null;
    }
}

/**
 * Calculate Hamming distance between two perceptual hashes
 * Returns a number between 0 (identical) and 256 (completely different)
 */
function calculateHashDistance(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) {
        return 256; // Maximum distance if invalid
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++;
        }
    }

    return distance;
}

/**
 * Check if two images are similar based on their perceptual hashes
 * @param {string} hash1 - First perceptual hash
 * @param {string} hash2 - Second perceptual hash
 * @param {number} threshold - Maximum distance to consider similar (default: 10)
 * @returns {boolean} - True if images are similar
 */
function areImagesSimilar(hash1, hash2, threshold = 10) {
    const distance = calculateHashDistance(hash1, hash2);
    const similarity = ((64 - distance) / 64) * 100; // Convert to percentage

    console.log(`📊 Hash comparison - Distance: ${distance}, Similarity: ${similarity.toFixed(1)}%`);

    // Distance <= 10 means ~85%+ similarity (good for duplicate detection)
    return distance <= threshold;
}

/**
 * Find similar images in database
 * @param {Array} existingHashes - Array of existing perceptual hashes
 * @param {string} newHash - New image's perceptual hash
 * @param {number} threshold - Similarity threshold
 * @returns {Object} - { isSimilar: boolean, matchedHash: string, similarity: number }
 */
function findSimilarImage(existingHashes, newHash, threshold = 10) {
    for (const existingHash of existingHashes) {
        const distance = calculateHashDistance(existingHash, newHash);

        if (distance <= threshold) {
            const similarity = ((64 - distance) / 64) * 100;
            return {
                isSimilar: true,
                matchedHash: existingHash,
                distance,
                similarity: similarity.toFixed(1)
            };
        }
    }

    return { isSimilar: false };
}

module.exports = {
    generatePerceptualHash,
    calculateHashDistance,
    areImagesSimilar,
    findSimilarImage
};
