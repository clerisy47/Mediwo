import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Calendar, Phone, Activity, Droplet, FileText, Clock } from 'lucide-react';

const PatientDetail = () => {
  const { patientName } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock patient database - in real app, this would come from an API
  const mockPatients = {
    'john-doe': {
      id: 1,
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      condition: 'Hypertension',
      admissionDate: '2024-01-15',
      status: 'Active',
      phone: '+1-234-567-8901',
      email: 'john.doe@email.com',
      bloodGroup: 'O+',
      lastVisit: '2024-01-20',
      address: '123 Main Street, City, State 12345',
      emergencyContact: 'Jane Doe - +1-234-567-8900',
      medicalHistory: [
        { date: '2024-01-20', description: 'Blood pressure check - Normal', doctor: 'Dr. Albert Einstein' },
        { date: '2024-01-15', description: 'Initial consultation for hypertension', doctor: 'Dr. Albert Einstein' },
        { date: '2023-12-10', description: 'Routine checkup', doctor: 'Dr. Albert Einstein' }
      ],
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2024-01-15' },
        { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2024-01-15' }
      ],
      labResults: [
        { test: 'Blood Pressure', result: '130/85 mmHg', date: '2024-01-20', status: 'Normal' },
        { test: 'Cholesterol', result: '180 mg/dL', date: '2024-01-20', status: 'Slightly Elevated' },
        { test: 'Blood Sugar', result: '95 mg/dL', date: '2024-01-20', status: 'Normal' }
      ]
    },
    'jane-smith': {
      id: 2,
      name: 'Jane Smith',
      age: 32,
      gender: 'Female',
      condition: 'Diabetes Type 2',
      admissionDate: '2024-01-20',
      status: 'Active',
      phone: '+1-234-567-8902',
      email: 'jane.smith@email.com',
      bloodGroup: 'A+',
      lastVisit: '2024-01-22',
      address: '456 Oak Avenue, City, State 12346',
      emergencyContact: 'John Smith - +1-234-567-8901',
      medicalHistory: [
        { date: '2024-01-22', description: 'Blood sugar monitoring - Controlled', doctor: 'Dr. Albert Einstein' },
        { date: '2024-01-20', description: 'Diabetes management consultation', doctor: 'Dr. Albert Einstein' }
      ],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', startDate: '2024-01-20' },
        { name: 'Insulin Glargine', dosage: '20 units', frequency: 'Once daily at bedtime', startDate: '2024-01-20' }
      ],
      labResults: [
        { test: 'HbA1c', result: '7.2%', date: '2024-01-22', status: 'Controlled' },
        { test: 'Fasting Blood Sugar', result: '110 mg/dL', date: '2024-01-22', status: 'Good' },
        { test: 'Cholesterol', result: '195 mg/dL', date: '2024-01-22', status: 'Normal' }
      ]
    },
    'bob-johnson': {
      id: 3,
      name: 'Bob Johnson',
      age: 58,
      gender: 'Male',
      condition: 'Cardiac Arrhythmia',
      admissionDate: '2024-01-18',
      status: 'Active',
      phone: '+1-234-567-8903',
      email: 'bob.johnson@email.com',
      bloodGroup: 'B+',
      lastVisit: '2024-01-21',
      address: '789 Pine Road, City, State 12347',
      emergencyContact: 'Mary Johnson - +1-234-567-8902',
      medicalHistory: [
        { date: '2024-01-21', description: 'ECG monitoring - Irregular rhythm detected', doctor: 'Dr. Albert Einstein' },
        { date: '2024-01-18', description: 'Cardiac evaluation for arrhythmia', doctor: 'Dr. Albert Einstein' }
      ],
      medications: [
        { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', startDate: '2024-01-18' },
        { name: 'Warfarin', dosage: '5mg', frequency: 'Once daily', startDate: '2024-01-18' }
      ],
      labResults: [
        { test: 'ECG', result: 'Atrial Fibrillation', date: '2024-01-21', status: 'Abnormal' },
        { test: 'Echocardiogram', result: 'Normal ejection fraction', date: '2024-01-19', status: 'Normal' }
      ]
    }
  };

  // Get patient data or use default
  const patient = mockPatients[patientName] || {
    name: patientName?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Unknown Patient',
    age: 'N/A',
    gender: 'N/A',
    condition: 'N/A',
    admissionDate: 'N/A',
    status: 'Active',
    phone: 'N/A',
    email: 'N/A',
    bloodGroup: 'N/A',
    lastVisit: 'N/A',
    address: 'N/A',
    emergencyContact: 'N/A',
    medicalHistory: [],
    medications: [],
    labResults: []
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Recovered: 'bg-blue-100 text-blue-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getResultStatusBadge = (status) => {
    const styles = {
      Normal: 'bg-green-100 text-green-800',
      Good: 'bg-green-100 text-green-800',
      Controlled: 'bg-blue-100 text-blue-800',
      'Slightly Elevated': 'bg-yellow-100 text-yellow-800',
      Abnormal: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user || user.role !== 'DOCTOR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only doctors can access this page.</p>
          <Link to="/patients" className="text-blue-600 hover:underline">Go back to Patients</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/patients')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Patients</span>
        </button>

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{patient.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusBadge(patient.status)}`}>
                    {patient.status}
                  </span>
                  <span className="px-4 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                    {patient.condition}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-lg font-semibold text-gray-900">{patient.age} years</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-lg font-semibold text-gray-900">{patient.gender}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Droplet className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="text-lg font-semibold text-gray-900">{patient.bloodGroup}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-lg font-semibold text-gray-900">{patient.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Admission Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patient.admissionDate !== 'N/A' ? new Date(patient.admissionDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="text-lg font-semibold text-gray-900">
                  {patient.lastVisit !== 'N/A' ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {patient.address && patient.address !== 'N/A' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Address</p>
              <p className="text-lg text-gray-900">{patient.address}</p>
            </div>
          )}

          {patient.emergencyContact && patient.emergencyContact !== 'N/A' && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Emergency Contact</p>
              <p className="text-lg text-gray-900">{patient.emergencyContact}</p>
            </div>
          )}
        </div>

        {/* Medical History */}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Medical History
            </h2>
            <div className="space-y-4">
              {patient.medicalHistory.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-900">{entry.description}</p>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Dr. {entry.doctor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {patient.medications && patient.medications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Current Medications
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patient.medications.map((med, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {med.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {med.dosage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {med.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(med.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lab Results */}
        {patient.labResults && patient.labResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Lab Results
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patient.labResults.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.test}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.result}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(result.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultStatusBadge(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;

