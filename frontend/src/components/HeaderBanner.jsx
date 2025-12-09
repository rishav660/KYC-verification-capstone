import React from 'react';

export function HeaderBanner() {
    return (
        <div className="bg-primary text-primary-foreground py-6 px-4 border-b-4 border-accent shadow-md">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    {/* HDFC Logo Placeholder or Text */}
                    <div className="text-2xl font-bold tracking-tight">HDFC BANK</div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Know Your Customer (KYC) Verification</h1>
                <p className="text-primary-foreground/90 text-lg">Complete your KYC process securely online in minutes</p>
            </div>
        </div>
    );
}
