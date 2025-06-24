import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit2, Clock, DollarSign } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

interface Service {
  name: string;
  duration: number;
  price: number;
  description?: string;
}

const ServicesPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Service>({
    name: '',
    duration: 30,
    price: 0,
    description: '',
  });

  useEffect(() => {
    if (user?.services && user.services.length > 0) {
      // If services are stored as strings (from backend), parse them
      if (typeof user.services[0] === 'string') {
        setServices(user.services.map((s: any) => JSON.parse(s)) as Service[]);
      } else {
        setServices(user.services as Service[]);
      }
    } else {
      setServices([]);
    }
    setIsLoading(false);
  }, [user]);

  const reloadServicesFromUser = () => {
    const storedUser = localStorage.getItem('trimly_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.services && parsedUser.services.length > 0) {
        if (typeof parsedUser.services[0] === 'string') {
          setServices(parsedUser.services.map((s: any) => JSON.parse(s)));
        } else {
          setServices(parsedUser.services as Service[]);
        }
      } else {
        setServices([]);
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      const updatedServices = [...services, newService];
      await updateProfile(user._id, { services: updatedServices });
      reloadServicesFromUser();
      setShowAddModal(false);
      setNewService({ name: '', duration: 30, price: 0, description: '' });
      toast.success('Service added successfully');
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    }
  };

  const handleEditService = async (index: number, updatedService: Service) => {
    if (!user?._id) return;
    try {
      const updatedServices = [...services];
      updatedServices[index] = updatedService;
      await updateProfile(user._id, { services: updatedServices });
      reloadServicesFromUser();
      setEditingService(null);
      toast.success('Service updated successfully');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (index: number) => {
    if (!user?._id) return;
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const updatedServices = services.filter((_, i) => i !== index);
      await updateProfile(user._id, { services: updatedServices });
      reloadServicesFromUser();
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : services.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{service.name}</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-2 h-4 w-4" />
                  {service.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {formatCurrency(service.price)}
                </div>
                {service.description && (
                  <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Plus className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No Services Added</h3>
          <p className="mb-4 text-gray-600">
            Add services to let customers know what you offer
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Service
          </Button>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md">
            <h2 className="mb-4 text-xl font-semibold">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingService) {
                  const index = services.findIndex(s => s.name === editingService.name);
                  handleEditService(index, newService);
                } else {
                  handleAddService(e);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Service Name
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="input"
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description (optional)
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingService(null);
                    setNewService({ name: '', duration: 30, price: 0, description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;