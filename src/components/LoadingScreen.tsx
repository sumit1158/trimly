import React from 'react';
import { Scissors } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/10 p-3 text-primary dark:bg-primary/20">
          <Scissors size={32} className="animate-[spin_3s_linear_infinite] rotate-45" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">TRIMLY</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;