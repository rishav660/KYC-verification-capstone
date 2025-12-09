import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../context/KYCContext';
import { HeaderBanner } from '../components/HeaderBanner';
import { ProgressBar } from '../components/ProgressBar';

const BasicDetails = () => {
    const navigate = useNavigate();
    const { personalInfo, setPersonalInfo } = useKYC();
    const [formData, setFormData] = useState(personalInfo);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone Number is required";
        } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
            newErrors.phoneNumber = "Enter a valid 10-digit phone number";
        }
        if (!formData.dob) newErrors.dob = "Date of Birth is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validate()) {
            setPersonalInfo(formData);
            navigate('/select-doc');
        }
    };

    return (
        <main className="min-h-screen bg-background font-sans text-foreground">
            <HeaderBanner />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProgressBar currentStep={1} totalSteps={5} />

                <div className="bg-card rounded-xl shadow-lg border border-border p-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-primary mb-2">Personal Information</h2>
                    <p className="text-muted-foreground mb-8">Please provide your basic details as per your official documents.</p>

                    <form onSubmit={handleNext} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">
                                Full Name <span className="text-accent">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g. Rahul Kumar"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-input text-foreground transition-colors ${errors.fullName
                                        ? 'border-destructive focus:border-destructive'
                                        : 'border-border focus:border-primary'
                                    }`}
                            />
                            {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Email & Phone Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Email Address <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your.email@example.com"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-input text-foreground transition-colors ${errors.email
                                            ? 'border-destructive focus:border-destructive'
                                            : 'border-border focus:border-primary'
                                        }`}
                                />
                                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Phone Number <span className="text-accent">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-muted-foreground font-medium">+91</span>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="98765 43210"
                                        maxLength="10"
                                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:outline-none bg-input text-foreground transition-colors ${errors.phoneNumber
                                                ? 'border-destructive focus:border-destructive'
                                                : 'border-border focus:border-primary'
                                            }`}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>}
                            </div>
                        </div>

                        {/* DOB & Gender Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Date of Birth <span className="text-accent">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none bg-input text-foreground transition-colors ${errors.dob
                                            ? 'border-destructive focus:border-destructive'
                                            : 'border-border focus:border-primary'
                                        }`}
                                />
                                {errors.dob && <p className="text-xs text-destructive mt-1">{errors.dob}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Gender <span className="text-muted-foreground font-normal">(Optional)</span>
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none bg-input text-foreground"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                            <button
                                type="button"
                                onClick={() => navigate('/start')}
                                className="px-6 py-3 border-2 border-border text-muted-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg shadow-md hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200"
                            >
                                Save & Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default BasicDetails;
