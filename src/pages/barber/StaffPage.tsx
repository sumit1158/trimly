import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, UserMinus, Edit2, Mail, Phone } from 'lucide-react';
import Button from '../../components/Button';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../config';

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  specialties: string[];
  avatar?: string;
}

const StaffPage: React.FC = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'barber',
    specialties: [] as string[],
  });
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users?shopId=${user?._id}`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newStaff,
          shopId: user?._id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add staff member');

      toast.success('Staff member added successfully');
      setShowAddStaffModal(false);
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove staff member');

      toast.success('Staff member removed successfully');
      fetchStaff();
    } catch (error) {
      console.error('Error removing staff:', error);
      toast.error('Failed to remove staff member');
    }
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/staff/${editingStaff._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStaff),
      });
      if (!response.ok) throw new Error('Failed to update staff member');
      toast.success('Staff member updated successfully');
      setEditingStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowAddStaffModal(true)}
          className="flex items-center"
        >
          <UserPlus className="mr-2 h-5 w-5" />
          Add Staff Member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : staff.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staff.map((member) => (
            <div key={member._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={member.avatar || 'https://via.placeholder.com/50'}
                    alt={member.name}
                    className="mr-4 h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStaff(member)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveStaff(member._id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="mr-2 h-4 w-4" />
                  {member.phone}
                </div>
              </div>
              {member.specialties.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <UserPlus className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No Staff Members</h3>
          <p className="mb-4 text-gray-600">
            Add staff members to help manage your barbershop
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddStaffModal(true)}
          >
            Add Staff Member
          </Button>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md">
            <h2 className="mb-4 text-xl font-semibold">Add Staff Member</h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                  className="input"
                >
                  <option value="barber">Barber</option>
                  <option value="assistant">Assistant</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddStaffModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Add Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="card w-full max-w-md">
            <h2 className="mb-4 text-xl font-semibold">Edit Staff Member</h2>
            <form onSubmit={handleEditStaff} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, email: e.target.value } : null)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input
                  type="text"
                  value={editingStaff.phone}
                  onChange={(e) => setEditingStaff(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  className="input"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingStaff(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage; 