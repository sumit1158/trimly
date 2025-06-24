import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Appointment {
  _id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
}

function BarberAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user?._id) {
      fetchAppointments();
    }
  }, [user?._id]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://trimly-9iu5.onrender.com/api/appointments/barber/${user?._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      
      // Fetch customer details for each appointment
      const appointmentsWithCustomers = await Promise.all(
        data.map(async (appointment: Appointment) => {
          try {
            const customerResponse = await fetch(`https://trimly-9iu5.onrender.com/api/users/${appointment.userId}`);
            if (customerResponse.ok) {
              const customer = await customerResponse.json();
              return {
                ...appointment,
                customerName: customer.name,
                customerEmail: customer.email
              };
            }
          } catch (error) {
            console.error('Error fetching customer details:', error);
          }
          return appointment;
        })
      );
      
      setAppointments(appointmentsWithCustomers);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`https://trimly-9iu5.onrender.com/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      toast.success(`Appointment ${status} successfully`);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  // Sort appointments by date and then by start time of the slot
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // Compare dates first
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    // If dates are equal, compare start times
    const getStart = (slot: string) => slot.split('-')[0];
    return getStart(a.time).localeCompare(getStart(b.time));
  });

  // Format slot as '9:00 AM - 9:30 AM'
  const formatSlot = (slot: string) => {
    const [start, end] = slot.split('-');
    const format = (t: string) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${format(start)} - ${format(end)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
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
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your appointments and schedule
          </p>
        </div>
        <div className="mt-4 flex space-x-2 sm:mt-0">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </Button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
            <Calendar size={32} />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            No {filter === 'all' ? '' : filter} Appointments
          </h3>
          <p className="mb-4 max-w-md text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? "You don't have any appointments scheduled. They will appear here when customers book with you."
              : `You don't have any ${filter} appointments.`
            }
          </p>
          <Link to="/barber/services">
            <Button variant="primary">
              Manage Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <div key={appointment._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {appointment.service}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span>{appointment.customerName || 'Customer'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{formatSlot(appointment.time)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">{formatCurrency(appointment.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  
                  {appointment.status === 'upcoming' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                        className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/10"
                      >
                        <CheckCircle size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10"
                      >
                        <XCircle size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BarberAppointmentsPage;