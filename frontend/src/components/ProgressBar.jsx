import React from 'react';

export function ProgressBar({ currentStep, totalSteps }) {
    const progress = (currentStep / totalSteps) * 100;
    const steps = ["Personal Info", "Document Selection", "Scan & Upload", "Selfie", "Review"];

    // Adjust steps array based on actual flow if needed, but keeping generic for now or matching totalSteps
    // The user's flow is: Start -> Select Doc -> Select Address -> Scan -> Selfie -> Preview -> Status
    // Let's map these roughly to 4-5 steps.

    return (
        <div className="mb-8 mt-8 w-full max-w-4xl mx-auto px-4">
            <div className="flex justify-between mb-4 relative">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative z-10">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${index + 1 <= currentStep
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-110"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                        >
                            {index + 1}
                        </div>
                        <p
                            className={`text-xs mt-2 text-center font-medium ${index + 1 <= currentStep ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            Step {index + 1}
                        </p>
                    </div>
                ))}

                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-muted -z-0 rounded-full"></div>

                {/* Active Progress Line */}
                <div
                    className="absolute top-5 left-0 h-1 bg-primary -z-0 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}
