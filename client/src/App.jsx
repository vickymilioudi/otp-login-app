import { Routes, Route, Navigate } from 'react-router-dom';
import SendOTP from './pages/SendOTP';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <Routes>
      <Route path="/" element={<SendOTP />} />     
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;