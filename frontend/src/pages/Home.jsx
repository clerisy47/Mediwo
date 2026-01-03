import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, FileText, Calendar, Stethoscope, ShieldCheck, Zap, MessageSquare, Brain, Heart, User } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: 'Unified Health Portfolio (EII)',
      description: 'Instantly upload and securely store all scattered medical documents (reports, prescriptions, scans) to create a single, comprehensive digital record accessible 24/7.',
    },
    {
      icon: <Calendar className="w-8 h-8 text-indigo-600" />,
      title: 'Digital Queue Management',
      description: 'Secure your spot instantly, generate your digital token number, and track your live queue status and estimated wait time directly from your phone.',
      highlight: true // Primary patient benefit feature
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-green-600" />,
      title: 'Adaptive AI Intake (Pre-Consultation)',
      description: 'While you wait, interact with an intelligent, dynamic questionnaire that gathers structured symptoms and history, saving valuable consultation time.',
    },

    {
      icon: <Brain className="w-8 h-8 text-red-600" />,
      title: 'Intelligent Clinical Summary',
      description: 'The AI synthesizes your current symptoms with critical historical data (allergies, failed treatments) into a concise, physician-ready report, reducing diagnostic error risk.',
      highlight: true // Primary doctor benefit feature
    },
    {
      icon: <Stethoscope className="w-8 h-8 text-purple-600" />,
      title: 'AI-Assisted Documentation Co-Pilot',
      description: 'Utilizes medical speech-to-text to draft structured SOAP notes automatically, drastically cutting down on post-consultation charting and administrative work.',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      title: 'Context-Aware Smart Autocomplete',
      description: 'The system learns from doctor-patient interactions (RL) to provide highly accurate, context-relevant suggestions for medication, codes, and treatment plans.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-gray-600" />,
      title: 'Secure & Compliant Data Handling',
      description: 'Ensures enterprise-grade security with end-to-end encryption, strict access control, and adherence to medical privacy standards (e.g., HIPAA feasibility).',
    },
    {
      icon: <Clock className="w-8 h-8 text-pink-600" />,
      title: 'Continuous System Improvement (RL)',
      description: 'The platform self-improves by learning from doctor feedback (acceptance/modification of suggestions) ensuring smarter templates and higher accuracy over time.',
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      {!user && <Navbar />}
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
            <div className="h-48 bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center">
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
            <div className="h-48 bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center">
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
