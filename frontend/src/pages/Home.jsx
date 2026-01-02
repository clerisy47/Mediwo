import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, FileText, Calendar, Clock, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Medical Records',
      description: 'Upload and manage your medical documents securely'
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: 'Doctor Access',
      description: 'Doctors can view and manage patient records efficiently'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Appointment Bookings',
      description: 'Secure your appointment, generate your digital token number, and track your live queue status instantly.',
      path: '/appointment', // This links to your new feature
      highlight: true // Optional flag to style it differently
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24/7 Access',
      description: 'Access your records anytime, anywhere'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Heart className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Mediwo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Your trusted Hospital Management System for seamless healthcare management
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/profile')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl text-lg"
              >
                Go to Profile
              </button>
              {user.role === 'PATIENT' && (
                <button
                  onClick={() => navigate('/upload')}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-lg hover:shadow-xl text-lg"
                >
                  Upload Records
                </button>
              )}
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => feature.path && navigate(feature.path)}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition duration-200 border border-gray-100"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-200">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <User className="w-24 h-24 text-white opacity-90" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Patients</h3>
              <p className="text-gray-600 mb-4">
                Upload and manage your medical records, track your health history, and share documents with your healthcare providers.
              </p>
              {!user && (
                <Link
                  to="/register"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Register as Patient
                </Link>
              )}
            </div>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-200">
            <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <Stethoscope className="w-24 h-24 text-white opacity-90" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Doctors</h3>
              <p className="text-gray-600 mb-4">
                Access patient records, review medical documents, and provide comprehensive healthcare management for your patients.
              </p>
              {!user && (
                <Link
                  to="/register"
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Register as Doctor
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        {user && (
          <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.username || user.name}!
            </h2>
            <p className="text-gray-600 text-lg">
              You are logged in as a <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

