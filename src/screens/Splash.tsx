import { motion } from 'motion/react';
import { Droplet } from 'lucide-react';

export default function Splash() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="relative"
      >
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <Droplet size={48} className="text-[#e53935] fill-[#e53935]" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-6 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">LifeDrop</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Donate Blood, Save Lives</p>
      </motion.div>

      <div className="absolute bottom-10">
        <div className="flex space-x-1">
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#e53935] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#e53935] rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-[#e53935] rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
