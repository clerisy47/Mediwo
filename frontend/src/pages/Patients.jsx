import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, Calendar, Activity, ArrowRight } from 'lucide-react';

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_URL}/patients`);
        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      }
    };

    if (user && user.role === 'DOCTOR') {
      fetchPatients();
    }
  }, [user]);

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'admissionDate' || sortBy === 'lastVisit') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, sortBy, sortOrder, patients]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Recovered: 'bg-blue-100 text-blue-800',
      Critical: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPatientSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  if (!user || user.role !== 'DOCTOR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only doctors can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Patient Management</h1>
          <p className="text-gray-600">View and manage all patient records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
              </div>
              <User className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Cases</p>
                <p className="text-3xl font-bold text-green-600">
                  {patients.filter(p => p.status === 'Active').length}
                </p>
              </div>
              <Activity className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recovered</p>
                <p className="text-3xl font-bold text-blue-600">
                  {patients.filter(p => p.status === 'Recovered').length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-600">
                  {patients.filter(p => {
                    const date = new Date(p.admissionDate);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, condition, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === 'name' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('age')}
                    className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      Age
                      {sortBy === 'age' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Gender
                  </th>
                  <th
                    onClick={() => handleSort('condition')}
                    className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      Condition
                      {sortBy === 'condition' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Blood Group
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortBy === 'status' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('admissionDate')}
                    className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition"
                  >
                    <div className="flex items-center gap-2">
                      Admission Date
                      {sortBy === 'admissionDate' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No patients found matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-blue-50 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/patient/${patient.id}`}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                        >
                          {patient.name}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {patient.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.bloodGroup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(patient.admissionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/patient/${patient.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedPatients.length} of {patients.length} patients
        </div>
      </div>
    </div>
  );
};

export default Patients;

