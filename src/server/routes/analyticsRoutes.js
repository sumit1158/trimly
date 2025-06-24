import express from 'express';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const router = express.Router();

// Get barber analytics overview
router.get('/barber/:barberId/overview', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { period = 'today' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    // Convert dates to YYYY-MM-DD format for string comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Analytics query: barberId=${barberId}, period=${period}, date range: ${startDateStr} to ${endDateStr}`);

    // Get appointments for the period
    const appointments = await Appointment.find({
      barberId,
      date: {
        $gte: startDateStr,
        $lt: endDateStr
      }
    });

    console.log(`Found ${appointments.length} appointments for analytics`);

    // Calculate analytics
    const totalRevenue = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.price, 0);

    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
    const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming').length;

    // Get unique customers
    const uniqueCustomers = new Set(appointments.map(apt => apt.userId.toString())).size;

    // Calculate average appointment value
    const avgAppointmentValue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

    // Get service breakdown
    const serviceBreakdown = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((acc, apt) => {
        acc[apt.service] = (acc[apt.service] || 0) + 1;
        return acc;
      }, {});

    const result = {
      period,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      uniqueCustomers,
      avgAppointmentValue: parseFloat(avgAppointmentValue.toFixed(2)),
      serviceBreakdown,
      conversionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : 0
    };

    console.log('Analytics result:', result);
    res.json(result);
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get revenue trends
router.get('/barber/:barberId/revenue-trends', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Convert dates to YYYY-MM-DD format for string comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const appointments = await Appointment.find({
      barberId,
      date: {
        $gte: startDateStr,
        $lte: endDateStr
      },
      status: 'completed'
    });

    // Group by date
    const revenueByDate = appointments.reduce((acc, apt) => {
      const date = apt.date;
      acc[date] = (acc[date] || 0) + apt.price;
      return acc;
    }, {});

    // Fill missing dates with 0
    const dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        revenue: revenueByDate[dateStr] || 0
      });
    }

    res.json(dates);
  } catch (error) {
    console.error('Revenue trends error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get service performance
router.get('/barber/:barberId/service-performance', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Convert dates to YYYY-MM-DD format for string comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const appointments = await Appointment.find({
      barberId,
      date: {
        $gte: startDateStr,
        $lt: endDateStr
      },
      status: 'completed'
    });

    // Calculate service performance
    const serviceStats = appointments.reduce((acc, apt) => {
      if (!acc[apt.service]) {
        acc[apt.service] = {
          count: 0,
          revenue: 0,
          avgPrice: 0
        };
      }
      acc[apt.service].count += 1;
      acc[apt.service].revenue += apt.price;
      acc[apt.service].avgPrice = acc[apt.service].revenue / acc[apt.service].count;
      return acc;
    }, {});

    const servicePerformance = Object.entries(serviceStats).map(([service, stats]) => ({
      service,
      count: stats.count,
      revenue: parseFloat(stats.revenue.toFixed(2)),
      avgPrice: parseFloat(stats.avgPrice.toFixed(2))
    }));

    res.json(servicePerformance);
  } catch (error) {
    console.error('Service performance error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get customer analytics
router.get('/barber/:barberId/customer-analytics', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Convert dates to YYYY-MM-DD format for string comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const appointments = await Appointment.find({
      barberId,
      date: {
        $gte: startDateStr,
        $lt: endDateStr
      }
    });

    // Get customer data
    const customerIds = [...new Set(appointments.map(apt => apt.userId))];
    const customers = await User.find({ _id: { $in: customerIds } });

    // Calculate customer metrics
    const customerStats = appointments.reduce((acc, apt) => {
      const customerId = apt.userId.toString();
      if (!acc[customerId]) {
        acc[customerId] = {
          appointments: 0,
          revenue: 0,
          lastVisit: null
        };
      }
      acc[customerId].appointments += 1;
      if (apt.status === 'completed') {
        acc[customerId].revenue += apt.price;
      }
      if (!acc[customerId].lastVisit || apt.date > acc[customerId].lastVisit) {
        acc[customerId].lastVisit = apt.date;
      }
      return acc;
    }, {});

    const customerAnalytics = Object.entries(customerStats).map(([customerId, stats]) => {
      const customer = customers.find(c => c._id.toString() === customerId);
      return {
        customerId,
        customerName: customer?.name || 'Unknown',
        customerEmail: customer?.email || '',
        appointments: stats.appointments,
        revenue: parseFloat(stats.revenue.toFixed(2)),
        lastVisit: stats.lastVisit,
        avgSpend: stats.appointments > 0 ? parseFloat((stats.revenue / stats.appointments).toFixed(2)) : 0
      };
    });

    // Sort by revenue
    customerAnalytics.sort((a, b) => b.revenue - a.revenue);

    res.json(customerAnalytics);
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointment analytics
router.get('/barber/:barberId/appointment-analytics', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Convert dates to YYYY-MM-DD format for string comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const appointments = await Appointment.find({
      barberId,
      date: {
        $gte: startDateStr,
        $lt: endDateStr
      }
    });

    // Calculate appointment metrics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled').length;
    const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming').length;

    // Calculate completion rate
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100) : 0;
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments * 100) : 0;

    // Get appointments by day of week
    const appointmentsByDay = appointments.reduce((acc, apt) => {
      const day = new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    // Get appointments by time slot
    const appointmentsByTime = appointments.reduce((acc, apt) => {
      const hour = apt.time.split(':')[0];
      const timeSlot = `${hour}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      upcomingAppointments,
      completionRate: parseFloat(completionRate.toFixed(1)),
      cancellationRate: parseFloat(cancellationRate.toFixed(1)),
      appointmentsByDay,
      appointmentsByTime
    });
  } catch (error) {
    console.error('Appointment analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 