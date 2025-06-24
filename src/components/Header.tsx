import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 ${
        isHomePage ? 'bg-transparent dark:bg-transparent' : ''
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:space-x-4 lg:space-x-6">
          {!user ? (
            <>
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-primary-light"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary dark:text-gray-200 dark:hover:text-primary-light"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary ml-2"
              >
                Register
              </Link>
            </>
          ) : null}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User Menu (when logged in) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 rounded-full p-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                  <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    to={user.role === 'barber' ? '/barber/profile' : '/customer/profile'}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-md p-2 text-gray-700 md:hidden dark:text-gray-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 border-b border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900 md:hidden">
            <nav className="flex flex-col space-y-4">
              {!user ? (
                <>
                  <Link
                    to="/"
                    className="text-base font-medium text-gray-700 dark:text-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/login"
                    className="text-base font-medium text-gray-700 dark:text-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to={user.role === 'barber' ? '/barber/dashboard' : '/customer/dashboard'}
                    className="text-base font-medium text-gray-700 dark:text-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to={user.role === 'barber' ? '/barber/profile' : '/customer/profile'}
                    className="text-base font-medium text-gray-700 dark:text-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-base font-medium text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;