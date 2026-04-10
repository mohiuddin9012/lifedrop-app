import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldCheck, Users, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: "Find Donors",
    description: "Search for blood donors near your location and contact them instantly.",
    icon: <Users size={64} className="text-[#e53935]" />,
    color: "bg-red-50"
  },
  {
    title: "Emergency Request",
    description: "Post an emergency blood request and get notified when someone accepts.",
    icon: <Heart size={64} className="text-[#e53935]" />,
    color: "bg-red-50"
  },
  {
    title: "Safe & Secure",
    description: "Your data is safe with us. We ensure verified donors for your safety.",
    icon: <ShieldCheck size={64} className="text-[#e53935]" />,
    color: "bg-red-50"
  }
];

export default function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-5">
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-40 h-40 ${steps[currentStep].color} rounded-full flex items-center justify-center mb-10`}>
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{steps[currentStep].title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center pb-6">
        <div className="flex space-x-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-6 bg-[#e53935]" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full bg-[#e53935] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
