import { React, useState, useEffect } from 'react';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [timer, setTimer] = useState(0);
  const [expired, setExpired] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setSubmittedEmail(storedEmail);
      startResendTimer();
    }
  }, []); 

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (submittedEmail && timer === 0 && !resending) {
      setExpired(true);
      setMessage('The code has expired. Please request a new one.');
    }
  }, [timer, submittedEmail, resending]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!otp) {
      return setMessage('Please enter the verification code.');
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/verify-otp', { email: submittedEmail, otp });
      const successMsg = res.data.message || 'OTP verified!';
      setMessage(successMsg);
      if (successMsg === 'OTP verified successfully.') {
        setTimer(null); 
        setExpired(false);
      }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Verification failed';
        setMessage(errorMsg);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const resendOTP = async (targetEmail) => {
    try {
      setResending(true);
      setMessage('');
      const res = await axios.post('http://localhost:3000/api/auth/send-otp', {
        email: targetEmail,
      });
      setSubmittedEmail(targetEmail);
      setOtp('');
      setMessage(res.data.message || 'New OTP sent!');
      startResendTimer();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const startResendTimer = () => {
    setTimer(60);
    setExpired(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-6">
        {!submittedEmail ? (
          <p className="text-center text-gray-600">
            Please submit your email first.
          </p>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Check your email</h2>
            <p className="text-center text-gray-600">
              Enter the verification code sent to <strong>{submittedEmail}</strong>
            </p>
            <input
              type="text"
              placeholder="Enter code"
              className="w-full px-4 py-2 border rounded-md text-center tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />

            <div className="text-center text-sm">
              Didn’t get a code?{' '}
              <button
                type="button"
                onClick={() => resendOTP(submittedEmail)}
                className="text-blue-600 hover:underline inline"
                disabled={resending}
              >
                Resend
              </button>
              {timer > 0 && (
                <span className="text-gray-500 inline-block ml-1">
                  - {formatTime(timer)}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
              disabled={resending}
            >
              Verify Email
            </button>
          </form>
        )}

        {message && (
          <p className="text-center text-sm text-gray-700 border-t pt-4">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;