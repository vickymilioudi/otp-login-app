import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SendOTP = (l) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/send-otp', { email });
      const { success, message } = res.data;

      if (success) {
        console.log('Before navigate, email:', email);
        localStorage.setItem('email', email);
        navigate('/verify-otp');
        console.log('After navigate');  
      } else {
        setMessage(message || 'Something went wrong. Try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setMessage(err.response?.data?.message || 'Could not send the code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Log In</h1>
        <p className="text-center text-gray-500 mb-4">
          Enter your email to receive a login code.
        </p>

        <form onSubmit={handleSendOTP} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Send OTP
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SendOTP;