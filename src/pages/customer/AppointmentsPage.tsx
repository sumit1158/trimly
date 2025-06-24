import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

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
  createdAt: string;
  rating?: number;
  _ratingValue?: number;
}

type StarRatingProps = {
  value: number;
  onChange: (star: number) => void;
  disabled?: boolean;
};

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, disabled = false }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'} ${disabled ? 'cursor-not-allowed' : 'hover:text-yellow-500'}`}
        onClick={() => !disabled && onChange(star)}
        disabled={disabled}
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        ★
      </button>
    ))}
  </div>
);

const CustomerAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
    }
  }, [user?._id]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://trimly-9iu5.onrender.com/api/appointments/user/${user?._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      const response = await fetch(`https://trimly-9iu5.onrender.com/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      toast.success('Appointment cancelled successfully');
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'completed':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleRatingSubmit = async (appointment: Appointment, star: number) => {
    // Optimistically update UI
    appointment._ratingValue = star;
    setAppointments([...appointments]);
    try {
      const res = await fetch(`https://trimly-9iu5.onrender.com/api/appointments/${appointment._id}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: star })
      });
      if (res.ok) {
        toast.success('Thank you for your rating!');
        // Update appointment in state
        appointment.rating = star;
        setAppointments([...appointments]);
      } else {
        toast.error('Failed to submit rating');
      }
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your upcoming and past appointments
          </p>
        </div>
        <Link to="/customer/booking">
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
          >
            Book Appointment
          </Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Calendar size={48} className="mb-4 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No Appointments Yet
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You haven't made any appointments yet. Book one now!
          </p>
          <Link to="/customer/booking">
            <Button variant="primary">Book an Appointment</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="card flex flex-col sm:flex-row sm:items-center"
            >
              <div className="mb-4 flex items-center sm:mb-0 sm:flex-1">
                <img
                  src={appointment.barberAvatar || 'https://via.placeholder.com/150'}
                  alt={appointment.barberName}
                  className="mr-4 h-16 w-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {appointment.barberName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.service}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{formatSlot(appointment.time)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      <span>View Location</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-4 border-t pt-4 sm:border-0 sm:pt-0">
                <div className="text-right">
                  <span className="block font-medium text-gray-900 dark:text-white">
                    {formatCurrency(appointment.price)}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
                
                {appointment.status === 'upcoming' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {appointment.status === 'completed' && (
                  <div className="mt-2">
                    {appointment.rating ? (
                      <div className="flex items-center text-yellow-500">
                        <StarRating value={appointment.rating} onChange={() => {}} disabled />
                        <span className="ml-2 text-sm text-gray-600">Thank you for rating!</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm text-gray-600">Rate your experience:</span>
                        <StarRating
                          value={appointment._ratingValue || 0}
                          onChange={(star: number) => handleRatingSubmit(appointment, star)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAppointmentsPage;