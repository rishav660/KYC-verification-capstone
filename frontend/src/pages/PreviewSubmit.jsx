import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useKYC } from '../context/KYCContext';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const PreviewSubmit = () => {
    const navigate = useNavigate();
    const { idData, addressData, selfieData, personalInfo } = useKYC();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const { proofType: idProofType, image: idProofImage } = idData;
    const { proofType: addressProofType, image: addressProofImage } = addressData;
    const selfieImage = selfieData;

    useEffect(() => {
        const missing = [];
        if (!idProofImage) missing.push('ID Proof');
        if (!addressProofImage) missing.push('Address Proof');
        if (!selfieImage) missing.push('Selfie');
        if (missing.length > 0) setValidationError(`Missing: ${missing.join(', ')}`);
        else setValidationError(null);
    }, [idProofImage, addressProofImage, selfieImage]);

    const handleSubmit = async () => {
        if (validationError) return;
        setIsSubmitting(true);

        try {
            console.log('🔄 Compressing images before upload...');

            // Import compression utility
            const { compressImages } = await import('../utils/imageCompression');

            // Compress all images in parallel
            const [compressedIdProof, compressedAddressProof, compressedSelfie] = await compressImages([
                idProofImage,
                addressProofImage,
                selfieImage
            ], {
                maxSizeMB: 0.5,        // Max 500KB per image
                maxWidthOrHeight: 1920, // Max dimension
                useWebWorker: true
            });

            console.log('✅ Images compressed successfully!');

            const submissionData = {
                idProofType,
                idProofImage: compressedIdProof,
                addressProofType,
                addressProofImage: compressedAddressProof,
                selfieImage: compressedSelfie,
            };

            console.log('📤 Uploading compressed images...');
            const response = await api.post('/api/kyc/submit-kyc', submissionData);

            if (response.data.duplicate) {
                navigate('/status', { state: { status: 'duplicate', message: 'Duplicate record found.' } });
            } else if (response.data.success) {
                navigate('/status', {
                    state: {
                        status: 'submitted',
                        message: 'KYC submitted successfully.',
                        kycId: response.data.kycId,
                        submittedAt: response.data.data?.submittedAt
                    }
                });
            } else {
                alert(response.data.message || 'Submission failed.');
            }
        } catch (error) {
            setIsSubmitting(false);
            if (error.response) {
                const data = error.response.data;
                if (data.wrongDocumentType || data.ocrFailed || data.duplicate) {
                    navigate('/status', { state: { status: 'error', message: data.message } });
                } else {
                    alert(data.message || 'Submission failed.');
                }
            } else {
                alert('Network error.');
            }
        }
    };

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={6} totalSteps={6} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Review Application</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    >
                        ← Back
                    </button>

                    {validationError && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm font-bold text-destructive">⚠️ {validationError}</p>
                        </div>
                    )}

                    {/* Personal Info Summary */}
                    <div className="mb-8 p-6 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">👤</div>
                            <h3 className="font-semibold text-lg text-foreground">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Full Name</p>
                                <p className="font-medium text-foreground">{personalInfo?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium text-foreground">{personalInfo?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium text-foreground">{personalInfo?.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date of Birth</p>
                                <p className="font-medium text-foreground">{personalInfo?.dob || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* ID Proof */}
                        <div className="p-6 rounded-lg border border-border bg-muted/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                                <h3 className="font-semibold text-lg text-foreground">Identity Proof</h3>
                            </div>
                            {idProofImage ? (
                                <div className="space-y-3">
                                    <img src={idProofImage} alt="ID" className="w-full h-40 object-contain bg-white rounded border border-border" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Type:</span> <span className="font-medium">{idProofType}</span>
                                    </div>
                                </div>
                            ) : <p className="text-muted-foreground text-sm">Not uploaded</p>}
                        </div>

                        {/* Address Proof */}
                        <div className="p-6 rounded-lg border border-border bg-muted/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                                <h3 className="font-semibold text-lg text-foreground">Address Proof</h3>
                            </div>
                            {addressProofImage ? (
                                <div className="space-y-3">
                                    <img src={addressProofImage} alt="Address" className="w-full h-40 object-contain bg-white rounded border border-border" />
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Type:</span> <span className="font-medium">{addressProofType}</span>
                                    </div>
                                </div>
                            ) : <p className="text-muted-foreground text-sm">Not uploaded</p>}
                        </div>
                    </div>

                    {/* Selfie */}
                    <div className="mb-8 p-6 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                            <h3 className="font-semibold text-lg text-foreground">Selfie Photograph</h3>
                        </div>
                        {selfieImage ? (
                            <div className="flex justify-center">
                                <img src={selfieImage} alt="Selfie" className="h-48 w-48 object-cover rounded-full border-4 border-white shadow-md" />
                            </div>
                        ) : <p className="text-muted-foreground text-sm text-center">Not captured</p>}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!validationError}
                            className={`w-full md:w-auto px-12 py-4 font-bold rounded-lg shadow-lg transition-all transform ${isSubmitting || validationError
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                    Compressing & Uploading...
                                </span>
                            ) : 'Submit KYC Application'}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PreviewSubmit;
