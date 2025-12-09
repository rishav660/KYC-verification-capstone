import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../context/KYCContext';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const SelectAddress = () => {
    const navigate = useNavigate();
    const { idData } = useKYC();
    const [documentType, setDocumentType] = useState('');

    const documentOptions = ['Aadhaar Card', 'Passport', 'Voter ID', 'Utility Bill', 'Rental Agreement'];

    const handleNext = () => {
        if (documentType) {
            navigate('/scan', {
                state: {
                    proofCategory: 'ADDRESS',
                    documentType: documentType
                }
            });
        }
    };

    const isNextDisabled = !documentType;

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={3} totalSteps={5} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Select Address Proof</h2>
                    <p className="text-muted-foreground mb-8">Please select a valid document to verify your residential address.</p>

                    {/* ID Document Status */}
                    {idData.proofType && (
                        <div className="mb-8 p-4 bg-green-50/50 border border-green-200 rounded-lg flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                            <div>
                                <p className="text-sm font-semibold text-green-800">Identity Proof Captured</p>
                                <p className="text-xs text-green-700">{idData.proofType}</p>
                            </div>
                        </div>
                    )}

                    {/* Document Type Dropdown */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-foreground mb-2">
                            Address Proof Document <span className="text-accent">*</span>
                        </label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-input text-foreground transition-colors"
                        >
                            <option value="">-- Select Document --</option>
                            {documentOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            className={`flex-1 px-6 py-3 font-bold rounded-lg shadow-md transition-all duration-200 ${isNextDisabled
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                                }`}
                        >
                            Next Step
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SelectAddress;
