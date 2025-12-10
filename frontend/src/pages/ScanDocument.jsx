import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKYC } from '../context/KYCContext';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const ScanDocument = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setIdData, setAddressData, personalInfo } = useKYC();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const { proofCategory, documentType } = location.state || {};

    const [capturedImage, setCapturedImage] = useState(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [uploadMode, setUploadMode] = useState(null);
    const [stream, setStream] = useState(null);
    const [qualityErrors, setQualityErrors] = useState([]);
    const [isQualityCheckPassed, setIsQualityCheckPassed] = useState(false);
    const [isOcrValidating, setIsOcrValidating] = useState(false);
    const [ocrError, setOcrError] = useState(null);
    const [isDocumentValid, setIsDocumentValid] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordAttempt, setPasswordAttempt] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [pendingPdfFile, setPendingPdfFile] = useState(null);

    // Determine current step based on proof category
    const currentStep = proofCategory === 'ID' ? 2 : 3;

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Helper: Rotate Image
    const rotateImage = (src, degrees) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (degrees === 90 || degrees === 270) {
                    canvas.width = img.height;
                    canvas.height = img.width;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(degrees * Math.PI / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.src = src;
        });
    };

    // Helper: Extract and validate passport expiry date
    const validatePassportExpiry = (text) => {
        try {
            console.log('🔍 Checking passport expiry date...');

            // Common date formats in passports
            // Format 1: DD MMM YYYY (e.g., 15 JAN 2030)
            // Format 2: DD/MM/YYYY or DD-MM-YYYY
            // Format 3: DDMMMYYYY (e.g., 15JAN2030)

            const datePatterns = [
                /(\d{2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*(\d{4})/i,
                /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/,
                /(\d{2})(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(\d{4})/i
            ];

            const monthMap = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
            };

            let expiryDate = null;

            // Try to find expiry date
            for (const pattern of datePatterns) {
                const matches = text.match(pattern);
                if (matches) {
                    let day, month, year;

                    if (pattern.source.includes('JAN|FEB')) {
                        // Month name format
                        day = parseInt(matches[1]);
                        month = monthMap[matches[2].toUpperCase()];
                        year = parseInt(matches[3]);
                    } else {
                        // Numeric format
                        day = parseInt(matches[1]);
                        month = parseInt(matches[2]) - 1; // JS months are 0-indexed
                        year = parseInt(matches[3]);
                    }

                    expiryDate = new Date(year, month, day);
                    console.log('📅 Found expiry date:', expiryDate.toDateString());
                    break;
                }
            }

            if (!expiryDate) {
                console.log('⚠️ Could not extract expiry date from passport');
                return {
                    valid: false,
                    error: 'Could not read passport expiry date. Please ensure the document is clear and try again.'
                };
            }

            // Calculate 6 months from today
            const today = new Date();
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(today.getMonth() + 6);

            console.log('📊 Validation check:');
            console.log('   Today:', today.toDateString());
            console.log('   6 months from now:', sixMonthsFromNow.toDateString());
            console.log('   Passport expires:', expiryDate.toDateString());

            // Check if passport is already expired
            if (expiryDate < today) {
                return {
                    valid: false,
                    error: `Passport has expired on ${expiryDate.toLocaleDateString()}. Please use a valid passport.`
                };
            }

            // Check if passport has at least 6 months validity
            if (expiryDate < sixMonthsFromNow) {
                const monthsRemaining = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24 * 30));
                return {
                    valid: false,
                    error: `Passport expires in ${monthsRemaining} month(s) on ${expiryDate.toLocaleDateString()}. Minimum 6 months validity required.`
                };
            }

            console.log('✅ Passport has sufficient validity');
            return {
                valid: true,
                expiryDate: expiryDate.toLocaleDateString()
            };

        } catch (error) {
            console.error('Error validating passport expiry:', error);
            return {
                valid: false,
                error: 'Error validating passport expiry date. Please try again.'
            };
        }
    };

    // Helper: Validate Content
    const checkContentValidity = (text) => {
        let isValid = false;
        let errorMessage = null;

        if (documentType === "PAN Card") {
            const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]/;
            const cleanText = text.replace(/\s/g, '');
            const hasPanNumber = panRegex.test(text) || panRegex.test(cleanText);

            const upperText = text.toUpperCase();
            const hasKeywords = upperText.includes("INCOME TAX") ||
                upperText.includes("PERMANENT ACCOUNT") ||
                upperText.includes("GOVT OF INDIA");

            isValid = hasPanNumber || hasKeywords;
            if (!isValid) errorMessage = "This does not appear to be a PAN card.";
        } else if (documentType === "Aadhaar Card") {
            const aadhaarRegex1 = /\b\d{12}\b/;
            isValid = true;
        }

        // Name Matching Logic
        if (isValid && personalInfo?.fullName) {
            const nameParts = personalInfo.fullName.trim().toLowerCase().split(/\s+/);
            const ocrTextLower = text.toLowerCase();
            const firstName = nameParts[0];

            const isFirstNamePresent = ocrTextLower.includes(firstName);

            if (!isFirstNamePresent) {
                isValid = false;
                errorMessage = `Name mismatch: Could not find "${firstName}" in the document.`;
            }
        }

        return { isValid, errorMessage };
    };

    const checkImageQuality = (imageDataUrl, isPdfSource = false) => {
        return new Promise((resolve) => {
            const errors = [];
            const img = new Image();

            img.onload = () => {
                if (img.width < 600 || img.height < 400) {
                    errors.push('Image resolution is too low, please retake.');
                }

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    let totalBrightness = 0;
                    for (let i = 0; i < data.length; i += 4) {
                        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
                    }
                    const avgBrightness = totalBrightness / (data.length / 4);

                    console.log('📊 Image quality check:', { avgBrightness, isPdfSource });

                    // More lenient thresholds for PDF documents (they often have white backgrounds)
                    if (avgBrightness < 50) {
                        errors.push('Low lighting detected. Please capture again.');
                    } else if (!isPdfSource && avgBrightness > 200) {
                        // Only check for too bright if it's NOT from a PDF
                        errors.push('Image too bright/glare visible. Retake.');
                    }
                } catch (error) {
                    console.error('Quality check error:', error);
                }

                resolve(errors);
            };

            img.src = imageDataUrl;
        });
    };

    const validateDocumentWithOCR = async (originalImage) => {
        setIsOcrValidating(true);
        setOcrError(null);
        setIsDocumentValid(false);

        const rotations = [0, 90, 270, 180];

        try {
            for (const angle of rotations) {
                let currentImage = originalImage;

                if (angle !== 0) {
                    currentImage = await rotateImage(originalImage, angle);
                }

                const { data: { text } } = await Tesseract.recognize(currentImage, 'eng');
                console.log(`📝 Extracted text (${angle}°):`, text);

                const { isValid, errorMessage } = checkContentValidity(text);

                if (isValid) {
                    setIsDocumentValid(true);
                    setOcrError(null);

                    if (angle !== 0) {
                        setCapturedImage(currentImage);
                    }
                    return;
                } else {
                    if (angle === 180) {
                        setOcrError(errorMessage || "Validation failed. Please ensure the document is clear.");
                    }
                }
            }

            setIsDocumentValid(false);

        } catch (error) {
            console.error('OCR validation error:', error);
            setOcrError("Unable to validate document. Please try again.");
            setIsDocumentValid(false);
        } finally {
            setIsOcrValidating(false);
        }
    };

    const processPDF = async (file, password = null) => {
        console.log("📄 Processing PDF...", { fileName: file.name, hasPassword: !!password });

        try {
            const arrayBuffer = await file.arrayBuffer();
            console.log("✅ PDF file read successfully, size:", arrayBuffer.byteLength);

            const params = { data: arrayBuffer };
            if (password) {
                console.log("🔑 Using provided password");
                params.password = password;
            }

            const loadingTask = pdfjsLib.getDocument(params);

            loadingTask.onPassword = (updatePassword, reason) => {
                console.log("🔐 onPassword callback triggered, reason:", reason);
                if (reason === 1) {
                    setPasswordError("Incorrect password. Please try again.");
                } else {
                    setPasswordError("");
                }
                setPendingPdfFile(file);
                setShowPasswordModal(true);
                loadingTask.destroy();
            };

            console.log("⏳ Loading PDF document...");
            const pdf = await loadingTask.promise;
            console.log("✅ PDF loaded successfully, pages:", pdf.numPages);

            const page = await pdf.getPage(1);
            console.log("✅ First page retrieved");

            const viewport = page.getViewport({ scale: 3.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            console.log("🎨 Rendering PDF to canvas...");
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            console.log("✅ PDF rendered successfully");

            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

            setCapturedImage(imageDataUrl);
            setUploadMode('upload');

            const errors = await checkImageQuality(imageDataUrl, true);
            setQualityErrors(errors);
            setIsQualityCheckPassed(errors.length === 0);

            if (errors.length === 0) {
                await validateDocumentWithOCR(imageDataUrl);
            }

        } catch (error) {
            console.error("❌ Error processing PDF:", error);
            console.log("Error details:", {
                name: error.name,
                message: error.message,
                code: error.code
            });

            if (error.name === 'PasswordException' || error.message?.includes('password')) {
                console.log("🔐 Detected password-protected PDF");
                setPendingPdfFile(file);
                setPasswordError("");
                setShowPasswordModal(true);
            } else if (error.message?.includes('cancel') || error.message?.includes('destroy')) {
                console.log("ℹ️ PDF loading was cancelled");
            } else {
                console.error("❌ Unexpected error:", error);
                window.alert("Failed to process PDF file. Please try uploading an image (JPG/PNG) instead.");
            }
        }
    };

    const handlePasswordSubmit = async () => {
        if (!passwordAttempt.trim()) {
            setPasswordError("Please enter a password");
            return;
        }

        setShowPasswordModal(false);
        const pwd = passwordAttempt;
        setPasswordAttempt('');
        setPasswordError('');

        if (pendingPdfFile) {
            await processPDF(pendingPdfFile, pwd);
            setPendingPdfFile(null);
        }
    };

    const handlePasswordCancel = () => {
        setShowPasswordModal(false);
        setPasswordAttempt('');
        setPasswordError('');
        setPendingPdfFile(null);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type === 'application/pdf') {
            await processPDF(file);
        }
        else if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target.result;
                setCapturedImage(imageData);
                setUploadMode('upload');

                const errors = await checkImageQuality(imageData);
                setQualityErrors(errors);
                setIsQualityCheckPassed(errors.length === 0);

                if (errors.length === 0) {
                    await validateDocumentWithOCR(imageData);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const startWebcam = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsWebcamActive(true);
            setUploadMode('webcam');
            setCapturedImage(null);
        } catch (err) {
            alert('Unable to access webcam.');
        }
    };

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataUrl);

            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
            setIsWebcamActive(false);

            const errors = await checkImageQuality(imageDataUrl);
            setQualityErrors(errors);
            setIsQualityCheckPassed(errors.length === 0);

            if (errors.length === 0) {
                await validateDocumentWithOCR(imageDataUrl);
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setUploadMode(null);
        setQualityErrors([]);
        setIsQualityCheckPassed(false);
        setOcrError(null);
        setIsDocumentValid(false);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsWebcamActive(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleProceed = () => {
        if (!capturedImage || !isQualityCheckPassed || !isDocumentValid) return;

        if (proofCategory === 'ID') {
            setIdData({ proofType: documentType, image: capturedImage });
            navigate('/select-address');
        } else if (proofCategory === 'ADDRESS') {
            setAddressData({ proofType: documentType, image: capturedImage });
            navigate('/upload-passport-photo');
        }
    };

    const isPDF = capturedImage && capturedImage.startsWith('data:application/pdf');
    const canProceed = capturedImage && isQualityCheckPassed && (isPDF || isDocumentValid);

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={currentStep} totalSteps={5} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Upload {documentType}</h2>
                    <p className="text-muted-foreground mb-4">Please upload a clear copy of your {documentType}.</p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="mb-6 px-6 py-2 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors inline-flex items-center gap-2"
                    >
                        ← Back
                    </button>


                    {!uploadMode && !capturedImage && (
                        <div className="space-y-6">
                            <div className="bg-muted/50 p-6 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer text-center"
                                onClick={() => fileInputRef.current?.click()}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-12 h-12 mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    <p className="mb-2 text-sm text-foreground font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, PDF (Max 5MB)</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileUpload} className="hidden" />
                            </div>

                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">OR</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>

                            <button
                                onClick={startWebcam}
                                className="w-full py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                                Use Webcam
                            </button>
                        </div>
                    )}

                    {isWebcamActive && !capturedImage && (
                        <div className="space-y-4">
                            <div className="relative rounded-lg overflow-hidden border-4 border-primary bg-black aspect-video">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                            </div>
                            <button onClick={capturePhoto} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-md">
                                📸 Capture Photo
                            </button>
                        </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />

                    {capturedImage && (
                        <div className="space-y-6">
                            <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                <p className="text-sm font-semibold text-foreground mb-3">Preview:</p>
                                {isPDF ? (
                                    <div className="p-8 bg-card border-2 border-border rounded-lg text-center">
                                        <div className="text-4xl mb-2">📄</div>
                                        <p className="font-medium">PDF Document Ready</p>
                                    </div>
                                ) : (
                                    <img src={capturedImage} alt="Captured" className="w-full rounded-lg border border-border shadow-sm" />
                                )}
                            </div>

                            <div className="space-y-3">
                                {qualityErrors.length > 0 && (
                                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <p className="text-sm font-bold text-destructive mb-1">⚠️ Quality Issues:</p>
                                        <ul className="list-disc list-inside text-sm text-destructive/80">
                                            {qualityErrors.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {isOcrValidating && (
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3">
                                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                                        <span className="text-sm font-medium text-primary">Validating document...</span>
                                    </div>
                                )}

                                {ocrError && (
                                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                        <p className="text-sm font-bold text-destructive">❌ Validation Failed</p>
                                        <p className="text-sm text-destructive/80 mt-1">{ocrError}</p>
                                    </div>
                                )}

                                {isQualityCheckPassed && isDocumentValid && !isPDF && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm font-bold text-green-700">✅ Document Verified Successfully</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border">
                                <button onClick={handleRetake} className="flex-1 py-3 border-2 border-border text-muted-foreground font-bold rounded-lg hover:bg-muted/50 transition-colors">
                                    Retake
                                </button>
                                <button
                                    onClick={handleProceed}
                                    disabled={!canProceed || isOcrValidating}
                                    className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all ${canProceed && !isOcrValidating
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                >
                                    Confirm & Proceed
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-2xl border border-border max-w-md w-full p-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Password Protected PDF</h3>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                            This PDF is password protected. For e-Aadhaar, the password is usually:
                        </p>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-primary">
                                First 4 letters of your name (CAPS) + Year of Birth (YYYY)
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Example: If name is "Rahul" and DOB is 15/03/1990, password is "RAHU1990"
                            </p>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive">{passwordError}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Enter Password</label>
                            <input
                                type="password"
                                value={passwordAttempt}
                                onChange={(e) => setPasswordAttempt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                                placeholder="e.g., RAHU1990"
                                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePasswordCancel}
                                className="flex-1 py-3 border-2 border-border text-muted-foreground font-bold rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Unlock PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ScanDocument;
