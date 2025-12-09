import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StartKYC from './pages/StartKYC';
import BasicDetails from './pages/BasicDetails';
import SelectDocument from './pages/SelectDocument';
import ScanDocument from './pages/ScanDocument';
import SelectAddress from './pages/SelectAddress';
import UploadDocument from './pages/UploadDocument';
import UploadPassportPhoto from './pages/UploadPassportPhoto';
import CaptureSelfie from './pages/CaptureSelfie';
import PreviewSubmit from './pages/PreviewSubmit';
import Status from './pages/Status';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/start" replace />} />
          <Route path="/start" element={<StartKYC />} />
          <Route path="/basic-details" element={<BasicDetails />} />
          <Route path="/select-doc" element={<SelectDocument />} />
          <Route path="/scan" element={<ScanDocument />} />
          <Route path="/select-address" element={<SelectAddress />} />
          <Route path="/upload-doc" element={<UploadDocument />} />
          <Route path="/upload-passport-photo" element={<UploadPassportPhoto />} />
          <Route path="/selfie" element={<CaptureSelfie />} />
          <Route path="/preview" element={<PreviewSubmit />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
