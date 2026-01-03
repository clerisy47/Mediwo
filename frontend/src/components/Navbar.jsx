import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    enqueueSnackbar('Logged out successfully', { variant: 'success' });
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Home
          </Link>

          <nav className="flex items-center space-x-6">
            {
              user && (<>
                {
                  user?.role === 'PATIENT' ? (
                    <>
                <Link
                  to="/appointment"
                  className={`${isActive('/appointment')} transition`}
                >
                  Appointment
                </Link> 
                <Link
                  to="/upload"
                  className={`${isActive('/upload')} transition`}
                >
                  Upload
                      </Link>
                      </>
              )
                : (
                  <Link
                    to="/patients"
                    className={`${isActive('/patients')} transition`}
                  >
                    Patients
                  </Link>
                )
            }
            <Link
              to="/profile"
              className={`${isActive('/profile')} transition`}
            >
              Profile
            </Link>
              </>)
            }
            {
              user ? (<div className="flex items-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Logout
                </button>
              </div>) : (
                <div className="flex flex-col sm:flex-row-reverse gap-4 justify-center items-center">
                    <div>
                    <Link
                    to="/login"
                    className="px-8 py-3 bg-blue-600 !text-blue-50 font-semibold hover:bg-blue-700 transition duration-200 text-lg"
                  >
                    Sign In
                  </Link>
                  </div>
                    <div>
                    <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-blue-600  font-semibold hover:bg-blue-50 transition duration-200 text-lg"
                  >
                    Register
                  </Link>
                 </div>
                </div>
              )
            }
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
