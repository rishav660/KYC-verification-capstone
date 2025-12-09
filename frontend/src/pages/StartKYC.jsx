import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderBanner } from '../components/HeaderBanner';

const StartKYC = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/basic-details');
    };

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-card rounded-xl shadow-lg border border-border p-8 md:p-12 animate-fadeIn">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-primary mb-6">
                            Welcome to Digital KYC
                        </h2>

                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Complete your KYC verification process securely from the comfort of your home.
                            Please keep your documents ready for a seamless experience.
                        </p>

                        <div className="bg-muted/30 border-l-4 border-accent p-6 mb-8 text-left rounded-r-lg">
                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                Required Documents:
                            </h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> Identity Proof (PAN/Aadhaar/Passport)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> Address Proof (Aadhaar/Voter ID/Bill)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span> Recent Photograph (Selfie)
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-md hover:bg-primary/90 hover:scale-105 transition-all duration-200 text-lg"
                        >
                            Start KYC Process
                        </button>

                        <p className="text-xs text-muted-foreground mt-6">
                            By continuing, you agree to our Terms & Conditions and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default StartKYC;
