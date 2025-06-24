import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface QueueItem {
  _id: string;
  barberId: string;
  customerId: string;
  customerName: string;
  service: string;
  estimatedTime: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  barberName?: string;
  position?: number;
}

const QueueStatusPage: React.FC = () => {
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchQueueStatus();
    }
  }, [user?._id]);

  const fetchQueueStatus = async () => {
    try {
      setIsLoading(true);
      // Get all queues where this customer is present
      const response = await fetch(`https://trimly-9iu5.onrender.com/api/queue/customer/${user?._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }
      const data = await response.json();
      
      // Calculate position for each queue
      const queuesWithPosition = await Promise.all(
        data.map(async (item: QueueItem) => {
          try {
            // Get all waiting customers in this barber's queue
            const queueResponse = await fetch(`https://trimly-9iu5.onrender.com/api/queue/barber/${item.barberId}`);
            if (queueResponse.ok) {
              const allQueue = await queueResponse.json();
              const waitingQueue = allQueue
                .filter((q: QueueItem) => q.status === 'waiting')
                .sort((a: QueueItem, b: QueueItem) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              
              const position = waitingQueue.findIndex((q: QueueItem) => q._id === item._id) + 1;
              return { ...item, position };
            }
          } catch (error) {
            console.error('Error calculating position:', error);
          }
          return item;
        })
      );
      
      setQueueItems(queuesWithPosition);
    } catch (error) {
      console.error('Error fetching queue status:', error);
      toast.error('Failed to load queue status');
    } finally {
      setIsLoading(false);
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

  const getEstimatedWaitTime = (position: number) => {
    // Rough estimate: 30 minutes per customer
    const estimatedMinutes = position * 30;
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const minutes = estimatedMinutes % 60;
      return `${hours}h ${minutes}m`;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          Queue Status
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Check your position in the queue and estimated wait time
        </p>
      </div>

      {queueItems.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <Clock size={48} className="mb-4 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Not in Any Queue
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You're not currently in any barber's queue. Book an appointment to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <div key={item._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.barberName || 'Barber Shop'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.service}
                    </p>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>Booked for {formatSlot(item.estimatedTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  
                  {item.status === 'waiting' && item.position && (
                    <div className="mt-2">
                      <div className="text-lg font-bold text-primary">
                        Position #{item.position}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Est. wait: {getEstimatedWaitTime(item.position)}
                      </div>
                    </div>
                  )}
                  
                  {item.status === 'in-progress' && (
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      Your turn is now!
                    </div>
                  )}
                  
                  {item.status === 'completed' && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Service completed
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Added to queue: {new Date(item.createdAt).toLocaleString()}</span>
                  <button
                    onClick={fetchQueueStatus}
                    className="text-primary hover:underline"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QueueStatusPage; 