import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const CustomerProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      await updateProfile(user._id, formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    try {
      setIsPasswordLoading(true);
      await changePassword(user._id, passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
      console.error('Password change error:', error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>

        <div className="mb-6 flex flex-col items-center">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/150'}
            alt="Profile Avatar"
            className="mb-4 h-24 w-24 rounded-full object-cover shadow-md"
          />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {user?.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="(123) 456-7890"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Your location"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="outline"
                  loading={isPasswordLoading}
                >
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfilePage;