const fs = require('fs');
const path = require('path');

const filePath = 'frontend/src/pages/UploadPassportPhoto.jsx';
const fullPath = path.join(__dirname, filePath);
let content = fs.readFileSync(fullPath, 'utf8');

// Find and replace
const find = '\u003cp className="text-muted-foreground mb-8"\u003e\n                        Please upload a recent passport-sized photograph for face verification.\n                    \u003c/p\u003e';
const replace = `\u003cp className="text-muted-foreground mb-4"\u003e
                        Please upload a recent passport-sized photograph for face verification.
                    \u003c/p\u003e
                    
                    \u003cbutton 
                        onClick={() =\u003e navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    \u003e
                        ← Back
                    \u003c/button\u003e`;

if (content.includes(find)) {
    content = content.replace(find, replace);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✅ Successfully added back button to UploadPassportPhoto.jsx');
} else {
    console.log('❌ Could not find target text');
}
