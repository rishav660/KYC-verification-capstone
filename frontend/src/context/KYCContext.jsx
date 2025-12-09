import { createContext, useContext, useState, useEffect } from "react";

const KYCContext = createContext();

// Helper functions for localStorage
const loadFromStorage = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

export function KYCProvider({ children }) {
    // Load initial state from localStorage
    const [personalInfo, setPersonalInfoState] = useState(() =>
        loadFromStorage('kyc_personalInfo', {
            fullName: "",
            email: "",
            phoneNumber: "",
            dob: "",
            gender: ""
        })
    );

    const [idData, setIdDataState] = useState(() =>
        loadFromStorage('kyc_idData', {
            proofType: "",
            image: "",
        })
    );

    const [addressData, setAddressDataState] = useState(() =>
        loadFromStorage('kyc_addressData', {
            proofType: "",
            image: "",
        })
    );

    const [selfieData, setSelfieDataState] = useState(() =>
        loadFromStorage('kyc_selfieData', "")
    );

    const [passportPhoto, setPassportPhotoState] = useState(() =>
        loadFromStorage('kyc_passportPhoto', "")
    );

    // Wrapper functions that save to localStorage
    const setPersonalInfo = (data) => {
        setPersonalInfoState(data);
        saveToStorage('kyc_personalInfo', data);
    };

    const setIdData = (data) => {
        setIdDataState(data);
        saveToStorage('kyc_idData', data);
    };

    const setAddressData = (data) => {
        setAddressDataState(data);
        saveToStorage('kyc_addressData', data);
    };

    const setSelfieData = (data) => {
        setSelfieDataState(data);
        saveToStorage('kyc_selfieData', data);
    };

    const setPassportPhoto = (data) => {
        setPassportPhotoState(data);
        saveToStorage('kyc_passportPhoto', data);
    };

    // Clear all KYC data (useful after submission)
    const clearKYCData = () => {
        localStorage.removeItem('kyc_personalInfo');
        localStorage.removeItem('kyc_idData');
        localStorage.removeItem('kyc_addressData');
        localStorage.removeItem('kyc_selfieData');
        localStorage.removeItem('kyc_passportPhoto');

        setPersonalInfoState({
            fullName: "",
            email: "",
            phoneNumber: "",
            dob: "",
            gender: ""
        });
        setIdDataState({ proofType: "", image: "" });
        setAddressDataState({ proofType: "", image: "" });
        setSelfieDataState("");
        setPassportPhotoState("");
    };

    return (
        <KYCContext.Provider
            value={{
                personalInfo,
                setPersonalInfo,
                idData,
                setIdData,
                addressData,
                setAddressData,
                selfieData,
                setSelfieData,
                passportPhoto,
                setPassportPhoto,
                clearKYCData,
            }}
        >
            {children}
        </KYCContext.Provider>
    );
}

export function useKYC() {
    return useContext(KYCContext);
}
