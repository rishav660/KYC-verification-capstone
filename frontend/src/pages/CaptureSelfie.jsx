import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../context/KYCContext';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const CaptureSelfie = () => {
    const navigate = useNavigate();
    const { setSelfieData, passportPhoto } = useKYC();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [error, setError] = useState(null);
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState(null);

    useEffect(() => {
        if (!passportPhoto) {
            setError('Please upload a passport photo first');
            return;
        }
        startWebcam();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setIsWebcamActive(true);
            setError(null);
        } catch (err) {
            setError('Unable to access webcam. Please check permissions.');
            setIsWebcamActive(false);
        }
    };

    const captureSelfie = async () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(imageDataUrl);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            setIsWebcamActive(false);

            // Perform CLIENT-SIDE face matching
            await performFaceMatching(imageDataUrl);
        }
    };

    const performFaceMatching = async (selfieImage) => {
        setIsMatching(true);
        setMatchResult(null);

        try {
            console.log('🔍 Performing client-side face matching...');

            // Import face matching utility (client-side)
            const { compareFaces } = await import('../utils/faceMatching');

            // Compare faces in the browser
            const result = await compareFaces(passportPhoto, selfieImage);

            console.log('✅ Face matching complete:', result);
            setMatchResult(result);
            setIsMatching(false);
        } catch (error) {
            console.error('Face matching error:', error);

            setMatchResult({
                match: false,
                error: error.message || 'Failed to perform face matching. Please try again.'
            });
            setIsMatching(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setMatchResult(null);
        startWebcam();
    };

    const handleProceed = () => {
        if (!capturedImage || !matchResult?.match) return;
        setSelfieData(capturedImage);
        navigate('/preview');
    };

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={5} totalSteps={6} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Capture Live Selfie</h2>
                    <p className="text-muted-foreground mb-4">Take a clear photo of yourself for face verification.</p>
                    <p className="text-xs text-primary/70 mb-8">✨ Face matching happens in your browser - your photos never leave your device!</p>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm font-bold text-destructive">{error}</p>
                            {!passportPhoto && (
                                <button
                                    onClick={() => navigate('/upload-passport-photo')}
                                    className="mt-2 text-sm text-primary font-semibold hover:underline"
                                >
                                    Go to Passport Photo Upload
                                </button>
                            )}
                            {passportPhoto && (
                                <button onClick={startWebcam} className="mt-2 text-sm text-primary font-semibold hover:underline">
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}

                    {isWebcamActive && !capturedImage && (
                        <div className="space-y-6">
                            <div className="relative rounded-xl overflow-hidden border-4 border-primary bg-black aspect-[3/4] max-w-sm mx-auto shadow-xl">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="border-4 border-white/50 rounded-full w-48 h-64"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <button onClick={captureSelfie} className="w-full max-w-sm py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-md transition-transform hover:scale-105">
                                    📸 Capture Photo
                                </button>
                            </div>
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />

                    {capturedImage && (
                        <div className="space-y-6 text-center">
                            <div className="relative rounded-xl overflow-hidden border-4 border-border bg-black aspect-[3/4] max-w-sm mx-auto shadow-lg">
                                <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
                            </div>

                            {isMatching && (
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 max-w-sm mx-auto">
                                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                                    <span className="text-sm font-medium text-primary">Matching faces in browser...</span>
                                </div>
                            )}

                            {matchResult && !isMatching && (
                                <div className={`p-6 rounded-lg border-2 max-w-sm mx-auto ${matchResult.match
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-destructive/10 border-destructive/20'
                                    }`}>
                                    {matchResult.match ? (
                                        <>
                                            <div className="text-4xl mb-2">✅</div>
                                            <p className="text-lg font-bold text-green-700 mb-2">Face Match Successful!</p>
                                            <p className="text-sm text-green-600">
                                                Confidence: {matchResult.confidence}%
                                            </p>
                                            {matchResult.method && (
                                                <p className="text-xs text-green-500 mt-1">
                                                    Method: {matchResult.method}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-4xl mb-2">❌</div>
                                            <p className="text-lg font-bold text-destructive mb-2">Face Match Failed</p>
                                            <p className="text-sm text-destructive/80">
                                                {matchResult.error || 'The selfie does not match your passport photo. Please try again.'}
                                            </p>
                                            {matchResult.confidence !== undefined && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Confidence: {matchResult.confidence}%
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-4 max-w-sm mx-auto pt-4 border-t border-border">
                                <button onClick={handleRetake} className="flex-1 py-3 border-2 border-border text-muted-foreground font-bold rounded-lg hover:bg-muted/50 transition-colors">
                                    Retake
                                </button>
                                <button
                                    onClick={handleProceed}
                                    disabled={!matchResult?.match}
                                    className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-transform ${matchResult?.match
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {!capturedImage && (
                        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                            <p className="text-sm font-semibold text-primary mb-2">📝 Tips for a great selfie:</p>
                            <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                                <li>Ensure good lighting on your face</li>
                                <li>Look directly at the camera</li>
                                <li>Keep a neutral expression</li>
                                <li>Remove glasses/hats if possible</li>
                                <li>Match the pose from your passport photo</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default CaptureSelfie;
