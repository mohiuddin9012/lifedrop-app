import { ChevronLeft, Phone, Lock } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
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
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Enter your mobile number to receive a password reset code.
        </p>
      </div>

      <div className="space-y-5 flex-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-1">Mobile Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone size={16} className="text-gray-400" />
            </div>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
          </div>
        </div>

        <button
          className="w-full bg-[#e53935] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98]"
        >
          Send Code
        </button>
      </div>
    </div>
  );
}
