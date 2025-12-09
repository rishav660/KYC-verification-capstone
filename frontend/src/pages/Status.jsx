import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HeaderBanner } from '../components/HeaderBanner';
import { useKYC } from '../context/KYCContext';

const Status = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearKYCData } = useKYC();
    const { status, message, kycId, submittedAt } = location.state || {};

    // Clear KYC data from localStorage on successful submission
    useEffect(() => {
        if (status === 'submitted') {
            clearKYCData();
            console.log('✅ KYC data cleared from localStorage');
        }
    }, [status, clearKYCData]);

    const getStatusConfig = (status) => {
        const s = status?.toLowerCase();
        if (s === 'submitted') return { icon: '✅', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', title: 'Submission Successful' };
        if (s === 'duplicate') return { icon: '⚠️', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'Duplicate Record' };
        if (s === 'error') return { icon: '❌', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', title: 'Submission Failed' };
        return { icon: 'ℹ️', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', title: 'Status Update' };
    };

    const config = getStatusConfig(status);

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-card rounded-xl shadow-lg border border-border p-8 md:p-12 text-center animate-fadeIn max-w-2xl mx-auto">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-6xl mx-auto mb-6 ${config.bg} ${config.border} border-4`}>
                        {config.icon}
                    </div>

                    <h2 className={`text-3xl font-bold mb-4 ${config.color}`}>
                        {config.title}
                    </h2>

                    <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {message || 'Your application status is updated.'}
                    </p>

                    {kycId && (
                        <div className="bg-muted/30 rounded-lg p-6 mb-8 border border-border inline-block w-full text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reference ID</p>
                                    <p className="text-lg font-mono font-bold text-foreground">{kycId}</p>
                                </div>
                                {submittedAt && (
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Submitted On</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {new Date(submittedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(submittedAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/start')}
                            className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow hover:bg-primary/90 transition-colors"
                        >
                            Return to Home
                        </button>

                        {status === 'submitted' && (
                            <p className="text-xs text-muted-foreground">
                                You will receive an email confirmation shortly.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Status;
