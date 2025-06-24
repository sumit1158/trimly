import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Clock, Phone, Mail, Building } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    closed: boolean;
  };
}

const ShopSettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    description: '',
    workingHours: {
      monday: { start: '09:00', end: '17:00', closed: false },
      tuesday: { start: '09:00', end: '17:00', closed: false },
      wednesday: { start: '09:00', end: '17:00', closed: false },
      thursday: { start: '09:00', end: '17:00', closed: false },
      friday: { start: '09:00', end: '17:00', closed: false },
      saturday: { start: '09:00', end: '17:00', closed: false },
      sunday: { start: '09:00', end: '17:00', closed: true },
    } as WorkingHours,
    acceptsWalkins: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        shopName: user.shopName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        },
        description: user.description || '',
        workingHours: user.workingHours || formData.workingHours,
        acceptsWalkins: user.acceptsWalkins || false,
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWorkingHoursChange = (day: string, field: 'start' | 'end' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error('User not found');
      return;
    }
    
    setIsLoading(true);

    try {
      await updateProfile(user._id, formData);
      toast.success('Shop settings updated successfully');
    } catch (error) {
      console.error('Error updating shop settings:', error);
      toast.error('Failed to update shop settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Shop Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Shop Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                State
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                ZIP Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Working Hours</h2>
          <div className="space-y-4">
            {Object.entries(formData.workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-24 font-medium capitalize">{day}</div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                    className="mr-2"
                  />
                  Closed
                </label>
                {!hours.closed && (
                  <>
                    <input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="input w-auto"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="input w-auto"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="card">
          <h2 className="mb-4 text-xl font-semibold">Additional Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Shop Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input"
                rows={4}
                placeholder="Tell customers about your shop..."
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.acceptsWalkins}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptsWalkins: e.target.checked }))}
                  className="mr-2"
                />
                <span>Accept walk-in customers</span>
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isLoading}
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default ShopSettingsPage; 