import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, User, Phone, Mail, Check, X, Plus, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

interface QueueItem {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  service: string;
  estimatedTime: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

interface Appointment {
  _id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface WalkInForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  estimatedTime: string;
}

const QueuePage: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInForm, setWalkInForm] = useState<WalkInForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    service: '',
    estimatedTime: ''
  });
  const [availableWalkInSlots, setAvailableWalkInSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchQueue();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!user || !user.workingHours) return;
    const today = new Date();
    const day = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = user.workingHours[day];
    if (!workingHours || workingHours.closed) {
      setAvailableWalkInSlots([]);
      return;
    }
    // Get all booked slots for today (appointments + walk-ins)
    const todayStr = today.toISOString().split('T')[0];
    const booked = appointments
      .filter(apt => apt.date === todayStr && apt.status === 'upcoming')
      .map(apt => apt.time)
      .concat(
        queue
          .filter(item => item.estimatedTime && new Date(item.createdAt).toISOString().split('T')[0] === todayStr)
          .map(item => item.estimatedTime)
      );
    // Generate all possible slots
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${workingHours.start}`);
    const end = new Date(`2000-01-01T${workingHours.end}`);
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      if (slotEnd > end) break;
      const format = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const slot = `${format(slotStart)}-${format(slotEnd)}`;
      if (!booked.includes(slot)) {
        slots.push(slot);
      }
    }
    setAvailableWalkInSlots(slots);
  }, [user, appointments, queue]);

  const fetchQueue = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/queue/barber/${user?._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue');
      }
      const data = await response.json();
      setQueue(data);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to load queue');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/barber/${user?._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      
      // Fetch customer details for each appointment
      const appointmentsWithCustomers = await Promise.all(
        data.map(async (appointment: Appointment) => {
          try {
            const customerResponse = await fetch(`http://localhost:5000/api/users/${appointment.userId}`);
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
    }
  };

  const addToQueue = async (appointment: Appointment) => {
    try {
      // Check if customer is already in queue
      const existingInQueue = queue.find(item => item.customerId === appointment.userId);
      if (existingInQueue) {
        toast.error('Customer is already in queue');
        return;
      }

      const queueItem = {
        barberId: user?._id,
        customerId: appointment.userId,
        customerName: appointment.customerName || 'Customer',
        customerEmail: appointment.customerEmail,
        service: appointment.service,
        estimatedTime: appointment.time,
        status: 'waiting'
      };

      const response = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueItem),
      });

      if (!response.ok) {
        throw new Error('Failed to add to queue');
      }

      toast.success('Customer added to queue');
      fetchQueue();
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error('Failed to add to queue');
    }
  };

  const addWalkInCustomer = async () => {
    try {
      if (!walkInForm.customerName || !walkInForm.service || !walkInForm.estimatedTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      const queueItem = {
        barberId: user?._id,
        customerId: null, // No customer ID for walk-ins
        customerName: walkInForm.customerName,
        customerPhone: walkInForm.customerPhone,
        customerEmail: walkInForm.customerEmail,
        service: walkInForm.service,
        estimatedTime: walkInForm.estimatedTime,
        status: 'waiting',
        isWalkIn: true
      };

      const response = await fetch('http://localhost:5000/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queueItem),
      });

      if (!response.ok) {
        throw new Error('Failed to add walk-in customer');
      }

      toast.success('Walk-in customer added to queue');
      setShowWalkInModal(false);
      setWalkInForm({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        estimatedTime: ''
      });
      fetchQueue();
    } catch (error) {
      console.error('Error adding walk-in customer:', error);
      toast.error('Failed to add walk-in customer');
    }
  };

  const handleStatusUpdate = async (queueId: string, newStatus: QueueItem['status']) => {
    try {
      const response = await fetch(`http://localhost:5000/api/queue/${queueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchQueue();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const removeFromQueue = async (queueId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/queue/${queueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from queue');
      }

      toast.success('Customer removed from queue');
      fetchQueue();
    } catch (error) {
      console.error('Error removing from queue:', error);
      toast.error('Failed to remove from queue');
    }
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
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

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Customer Queue</h1>
        <p className="mt-2 text-gray-600">Manage your customer queue and service status</p>
      </div>

      {/* Toggle between Queue and Appointments */}
      <div className="mb-6 flex space-x-4">
        <Button
          variant={!showAppointments ? 'primary' : 'outline'}
          onClick={() => setShowAppointments(false)}
        >
          Current Queue ({queue.filter(item => item.status === 'waiting' || item.status === 'in-progress').length})
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowWalkInModal(true)}
          className="ml-auto"
        >
          <Plus size={16} className="mr-2" />
          Add Walk-in
        </Button>
      </div>

      {queue.filter(item => item.status === 'waiting' || item.status === 'in-progress').length > 0 ? (
        <div className="space-y-4">
          {queue.filter(item => item.status === 'waiting' || item.status === 'in-progress').map((item) => (
            <div key={item._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{item.customerName}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      {item.customerPhone && (
                        <div className="flex items-center">
                          <Phone className="mr-1 h-4 w-4" />
                          {item.customerPhone}
                        </div>
                      )}
                      {item.customerEmail && (
                        <div className="flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          {item.customerEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-1 h-4 w-4" />
                    {item.estimatedTime}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  {item.status === 'waiting' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(item._id, 'in-progress')}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromQueue(item._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {item.status === 'in-progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(item._id, 'completed')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Service:</span> {item.service}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Added:</span>{' '}
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Clock className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No Customers in Queue</h3>
          <p className="text-gray-600">
            Your queue is empty. Add walk-in customers.
          </p>
        </div>
      )}

      {/* Walk-in Customer Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Add Walk-in Customer</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  className="input mt-1 w-full"
                  value={walkInForm.customerName}
                  onChange={(e) => setWalkInForm({...walkInForm, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="input mt-1 w-full"
                  value={walkInForm.customerPhone}
                  onChange={(e) => setWalkInForm({...walkInForm, customerPhone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  className="input mt-1 w-full"
                  value={walkInForm.customerEmail}
                  onChange={(e) => setWalkInForm({...walkInForm, customerEmail: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service *
                </label>
                <input
                  type="text"
                  className="input mt-1 w-full"
                  value={walkInForm.service}
                  onChange={(e) => setWalkInForm({...walkInForm, service: e.target.value})}
                  placeholder="e.g., Haircut, Beard Trim"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableWalkInSlots.map(slot => (
                    <button
                      key={slot}
                      className={`rounded-lg border p-2 text-sm transition-colors ${
                        walkInForm.estimatedTime === slot
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setWalkInForm({ ...walkInForm, estimatedTime: slot })}
                      type="button"
                    >
                      {slot}
                    </button>
                  ))}
                  {availableWalkInSlots.length === 0 && (
                    <span className="text-gray-500 col-span-3">No available slots</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowWalkInModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addWalkInCustomer}
                className="flex-1"
              >
                Add to Queue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueuePage;