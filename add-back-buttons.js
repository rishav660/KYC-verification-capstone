const fs = require('fs');
const path = require('path');

const backButtonCode = `
                    \u003cbutton 
                        onClick={() =\u003e navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    \u003e
                        ← Back
                    \u003c/button\u003e
`;

const files = {
    'frontend/src/pages/ScanDocument.jsx': {
        find: '\u003cp className="text-muted-foreground mb-8"\u003ePlease upload a clear copy of your {documentType}.\u003c/p\u003e',
        replace: '\u003cp className="text-muted-foreground mb-4"\u003ePlease upload a clear copy of your {documentType}.\u003c/p\u003e' + backButtonCode
    },
    'frontend/src/pages/UploadPassportPhoto.jsx': {
        find: `\u003cp className="text-muted-foreground mb-8"\u003e
                        Please upload a recent passport-sized photograph for face verification.
                    \u003c/p\u003e`,
        replace: `\u003cp className="text-muted-foreground mb-4"\u003e
                        Please upload a recent passport-sized photograph for face verification.
                    \u003c/p\u003e` + backButtonCode
    },
    'frontend/src/pages/CaptureSelfie.jsx': {
        find: '\u003cp className="text-xs text-primary/70 mb-8"\u003e✨ Face matching happens in your browser - your photos never leave your device!\u003c/p\u003e',
        replace: '\u003cp className="text-xs text-primary/70 mb-4"\u003e✨ Face matching happens in your browser - your photos never leave your device!\u003c/p\u003e' + backButtonCode
    },
    'frontend/src/pages/PreviewSubmit.jsx': {
        find: '\u003ch2 className="text-2xl font-bold text-primary mb-6"\u003eReview Application\u003c/h2\u003e',
        replace: `\u003ch2 className="text-2xl font-bold text-primary mb-2"\u003eReview Application\u003c/h2\u003e
                    \u003cbutton 
                        onClick={() =\u003e navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    \u003e
                        ← Back
                    \u003c/button\u003e`
    }
};

Object.entries(files).forEach(([filePath, { find, replace }]) => {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    if (content.includes(find)) {
        content = content.replace(find, replace);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Added back button to ${filePath}`);
    } else {
        console.log(`❌ Could not find target text in ${filePath}`);
    }
});

console.log('\n✨ Done! All back buttons added.');
