import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Search, Heart, Calendar, Clock, MapPin, X, Edit2, Eye, Bell } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog } from '@headlessui/react';
import { API_BASE_URL } from '../../config';

interface Barber {
  _id: string;
  name: string;
  shopName: string;
  avatar?: string;
  rating?: number;
  ratingCount?: number;
  location?: string;
  services?: Service[];
}

interface Service {
  name: string;
  duration: number | string;
  price: number;
}

const TopBarbersPage: React.FC = () => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [barberDetails, setBarberDetails] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVisits: 0, uniqueBarbers: 0 });
  const [viewedAppointment, setViewedAppointment] = useState<any | null>(null);
  const [rescheduleAppointment, setRescheduleAppointment] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users?role=barber`);
        if (!response.ok) throw new Error('Failed to fetch barbers');
        const data = await response.json();
        setBarbers(data);
      } catch (error) {
        setBarbers([]);
      }
    };
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (!selectedBarber) return;
    const fetchBarberDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${selectedBarber._id}`);
        if (!response.ok) throw new Error('Failed to fetch barber details');
        const data = await response.json();
        setBarberDetails(data);
      } catch {
        setBarberDetails(null);
      }
    };
    fetchBarberDetails();
  }, [selectedBarber]);

  useEffect(() => {
    if (!selectedBarber || !selectedDate) {
      setBookedSlots([]);
      return;
    }
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/appointments/barber/${selectedBarber._id}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        const slots = data
          .filter((apt: any) => apt.date === selectedDate && apt.status === 'upcoming')
          .map((apt: any) => apt.time);
        setBookedSlots(slots);
      } catch {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedBarber, selectedDate]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?._id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/favorites/${user._id}`);
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        setFavorites(data.favorites.map((fav: any) => fav._id));
      } catch {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user?._id]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?._id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/appointments/user/${user._id}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        setAppointments(data);
        // Calculate stats
        setStats({
          totalVisits: data.length,
          uniqueBarbers: new Set(data.map((a: any) => a.barberId)).size
        });
      } catch {
        setAppointments([]);
        setStats({ totalVisits: 0, uniqueBarbers: 0 });
      }
    };
    fetchAppointments();
  }, [user?._id]);

  const filteredBarbers = barbers
    .filter(barber => {
      const q = searchQuery.toLowerCase();
      return (
        (barber.shopName || '').toLowerCase().includes(q) ||
        (barber.name || '').toLowerCase().includes(q) ||
        (barber.location || '').toLowerCase().includes(q) ||
        (barber.services && barber.services.some((s: any) => (s.name || '').toLowerCase().includes(q)))
      );
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const getAvailableTimes = (barber: any, date: string) => {
    if (!barber || !barber.workingHours) return [];
    const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingHours = barber.workingHours[day];
    if (!workingHours || workingHours.closed) return [];
    const times = [];
    const start = new Date(`2000-01-01T${workingHours.start}`);
    const end = new Date(`2000-01-01T${workingHours.end}`);
    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 30)) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);
      if (slotEnd > end) break;
      const format = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const slot = `${format(slotStart)}-${format(slotEnd)}`;
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
        barberName: selectedBarber.shopName || selectedBarber.name,
        barberAvatar: selectedBarber.avatar,
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        price: selectedService.price,
        status: 'upcoming',
        addToQueue: true
      };
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error('Failed to book appointment');
      toast.success('Appointment booked successfully!');
      setShowBooking(false);
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
    }
  };

  const isFavorite = (barberId: string) => favorites.includes(barberId);

  const handleToggleFavorite = async (barberId: string) => {
    if (!user?._id) return;
    try {
      if (isFavorite(barberId)) {
        // Remove from favorites
        const response = await fetch(`${API_BASE_URL}/api/users/favorites/${user._id}/${barberId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove from favorites');
        setFavorites(favorites.filter(id => id !== barberId));
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        const response = await fetch(`${API_BASE_URL}/api/users/favorites/${user._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barberId })
        });
        if (!response.ok) throw new Error('Failed to add to favorites');
        setFavorites([...favorites, barberId]);
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  // Favorites section
  const favoriteBarbers = barbers.filter(b => isFavorite(b._id));

  // Handler: View
  const handleViewAppointment = (appointment: any) => {
    setViewedAppointment(appointment);
  };

  // Handler: Cancel
  const handleCancelAppointment = async (appointment: any) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointment._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      toast.success('Appointment cancelled');
      setAppointments(prev => prev.map(a => a._id === appointment._id ? { ...a, status: 'cancelled' } : a));
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  // Handler: Reschedule
  const handleRescheduleAppointment = (appointment: any) => {
    setRescheduleAppointment(appointment);
    setRescheduleDate(appointment.date);
    setRescheduleTime(appointment.time);
  };
  const submitReschedule = async () => {
    if (!rescheduleAppointment || !rescheduleDate || !rescheduleTime) return;
    setIsRescheduling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/${rescheduleAppointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });
      if (!response.ok) throw new Error('Failed to reschedule');
      toast.success('Appointment rescheduled');
      setAppointments(prev => prev.map(a => a._id === rescheduleAppointment._id ? { ...a, date: rescheduleDate, time: rescheduleTime } : a));
      setRescheduleAppointment(null);
    } catch {
      toast.error('Failed to reschedule');
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl mb-6">Dashboard</h1>
      {/* Sticky Search Bar Section - improved UI */}
      <div className="mb-8 sticky top-4 z-20">
        <div className="relative w-full bg-white dark:bg-gray-900 rounded-xl shadow-md p-2">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          <input
            type="text"
            placeholder="Search by barber, shop, location, or service..."
            className="input pl-12 w-full rounded-xl focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Upcoming Appointments Section - horizontal scrollable cards */}
      {appointments.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
            <Calendar className="text-primary" /> Upcoming Appointments
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {appointments
              .filter(a => a.status === 'upcoming')
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 3)
              .map(appointment => (
                <div key={appointment._id} className="min-w-[280px] bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow relative">
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Upcoming</span>
                  <div className="flex items-center mb-2">
                    <img
                      src={appointment.barberAvatar || 'https://via.placeholder.com/150'}
                      alt={appointment.barberName}
                      className="h-10 w-10 rounded-lg object-cover mr-3 border"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{appointment.barberName}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="mr-1 text-primary" />
                        <span>{appointment.date} {appointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn btn-xs btn-outline flex items-center gap-1" onClick={() => handleViewAppointment(appointment)}><Eye size={14} /> View</button>
                    <button className="btn btn-xs btn-outline flex items-center gap-1" onClick={() => handleRescheduleAppointment(appointment)}><Edit2 size={14} /> Reschedule</button>
                    <button className="btn btn-xs btn-outline text-red-500 flex items-center gap-1" onClick={() => handleCancelAppointment(appointment)}><X size={14} /> Cancel</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Customer Stats Section - colored cards */}
      <div className="mb-10 flex gap-8 flex-wrap">
        <div className="flex-1 min-w-[180px] bg-gradient-to-br from-primary/80 to-blue-400 text-white rounded-xl shadow-md p-6 flex flex-col items-center">
          <Calendar size={32} className="mb-2" />
          <span className="text-3xl font-bold">{stats.totalVisits}</span>
          <span className="opacity-80">Total Visits</span>
        </div>
        <div className="flex-1 min-w-[180px] bg-primary/10 border border-blue-200 rounded-xl shadow-md p-6 flex flex-col items-center">
          <Star size={32} className="mb-2 text-blue-500" />
          <span className="text-3xl font-bold">{stats.uniqueBarbers}</span>
          <span>Barbers Visited</span>
        </div>
      </div>
      {/* Promotions & Offers Section - improved */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-blue-500" /> Promotions & Offers
        </h2>
        <div className="card p-6 bg-primary/10 border border-blue-200 rounded-xl shadow-md flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <span className="text-lg">20% off your next booking! Use code <span className="font-bold">TRIM20</span> at checkout.</span>
        </div>
      </div>
      {/* Ratings & Reviews Section - improved */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-blue-500" /> Your Reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.filter(a => a.rating).length === 0 ? (
            <div className="text-gray-500">You haven't rated any appointments yet.</div>
          ) : (
            appointments.filter(a => a.rating).map(a => (
              <div key={a._id} className="bg-primary/10 border border-blue-200 rounded-xl shadow-md p-4 flex flex-col">
                <div className="flex items-center mb-2">
                  <img src={a.barberAvatar || 'https://via.placeholder.com/150'} alt={a.barberName} className="h-8 w-8 rounded mr-2 border" />
                  <span className="font-medium">{a.barberName}</span>
                </div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < a.rating ? 'text-blue-500' : 'text-blue-200'} />
                  ))}
                  <span className="ml-2 text-sm">{a.date} {a.time}</span>
                </div>
                <div className="text-sm mt-1">{a.review || 'No comment.'}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBarbers.length > 0 ? (
          filteredBarbers.map(barber => (
            <div key={barber._id} className="card flex items-center space-x-4">
              <img
                src={barber.avatar || 'https://via.placeholder.com/150'}
                alt={barber.shopName || barber.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {barber.shopName || barber.name}
                </h3>
                <div className="flex items-center text-sm mt-1">
                  <span className="flex items-center text-accent">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1">{barber.rating?.toFixed(1) || '0.0'}</span>
                  </span>
                  {barber.ratingCount ? (
                    <span className="ml-2 text-gray-500">({barber.ratingCount} reviews)</span>
                  ) : null}
                </div>
                <button
                  className="mt-3 rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                  onClick={() => { setSelectedBarber(barber); setShowBooking(true); }}
                >
                  Book Appointment
                </button>
              </div>
              <button
                className="ml-2"
                onClick={() => handleToggleFavorite(barber._id)}
                aria-label={isFavorite(barber._id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={24} className={isFavorite(barber._id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} fill={isFavorite(barber._id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">No barbers found.</div>
        )}
      </div>
      {showBooking && selectedBarber && barberDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold">Book Appointment with {barberDetails.shopName || barberDetails.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Service</label>
                <div className="space-y-2">
                  {barberDetails.services?.map((service: Service) => (
                    <div
                      key={service.name}
                      className={`cursor-pointer rounded-lg border p-3 transition-colors ${selectedService?.name === service.name ? 'border-primary bg-primary/5' : 'hover:border-gray-300 dark:hover:border-gray-600'}`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{typeof service.duration === 'number' ? `${service.duration} minutes` : service.duration}</p>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">₹{service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableTimes(barberDetails, selectedDate).map(slot => {
                      const isBooked = bookedSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          className={`rounded-lg border p-2 text-sm transition-colors ${selectedTime === slot && !isBooked ? 'border-primary bg-primary/5 text-primary' : isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500' : 'hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => !isBooked && setSelectedTime(slot)}
                          disabled={isBooked}
                        >
                          {formatSlot(slot)}
                        </button>
                      );
                    })}
                    {getAvailableTimes(barberDetails, selectedDate).length === 0 && (
                      <span className="text-gray-500 col-span-3">No available slots</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex space-x-3">
              <Button variant="outline" onClick={() => setShowBooking(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleBookAppointment} className="flex-1" disabled={!selectedService || !selectedDate || !selectedTime}>Book Appointment</Button>
            </div>
          </div>
        </div>
      )}
      {/* View Appointment Modal */}
      {viewedAppointment && (
        <Dialog open={!!viewedAppointment} onClose={() => setViewedAppointment(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
            <Dialog.Title className="text-lg font-bold mb-2">Appointment Details</Dialog.Title>
            <div className="mb-2"><b>Barber:</b> {viewedAppointment.barberName}</div>
            <div className="mb-2"><b>Service:</b> {viewedAppointment.service}</div>
            <div className="mb-2"><b>Date:</b> {viewedAppointment.date}</div>
            <div className="mb-2"><b>Time:</b> {viewedAppointment.time}</div>
            <div className="mb-2"><b>Status:</b> {viewedAppointment.status}</div>
            <button className="btn btn-primary mt-4 w-full" onClick={() => setViewedAppointment(null)}>Close</button>
          </div>
        </Dialog>
      )}
      {/* Reschedule Modal */}
      {rescheduleAppointment && (
        <Dialog open={!!rescheduleAppointment} onClose={() => setRescheduleAppointment(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
            <Dialog.Title className="text-lg font-bold mb-2">Reschedule Appointment</Dialog.Title>
            <div className="mb-2"><b>Barber:</b> {rescheduleAppointment.barberName}</div>
            <div className="mb-2"><b>Service:</b> {rescheduleAppointment.service}</div>
            <div className="mb-2"><b>Current Date:</b> {rescheduleAppointment.date}</div>
            <div className="mb-2"><b>Current Time:</b> {rescheduleAppointment.time}</div>
            <div className="mb-2">
              <label className="block mb-1">New Date</label>
              <input type="date" className="input w-full" value={rescheduleDate} onChange={e => { setRescheduleDate(e.target.value); setRescheduleTime(''); }} min={new Date().toISOString().split('T')[0]} />
            </div>
            {rescheduleDate && (
              <div className="mb-2">
                <label className="block mb-1">New Time</label>
                <input type="text" className="input w-full" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} placeholder="Enter new time (e.g. 10:00-10:30)" />
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-outline flex-1" onClick={() => setRescheduleAppointment(null)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={submitReschedule} disabled={isRescheduling || !rescheduleDate || !rescheduleTime}>{isRescheduling ? 'Rescheduling...' : 'Reschedule'}</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default TopBarbersPage; 