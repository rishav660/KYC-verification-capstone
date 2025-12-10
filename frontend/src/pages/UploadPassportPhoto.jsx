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
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={4} totalSteps={6} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Upload Passport Photo</h2>
                    <p className="text-muted-foreground mb-4">
                        Please upload a recent passport-sized photograph for face verification.
                    </p>

                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    >
                        ← Back
                    </button>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm font-bold text-destructive">⚠️ {error}</p>
                        </div>
                    )}

                    {!uploadedImage && (
                        <div className="space-y-6">
                            <div
                                className="bg-muted/50 p-8 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer text-center"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-24 h-24 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                    </div>
                                    <p className="mb-2 text-lg text-foreground font-semibold">Click to upload passport photo</p>
                                    <p className="text-sm text-muted-foreground">JPG, PNG (Max 5MB)</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-lg">
                                <p className="text-sm font-semibold text-primary mb-3">📸 Photo Requirements:</p>
                                <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                                    <li >Recent photograph (taken within last 6 months)</li>
                                    <li >Clear, front-facing view of your face</li>
                                    <li >Neutral expression with eyes open</li>
                                    <li >Plain white or light-colored background</li>
                                    <li >No glasses, hats, or face coverings</li>
                                    <li >Good lighting with no shadows on face</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {uploadedImage && (
                        <div className="space-y-6">
                            <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                <p className="text-sm font-semibold text-foreground mb-3">Preview:</p>
                                <div className="relative rounded-xl overflow-hidden border-4 border-border bg-black aspect-[3/4] max-w-sm mx-auto shadow-lg">
                                    <img src={uploadedImage} alt="Passport Photo" className="w-full h-full object-cover" />
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-bold text-green-700">✅ Photo uploaded successfully</p>
                                <p className="text-xs text-green-600 mt-1">
                                    This photo will be used for face verification in the next step
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 py-3 border-2 border-border text-muted-foreground font-bold rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    Upload Different Photo
                                </button>
                                <button
                                    onClick={handleProceed}
                                    className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-md transition-transform hover:scale-105"
                                >
                                    Continue to Selfie
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default UploadPassportPhoto;
