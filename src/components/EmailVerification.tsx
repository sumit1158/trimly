import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => Promise<void>;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onResendVerification }) => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await onResendVerification();
      toast.success('Verification email resent successfully!');
    } catch (error) {
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 dark:bg-primary/20">
            <Mail size={48} className="text-primary" />
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Verify your email
        </h1>

        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We've sent a verification email to <span className="font-medium">{email}</span>.
          Please check your inbox and click the verification link to activate your account.
        </p>

        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={handleResendVerification}
            loading={isResending}
            className="w-full"
          >
            Resend verification email
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to login
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Didn't receive the email? Check your spam folder or try a different email address.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification; 