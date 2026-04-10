import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

interface OTPProps {
  onVerify: () => void;
  onBack: () => void;
}

export default function OTP({ onVerify, onBack }: OTPProps) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-5">
      <div className="mt-6 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">OTP Verification</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Enter the 4-digit code sent to your mobile number <span className="font-bold text-gray-900">+880 1712-345678</span>
        </p>
      </div>

      <div className="flex justify-between mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="number"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 bg-gray-50 border-2 border-transparent rounded-xl text-center text-xl font-bold text-gray-900 focus:border-[#e53935] focus:bg-white transition-all"
          />
        ))}
      </div>

      <div className="flex-1">
        <button
          onClick={onVerify}
          disabled={otp.some(d => d === '')}
          className="w-full bg-[#e53935] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          Verify
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code?{" "}
            <button className="font-bold text-[#e53935] hover:underline">
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
