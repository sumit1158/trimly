import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BarberDashboard from './pages/barber/DashboardPage';
import CustomerProfilePage from './pages/customer/ProfilePage';
import BarberAppointmentsPage from './pages/barber/AppointmentsPage';
import CustomerAppointmentsPage from './pages/customer/AppointmentsPage';
import QueueStatusPage from './pages/customer/QueueStatusPage';
import BookingPage from './pages/customer/BookingPage';
import ServicesPage from './pages/barber/ServicesPage';
import QueuePage from './pages/barber/QueuePage';
import StaffPage from './pages/barber/StaffPage';
import ShopSettingsPage from './pages/barber/ShopSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import BarberProfilePage from './pages/barber/ProfilePage';
import TopBarbersPage from './pages/customer/TopBarbersPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Barber protected routes */}
      <Route path="/barber" element={<ProtectedRoute role="barber" />}>
        <Route element={<Layout />}>
          <Route index element={<BarberDashboard />} />
          <Route path="profile" element={<BarberProfilePage />} />
          <Route path="appointments" element={<BarberAppointmentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="team" element={<StaffPage />} />
          <Route path="settings" element={<ShopSettingsPage />} />
        </Route>
      </Route>

      {/* Customer protected routes */}
      <Route path="/customer" element={<ProtectedRoute role="customer" />}>
        <Route element={<Layout />}>
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="appointments" element={<CustomerAppointmentsPage />} />
          <Route path="queue" element={<QueueStatusPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="top-barbers" element={<TopBarbersPage />} />
        </Route>
      </Route>

      {/* 404 route */}
      <Route path="*" element={<Layout />}>
        <Route index element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;