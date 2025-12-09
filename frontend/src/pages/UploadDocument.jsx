import React from 'react';
import { useNavigate } from 'react-router-dom';

const UploadDocument = () => {
    const navigate = useNavigate();

    const handleNext = () => {
        navigate('/selfie');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold mb-8">Upload Document Page</h1>
            <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Next
            </button>
        </div>
    );
};

export default UploadDocument;
