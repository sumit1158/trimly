import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

interface AnalyticsData {
  period: string;
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  upcomingAppointments: number;
  uniqueCustomers: number;
  avgAppointmentValue: number;
  serviceBreakdown: Record<string, number>;
  conversionRate: string;
}

interface RevenueTrend {
  date: string;
  revenue: number;
}

interface ServicePerformance {
  service: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

interface CustomerAnalytics {
  customerId: string;
  customerName: string;
  customerEmail: string;
  appointments: number;
  revenue: number;
  lastVisit: string;
  avgSpend: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([]);
  const [servicePerformance, setServicePerformance] = useState<ServicePerformance[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics[]>([]);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchAnalyticsData();
    }
  }, [user?._id, period]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const barberId = user?._id;

      // Fetch all analytics data in parallel
      const [analyticsRes, revenueRes, serviceRes, customerRes] = await Promise.all([
        fetch(`http://localhost:5000/api/analytics/barber/${barberId}/overview?period=${period}`),
        fetch(`http://localhost:5000/api/analytics/barber/${barberId}/revenue-trends?days=30`),
        fetch(`http://localhost:5000/api/analytics/barber/${barberId}/service-performance?period=${period}`),
        fetch(`http://localhost:5000/api/analytics/barber/${barberId}/customer-analytics?period=${period}`)
      ]);

      const [analytics, revenue, service, customer] = await Promise.all([
        analyticsRes.json(),
        revenueRes.json(),
        serviceRes.json(),
        customerRes.json()
      ]);

      setAnalyticsData(analytics);
      setRevenueTrends(revenue);
      setServicePerformance(service);
      setCustomerAnalytics(customer);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRevenueChartData = () => {
    return revenueTrends.map(item => ({
      date: formatDate(item.date),
      revenue: item.revenue
    }));
  };

  const getServiceChartData = () => {
    return servicePerformance.map(item => ({
      service: item.service,
      revenue: item.revenue,
      count: item.count
    }));
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
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics and insights for your barbershop
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {analyticsData && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card bg-white">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign size={24} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analyticsData.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {analyticsData.period} period
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Calendar size={24} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.totalAppointments}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {analyticsData.completedAppointments} completed
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Customers</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData.uniqueCustomers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {analyticsData.conversionRate}% conversion
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Appointment Value</h2>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analyticsData.avgAppointmentValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  per completed appointment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trends Chart */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Trends
            </h2>
            <div className="flex items-center space-x-2">
              <Activity size={18} className="text-gray-400" />
            </div>
          </div>
          
          <div className="h-64">
            {revenueTrends.length > 0 ? (
              <div className="h-full flex items-end justify-between space-x-1">
                {getRevenueChartData().slice(-7).map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary rounded-t"
                      style={{ 
                        height: `${Math.max((item.revenue / Math.max(...getRevenueChartData().map(d => d.revenue))) * 200, 4)}px` 
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Service Performance */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Service Performance
            </h2>
            <PieChart size={18} className="text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {servicePerformance.length > 0 ? (
              servicePerformance.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{service.service}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {service.count} appointments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(service.revenue)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(service.avgPrice)} avg
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No service data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className="mt-6">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Customers
            </h2>
            <Users size={18} className="text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Appointments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Total Spent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg. Spend</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {customerAnalytics.length > 0 ? (
                  customerAnalytics.slice(0, 10).map((customer, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{customer.customerName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{customer.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{customer.appointments}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.revenue)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatCurrency(customer.avgSpend)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatDate(customer.lastVisit)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No customer data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Appointment Status Breakdown */}
      {analyticsData && (
        <div className="mt-6">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appointment Status Breakdown
              </h2>
              <BarChart3 size={18} className="text-gray-400" />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analyticsData.completedAppointments}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData.upcomingAppointments}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Upcoming</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {analyticsData.cancelledAppointments}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Cancelled</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 