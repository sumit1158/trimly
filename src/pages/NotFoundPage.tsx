import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-2 text-9xl font-bold text-primary">404</h1>
      <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
        <Button
          variant="primary"
          leftIcon={<HomeIcon size={18} />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
        <Link to="/">
          <Button
            variant="outline"
            leftIcon={<ArrowLeft size={18} />}
          >
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;