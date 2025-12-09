import imageCompression from 'browser-image-compression';

/**
 * Compress image to reduce file size before upload
 * @param {string} base64Image - Base64 encoded image
 * @param {object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 image
 */
export async function compressImage(base64Image, options = {}) {
    try {
        // Default compression options
        const defaultOptions = {
            maxSizeMB: 0.5,          // Max file size in MB
            maxWidthOrHeight: 1920,  // Max width or height
            useWebWorker: true,      // Use web worker for better performance
            initialQuality: 0.8      // Initial quality (0-1)
        };

        const compressionOptions = { ...defaultOptions, ...options };

        // Convert base64 to blob
        const blob = await base64ToBlob(base64Image);

        console.log('📦 Original size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

        // Compress the image
        const compressedBlob = await imageCompression(blob, compressionOptions);

        console.log('✅ Compressed size:', (compressedBlob.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('📊 Compression ratio:', ((1 - compressedBlob.size / blob.size) * 100).toFixed(1) + '% reduction');

        // Convert back to base64
        const compressedBase64 = await blobToBase64(compressedBlob);

        return compressedBase64;
    } catch (error) {
        console.error('❌ Compression error:', error);
        // Return original image if compression fails
        return base64Image;
    }
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64) {
    return new Promise((resolve, reject) => {
        try {
            const parts = base64.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);

            for (let i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            resolve(new Blob([uInt8Array], { type: contentType }));
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Convert Blob to base64
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(images, options = {}) {
    console.log('🔄 Compressing', images.length, 'images...');

    const compressionPromises = images.map(img => compressImage(img, options));
    const compressedImages = await Promise.all(compressionPromises);

    console.log('✅ All images compressed!');

    return compressedImages;
}

/**
 * Get estimated upload time based on file size
 */
export function estimateUploadTime(fileSizeBytes, connectionSpeedMbps = 10) {
    const fileSizeMb = fileSizeBytes / 1024 / 1024;
    const timeSeconds = (fileSizeMb * 8) / connectionSpeedMbps;
    return timeSeconds;
}
