import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../context/KYCContext';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const UploadPassportPhoto = () => {
    const navigate = useNavigate();
    const { setPassportPhoto } = useKYC();
    const fileInputRef = useRef(null);

    const [uploadedImage, setUploadedImage] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target.result);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleRetake = () => {
        setUploadedImage(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleProceed = () => {
        import React, { useState, useRef } from 'react';
        import { useNavigate } from 'react-router-dom';
        import { useKYC } from '../context/KYCContext';
        import { HeaderBanner } from '../components/HeaderBanner';
        import { ProgressBar } from '../components/ProgressBar';

        const UploadPassportPhoto = () => {
            const navigate = useNavigate();
            const { setPassportPhoto } = useKYC();
            const fileInputRef = useRef(null);

            const [uploadedImage, setUploadedImage] = useState(null);
            const [error, setError] = useState(null);

            const handleFileUpload = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    setError('Please upload an image file (JPG, PNG)');
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    setError('File size must be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    setUploadedImage(e.target.result);
                    setError(null);
                };
                reader.readAsDataURL(file);
            };

            const handleRetake = () => {
                setUploadedImage(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            };

            const handleProceed = () => {
                if (!uploadedImage) return;
                setPassportPhoto(uploadedImage);
                navigate('/selfie');
            };

            return (
\u003cmain className = "min-h-screen bg-background font-sans text-foreground"\u003e
\u003cHeaderBanner /\u003e

\u003cdiv className = "max-w-4xl mx-auto px-4 py-8"\u003e
\u003cProgressBar currentStep = { 4} totalSteps = { 6} /\u003e

\u003cdiv className = "bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn"\u003e
\u003ch2 className = "text-2xl font-bold text-primary mb-2"\u003eUpload Passport Photo\u003c / h2\u003e
\u003cp className = "text-muted-foreground mb-4"\u003e
                        Please upload a recent passport - sized photograph for face verification.
\u003c / p\u003e

\u003cbutton
onClick = {() =\u003e navigate(-1)}
className = "mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
\u003e
                        ← Back
\u003c / button\u003e

{
    error && (
    \u003cdiv className = "mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"\u003e
    \u003cp className = "text-sm font-bold text-destructive"\u003e⚠️ { error } \u003c / p\u003e
    \u003c / div\u003e
                    )
}

{
    !uploadedImage && (
    \u003cdiv className = "space-y-6"\u003e
    \u003cdiv
    className = "bg-muted/50 p-8 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer text-center"
    onClick = {() =\u003e fileInputRef.current?.click()
}
\u003e
\u003cdiv className = "flex flex-col items-center justify-center py-8"\u003e
\u003cdiv className = "w-24 h-24 mb-4 rounded-full bg-primary/10 flex items-center justify-center"\u003e
\u003csvg className = "w-12 h-12 text-primary" fill = "none" stroke = "currentColor" viewBox = "0 0 24 24"\u003e
\u003cpath strokeLinecap = "round" strokeLinejoin = "round" strokeWidth = "2" d = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"\u003e\u003c / path\u003e
\u003c / svg\u003e
\u003c / div\u003e
\u003cp className = "mb-2 text-lg text-foreground font-semibold"\u003eClick to upload passport photo\u003c / p\u003e
\u003cp className = "text-sm text-muted-foreground"\u003eJPG, PNG(Max 5MB) \u003c / p\u003e
\u003c / div\u003e
\u003cinput
ref = { fileInputRef }
type = "file"
accept = "image/*"
onChange = { handleFileUpload }
className = "hidden"
    /\u003e
\u003c / div\u003e

\u003cdiv className = "p-6 bg-primary/5 border border-primary/10 rounded-lg"\u003e
\u003cp className = "text-sm font-semibold text-primary mb-3"\u003e📸 Photo Requirements: \u003c / p\u003e
\u003cul className = "text-sm text-muted-foreground space-y-2 ml-4 list-disc"\u003e
\u003cli\u003eRecent photograph(taken within last 6 months) \u003c / li\u003e
\u003cli\u003eClear, front - facing view of your face\u003c / li\u003e
\u003cli\u003eNeutral expression with eyes open\u003c / li\u003e
\u003cli\u003ePlain white or light - colored background\u003c / li\u003e
\u003cli\u003eNo glasses, hats, or face coverings\u003c / li\u003e
\u003cli\u003eGood lighting with no shadows on face\u003c / li\u003e
\u003c / ul\u003e
\u003c / div\u003e
\u003c / div\u003e
                    )}

{
    uploadedImage && (
    \u003cdiv className = "space-y-6"\u003e
    \u003cdiv className = "p-4 bg-muted/30 rounded-lg border border-border"\u003e
    \u003cp className = "text-sm font-semibold text-foreground mb-3"\u003ePreview: \u003c / p\u003e
    \u003cdiv className = "relative rounded-xl overflow-hidden border-4 border-border bg-black aspect-[3/4] max-w-sm mx-auto shadow-lg"\u003e
    \u003cimg src = { uploadedImage } alt = "Passport Photo" className = "w-full h-full object-cover" /\u003e
    \u003c / div\u003e
    \u003c / div\u003e

    \u003cdiv className = "p-4 bg-green-50 border border-green-200 rounded-lg"\u003e
    \u003cp className = "text-sm font-bold text-green-700"\u003e✅ Photo uploaded successfully\u003c / p\u003e
    \u003cp className = "text-xs text-green-600 mt-1"\u003e
                                    This photo will be used for face verification in the next step
    \u003c / p\u003e
    \u003c / div\u003e

    \u003cdiv className = "flex gap-4 pt-4 border-t border-border"\u003e
    \u003cbutton
    onClick = { handleRetake }
    className = "flex-1 py-3 border-2 border-border text-muted-foreground font-bold rounded-lg hover:bg-muted/50 transition-colors"
    \u003e
                                    Upload Different Photo
    \u003c / button\u003e
    \u003cbutton
    onClick = { handleProceed }
    className = "flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-md transition-transform hover:scale-105"
    \u003e
                                    Continue to Selfie
    \u003c / button\u003e
    \u003c / div\u003e
    \u003c / div\u003e
                    )
}
\u003c / div\u003e
\u003c / div\u003e
\u003c / main\u003e
    );
};

export default UploadPassportPhoto;
