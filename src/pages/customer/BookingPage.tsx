import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Search } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Barber {
  _id: string;
  name: string;
  shopName: string;
  avatar?: string;
  rating?: number;
  ratingCount?: number;
  location: string;
  services: Array<{
    name: string;
    duration: number | string;
    price: number;
  }>;
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      closed: boolean;
    };
  };
}

interface Appointment {
  _id: string;
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const barberId = searchParams.get('barber');
  const { user } = useAuth();

  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Barber['services'][0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch barbers from the backend
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users?role=barber');
        if (!response.ok) {
          throw new Error('Failed to fetch barbers');
        }
        const data = await response.json();
        setBarbers(data);
        
        // If barberId is provided in URL, select that barber
        if (barberId) {
          const barber = data.find((b: Barber) => b._id === barberId);
          if (barber) {
            setSelectedBarber(barber);
          }
        }
      } catch (error) {
        console.error('Error fetching barbers:', error);
        toast.error('Failed to load barbers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, [barberId]);

  // Fetch booked slots for the selected barber and date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedBarber || !selectedDate) {
        setBookedSlots([]);
        return;
      }
      try {
        const response = await fetch(`/api/appointments/barber/${selectedBarber._id}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        // Only consider appointments for the selected date and with status 'upcoming'
        const slots = data
          .filter((apt: any) => apt.date === selectedDate && apt.status === 'upcoming')
          .map((apt: any) => apt.time);
        setBookedSlots(slots);
      } catch (error) {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedBarber, selectedDate]);

  const getAvailableTimes = (barber: Barber, date: string) => {
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = barber.workingHours[day];
    
    if (!workingHours || workingHours.closed) {
      return [];
    }

    const times = [];
    const start = new Date(`2000-01-01T${workingHours.start}`);
    const end = new Date(`2000-01-01T${workingHours.end}`);
    
    // Generate 30-minute interval ranges
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      if (slotEnd > end) break;
      const format = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const slot = `${format(slotStart)}-${format(slotEnd)}`;
      // Only add slot if not already booked
      if (!bookedSlots.includes(slot)) {
        times.push(slot);
      }
    }

    return times;
  };

  const formatSlot = (slot: string) => {
    if (!slot) return '';
    const [start, end] = slot.split('-');
    const format = (t: string) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return end ? `${format(start)} - ${format(end)}` : format(start);
  };

  const handleBookAppointment = async () => {
    if (!selectedBarber || !selectedService || !selectedDate || !selectedTime) {
      toast.error('Please select all required fields');
      return;
    }

    try {
      const appointment = {
        barberId: selectedBarber._id,
        userId: user?._id,
        barberName: selectedBarber.shopName || selectedBarber.name,
        barberAvatar: selectedBarber.avatar,
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
        status: 'upcoming' as const,
        addToQueue: true
      };

      // Save to backend
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      toast.success('Appointment booked successfully!');
      navigate('/customer/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  // Sort barbers by rating (highest first)
  const sortedBarbers = [...barbers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  // Enhanced search: filter by barber name, shop name, location, or service name
  const filteredBarbers = sortedBarbers.filter(barber =>
    (barber.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (barber.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (barber.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (barber.services && barber.services.some(service => (service.name || '').toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          Book an Appointment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find a barber and schedule your next appointment
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by barber, shop, location, or service..."
            className="input pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Barber Selection */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select a Barber
            </h2>
          </div>
          {isLoading ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading barbers...</p>
            </div>
          ) : filteredBarbers.length > 0 ? (
            <div className="space-y-4">
              {filteredBarbers.map((barber) => (
                <div
                  key={barber._id}
                  className={`card cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    selectedBarber?._id === barber._id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedBarber(barber)}
                >
                  <div className="flex items-center">
                    <img
                      src={barber.avatar || 'https://via.placeholder.com/150'}
                      alt={barber.shopName || barber.name}
                      className="mr-4 h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {barber.shopName || barber.name}
                      </h3>
                      {barber.rating && (
                        <div className="flex items-center text-sm">
                          <div className="flex items-center text-accent">
                            <Star size={14} fill="currentColor" />
                            <span className="ml-1">{barber.rating.toFixed(1)}</span>
                          </div>
                          {barber.ratingCount && (
                            <>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {barber.ratingCount} reviews
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="mr-1" />
                        <span>{barber.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <Search size={48} className="mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No Barbers Found
              </h3>
              <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
                Try adjusting your search to find barbers in your area.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Booking Details
            </h2>

            {selectedBarber ? (
              <div className="space-y-4">
                {/* Service Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Service
                  </label>
                  <div className="space-y-2">
                    {selectedBarber.services.map((service) => (
                      <div
                        key={service.name}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          selectedService?.name === service.name
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {typeof service.duration === 'number' ? `${service.duration} minutes` : service.duration}
                            </p>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Time
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        // Generate all possible slots
                        const day = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        const workingHours = selectedBarber.workingHours[day];
                        if (!workingHours || workingHours.closed) return null;
                        const slots = [];
                        const start = new Date(`2000-01-01T${workingHours.start}`);
                        const end = new Date(`2000-01-01T${workingHours.end}`);
                        for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
                          const slotStart = new Date(time);
                          const slotEnd = new Date(time);
                          slotEnd.setMinutes(slotEnd.getMinutes() + 30);
                          if (slotEnd > end) break;
                          const format = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                          const slot = `${format(slotStart)}-${format(slotEnd)}`;
                          const isBooked = bookedSlots.includes(slot);
                          slots.push(
                            <button
                              key={slot}
                              className={`rounded-lg border p-2 text-sm transition-colors ${
                                selectedTime === slot && !isBooked
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : isBooked
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                              onClick={() => !isBooked && setSelectedTime(slot)}
                              disabled={isBooked}
                            >
                              {formatSlot(slot)}
                            </button>
                          );
                        }
                        return slots;
                      })()}
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleBookAppointment}
                  disabled={!selectedBarber || !selectedService || !selectedDate || !selectedTime}
                >
                  Book Appointment
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400">
                Select a barber to book an appointment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;