import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
        <Scissors size={18} className="rotate-45" />
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">TRIMLY</span>
    </Link>
  );
};

export default Logo;