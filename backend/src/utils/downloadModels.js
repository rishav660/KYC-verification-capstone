const https = require('https');
const fs = require('fs');
const path = require('path');

const MODEL_URL_BASE = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
const MODELS_DIR = path.join(__dirname, '../models');

const models = [
    // SSD MobileNet V1
    { name: 'ssd_mobilenetv1_model-weights_manifest.json', url: `${MODEL_URL_BASE}/ssd_mobilenetv1_model-weights_manifest.json` },
    { name: 'ssd_mobilenetv1_model-shard1', url: `${MODEL_URL_BASE}/ssd_mobilenetv1_model-shard1` },
    { name: 'ssd_mobilenetv1_model-shard2', url: `${MODEL_URL_BASE}/ssd_mobilenetv1_model-shard2` },

    // Face Landmark 68
    { name: 'face_landmark_68_model-weights_manifest.json', url: `${MODEL_URL_BASE}/face_landmark_68_model-weights_manifest.json` },
    { name: 'face_landmark_68_model-shard1', url: `${MODEL_URL_BASE}/face_landmark_68_model-shard1` },

    // Face Recognition
    { name: 'face_recognition_model-weights_manifest.json', url: `${MODEL_URL_BASE}/face_recognition_model-weights_manifest.json` },
    { name: 'face_recognition_model-shard1', url: `${MODEL_URL_BASE}/face_recognition_model-shard1` },
    { name: 'face_recognition_model-shard2', url: `${MODEL_URL_BASE}/face_recognition_model-shard2` }
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    console.log('📁 Created models directory:', MODELS_DIR);
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Downloaded: ${path.basename(dest)}`);
                    resolve();
                });
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                file.close();
                fs.unlinkSync(dest);
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            } else {
                file.close();
                fs.unlinkSync(dest);
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(dest)) {
                fs.unlinkSync(dest);
            }
            console.error(`❌ Error downloading ${path.basename(dest)}:`, err.message);
            reject(err);
        });
    });
}

async function downloadModels() {
    console.log('📥 Downloading face-api.js models...\n');
    console.log('📂 Target directory:', MODELS_DIR, '\n');

    let successCount = 0;
    let failCount = 0;

    for (const model of models) {
        const dest = path.join(MODELS_DIR, model.name);

        // Skip if file already exists
        if (fs.existsSync(dest)) {
            console.log(`⏭️  Skipped (already exists): ${model.name}`);
            successCount++;
            continue;
        }

        try {
            await downloadFile(model.url, dest);
            successCount++;
        } catch (error) {
            console.error(`❌ Failed to download ${model.name}:`, error.message);
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully downloaded/verified: ${successCount}/${models.length}`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount}/${models.length}`);
    }
    console.log('='.repeat(50));

    if (successCount === models.length) {
        console.log('\n🎉 All models ready! Face matching is now available.');
    } else {
        console.log('\n⚠️  Some models failed to download. Face matching may not work properly.');
    }
}

// Run if called directly
if (require.main === module) {
    downloadModels().catch(console.error);
}

module.exports = { downloadModels };
