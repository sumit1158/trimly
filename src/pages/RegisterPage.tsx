import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Key, Scissors, UserCircle, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultRole = searchParams.get('role') as 'barber' | 'customer' || 'customer';

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    location: '',
    shopName: '',
    experience: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    services: [] as { name: string, duration: number, price: number, description?: string }[],
    workingHours: {
      monday: { start: '09:00', end: '17:00', closed: false },
      tuesday: { start: '09:00', end: '17:00', closed: false },
      wednesday: { start: '09:00', end: '17:00', closed: false },
      thursday: { start: '09:00', end: '17:00', closed: false },
      friday: { start: '09:00', end: '17:00', closed: false },
      saturday: { start: '09:00', end: '17:00', closed: false },
      sunday: { start: '09:00', end: '17:00', closed: true },
    },
    specialties: [] as string[],
    description: '',
    acceptsWalkins: false,
    avatar: undefined as string | undefined
  });

  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const availableServices = [
    'Haircut',
    'Beard Trim',
    'Hot Towel Shave',
    'Hair Coloring',
    'Kids Haircut',
    'Hair Styling',
    'Facial',
    'Head Massage',
  ];

  const specialties = [
    'Classic Cuts',
    'Modern Styles',
    'Fades',
    'Ethnic Hair',
    'Beard Grooming',
    'Hair Restoration',
    'Color Specialist',
    'Traditional Barbering',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleServiceToggle = (serviceName: string) => {
    setFormData(prev => {
      const isSelected = prev.services.some(s => s.name === serviceName);
      if (isSelected) {
        return {
          ...prev,
          services: prev.services.filter(s => s.name !== serviceName)
        };
      } else {
        const newService = { name: serviceName, duration: 30, price: 0 };
        return {
          ...prev,
          services: [...prev.services, newService]
        };
      }
    });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleWorkingHoursChange = (day: keyof typeof formData.workingHours, field: 'start' | 'end' | 'closed', value: string | boolean) => {
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

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone || !formData.location) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!isValidEmail(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(formData.phone)) {
          toast.error('Please enter a valid phone number');
          return false;
        }
        return true;

      case 2:
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return false;
        }
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters long');
          return false;
        }
        return true;

      case 3:
        if (formData.role === 'barber') {
          if (!formData.shopName || !formData.phone || !formData.address) {
            toast.error('Please fill in all required fields');
            return false;
          }
          if (formData.services.length === 0) {
            toast.error('Please select at least one service');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { password, confirmPassword, ...registrationData } = formData;
      
      // Generate a random avatar for the user
      const randomAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}&backgroundColor=007bff,64b5f6,2196f3,03a9f4,8bc34a,4caf50,ff9800,ff5722&backgroundType=gradientLinear,solid&radius=50`;
      registrationData.avatar = randomAvatar;

      // Removed: Get coordinates from address if it's a barber
      // if (formData.role === 'barber' && formData.address) {
      //   try {
      //     const address = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      //     const response = await fetch(
      //       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      //     );
      //     const data = await response.json();
      //     
      //     if (data && data[0]) {
      //       registrationData.coordinates = {
      //         lat: parseFloat(data[0].lat),
      //         lng: parseFloat(data[0].lon)
      //       };
      //     }
      //   } catch (error) {
      //     console.error('Error getting coordinates:', error);
      //   }
      // }
      
      await register(formData.email, formData.password, formData.name, formData.role, registrationData);
      
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                  className={`flex flex-col items-center rounded-lg p-4 transition ${
                    formData.role === 'customer'
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserCircle size={24} className="mb-2" />
                  <span className="text-sm font-medium">Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'barber' }))}
                  className={`flex flex-col items-center rounded-lg p-4 transition ${
                    formData.role === 'barber'
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Scissors size={24} className="mb-2" />
                  <span className="text-sm font-medium">Barber</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={16} className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Phone Number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="(123) 456-7890"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Location
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin size={16} className="text-gray-400" />
                </div>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Your city or area"
                  required
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </>
        );

      case 3:
        return formData.role === 'barber' ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="shopName" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Shop Name
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Your Barbershop Name"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input pl-10"
                    placeholder="123 Barber Street"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="State"
                  required
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="12345"
                  required
                />
              </div>

              <div>
                <label htmlFor="experience" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Years of Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="5"
                  min="0"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Services Offered
                </label>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {availableServices.map((service) => (
                    <label
                      key={service}
                      className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                        formData.services.some(s => s.name === service)
                          ? 'border-primary bg-primary/5 text-primary dark:border-primary-light dark:bg-primary/10'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.services.some(s => s.name === service)}
                        onChange={() => handleServiceToggle(service)}
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Specialties
                </label>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {specialties.map((specialty) => (
                    <label
                      key={specialty}
                      className={`flex cursor-pointer items-center rounded-lg border p-3 transition-colors ${
                        formData.specialties.includes(specialty)
                          ? 'border-primary bg-primary/5 text-primary dark:border-primary-light dark:bg-primary/10'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleSpecialtyToggle(specialty)}
                      />
                      {specialty}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Shop Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input"
                  rows={4}
                  placeholder="Tell us about your barbershop..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
                  Working Hours
                </label>
                <div className="space-y-3">
                  {Object.entries(formData.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24 font-medium capitalize">{day}</div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={(e) => handleWorkingHoursChange(day as keyof typeof formData.workingHours, 'closed', e.target.checked)}
                          className="mr-2"
                        />
                        Closed
                      </label>
                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.start}
                            onChange={(e) => handleWorkingHoursChange(day as keyof typeof formData.workingHours, 'start', e.target.value)}
                            className="input w-auto"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.end}
                            onChange={(e) => handleWorkingHoursChange(day as keyof typeof formData.workingHours, 'end', e.target.value)}
                            className="input w-auto"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="acceptsWalkins"
                    checked={formData.acceptsWalkins}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Accept walk-in customers
                  </span>
                </label>
              </div>
            </div>
          </>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join TRIMLY and {formData.role === 'barber' ? 'grow your barbershop business' : 'find great barbers near you'}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-center">
            <div className="flex w-full max-w-xs items-center">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      step <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 flex-1 ${
                        step < currentStep
                          ? 'bg-primary'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderStepContent()}

            <div className="flex space-x-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex-1 py-2.5"
                >
                  Back
                </Button>
              )}
              {currentStep < (formData.role === 'barber' ? 3 : 2) ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                  className="flex-1 py-2.5"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  className="flex-1 py-2.5"
                >
                  Create Account
                </Button>
              )}
            </div>

            {currentStep === 2 && (
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-light">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary-light">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;