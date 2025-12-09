import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const SelectDocument = () => {
    const navigate = useNavigate();
    const [selectedDocCategory, setSelectedDocCategory] = useState(null);
    const [documentType, setDocumentType] = useState('');

    const documentOptions = {
        ID: ['PAN Card', 'Aadhaar Card', 'Passport'],
        ADDRESS: ['Aadhaar Card', 'Passport', 'Voter ID']
    };

    const handleCategorySelect = (category) => {
        setSelectedDocCategory(category);
        setDocumentType('');
    };

    const handleNext = () => {
        if (selectedDocCategory && documentType) {
            navigate('/scan', {
                state: {
                    proofCategory: selectedDocCategory,
                    documentType: documentType
                }
            });
        }
    };

    const isNextDisabled = !selectedDocCategory || !documentType;

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={2} totalSteps={5} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Select Document Type</h2>
                    <p className="text-muted-foreground mb-8">Choose the type of document you want to upload for verification.</p>

                    {/* Category Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-foreground mb-3">
                            Document Category <span className="text-accent">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleCategorySelect('ID')}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 ${selectedDocCategory === 'ID'
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                            >
                                <span className="text-2xl">📄</span>
                                <div>
                                    <div className="font-semibold text-foreground">Identity Proof</div>
                                    <div className="text-xs text-muted-foreground">PAN, Aadhaar, Passport</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleCategorySelect('ADDRESS')}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 ${selectedDocCategory === 'ADDRESS'
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                    }`}
                            >
                                <span className="text-2xl">🏠</span>
                                <div>
                                    <div className="font-semibold text-foreground">Address Proof</div>
                                    <div className="text-xs text-muted-foreground">Aadhaar, Passport, Voter ID</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Document Type Dropdown */}
                    {selectedDocCategory && (
                        <div className="mb-8 animate-fadeIn">
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Select {selectedDocCategory === 'ID' ? 'Identity' : 'Address'} Document <span className="text-accent">*</span>
                            </label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-input text-foreground transition-colors"
                            >
                                <option value="">-- Select Document --</option>
                                {documentOptions[selectedDocCategory].map((doc) => (
                                    <option key={doc} value={doc}>
                                        {doc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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

export default SelectDocument;
