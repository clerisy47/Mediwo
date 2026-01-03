import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserDetailsModal from '../components/UserDetailsModal';

const Profile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [patientData, setPatientData] = useState([]);
  const [ appointmentData, setAppointmentData ] = useState([]);
  
  // const myAppointment = appointmentData?.map((app)=>app.patientName==user.name)

  useEffect(() => {
    // Show modal if user just registered and hasn't completed additional details
    if (user && !user.additionalDetailsCompleted) {
      setShowModal(true);
    }
  }, [user]);

  useEffect(() => {
    // Load patientData from localStorage whenever location changes (navigation to profile)
    const loadPatientData = () => {
      const storedPatientData = localStorage.getItem('patientData');
      if (storedPatientData) {
        setPatientData(JSON.parse(storedPatientData));
      } else {
        setPatientData([]);
      }
    };

    // Load appointmentData from localStorage
    const loadAppointmentData = () => {
      const storedAppointmentData = localStorage.getItem('appointmentData');
      if (storedAppointmentData) {
        let appData = (JSON.parse(storedAppointmentData));
        let sortedAppData = appData.sort((a,b)=>a.date.fullDate.localeCompare(b.date.fullDate))
        setAppointmentData(sortedAppData)
      } else {
        setAppointmentData([]);
      }
    };

    loadPatientData();
    loadAppointmentData();
  }, [ location.pathname ]);
  
  console.log("app",appointmentData)


  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'DOCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'PATIENT':
        return 'bg-purple-100 text-purple-800';
      case 'NURSE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine which image to use based on role
  const getProfileImage = () => {
    if (user.role === 'DOCTOR') {
      return '/images/doctor.jpg';
    } else if (user.role === 'PATIENT') {
      return '/images/patient.jpg';
    }
    return '/images/patient.jpg'; // default
  };

  return (
    <>
    {showModal && <UserDetailsModal isOpen={showModal} onClose={() => setShowModal(false)} />}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-center items-center gap-6 mb-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={getProfileImage()}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/128';
                }}
              />
            </div>

            <div className='flex-1 flex justify-between'>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-800">{user.name == 'Doctor' ? "Dr. Ramesh Sherpa" : user.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-gray-600">{user.position || 'Staff Member'}</p>
              </div>
              <div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">Edit Profile</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg text-gray-800">{user.phone || 'N/A'}</p>
              </div>
                {
                  user.role == 'DOCTOR' && (
                    <div>
                <label className="text-sm font-medium text-gray-500">Primary Hospital Name</label>
                <p className="text-lg text-gray-800">{user.hospitalName || 'N/A'}</p>
              </div>
                  )
              }
              {user.birthday && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Birthday</label>
                  <p className="text-lg text-gray-800">{new Date(user.birthday).toLocaleDateString()}</p>
                </div>
              )}
              {user.sex && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Sex</label>
                  <p className="text-lg text-gray-800">{user.sex}</p>
                </div>
              )}
            {user.emergencyContact && (
              <div className="">
                <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                <p className="text-lg text-gray-800">{user.emergencyContact}</p>
              </div>
            )}
            </div>

            <div className="space-y-4">
              {user.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-lg text-gray-800">{user.location}</p>
                </div>
              )}
              {user.nationality && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p className="text-lg text-gray-800">{user.nationality}</p>
                </div>
              )}
              {user.religion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Religion</label>
                  <p className="text-lg text-gray-800">{user.religion}</p>
                </div>
              )}
              {user.bloodGroup && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p className="text-lg text-gray-800">{user.bloodGroup}</p>
                </div>
              )}
            </div>
          </div>


          </div>
          
          {/* Booked Appointments Section (for DOCTOR role) */}
        {user.role === 'DOCTOR' && (appointmentData && appointmentData.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Booked Appointments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointmentData.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {appointment.tokenNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patientName || 'Guest User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.hospital?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.specialization?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.date ? `${appointment.date.day}, ${appointment.date.month} ${appointment.date.date}, ${appointment.date.fullDate.split('T')[1].slice(0,5)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        रू {appointment.consultationFee || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {appointment.paymentMethod?.name || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Booked Appointments</h3>
              <p className='text-gray-700 text-center'>No appointments today.</p>
            </div>
          ))}
          
          {/* appointmentn for patients */}
          {user.role === 'PATIENT' && (appointmentData && appointmentData.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">My Booked Appointments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointmentData.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                        {appointment.tokenNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.hospital?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.specialization?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.doctor?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.date ? `${appointment.date.day}, ${appointment.date.month} ${appointment.date.date} , ${appointment.date.fullDate.split('T')[1].slice(0,5)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        रू {appointment.consultationFee || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {appointment.paymentMethod?.name || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Booked Appointments</h3>
              <p className='text-gray-700 text-center'>You booked appointments today.</p>
            </div>
        ))}

        {/* Patients Section (for DOCTOR role) */}
        {user.role === 'DOCTOR' && user.patients && user.patients.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">My Patients</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {user.patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link to={`/patient/${patient.name.toLowerCase().replace(/\s+/g, '-')}`}>{patient.name}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {patient.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(patient.admissionDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

        {/* Patient Data Section (Reports/Images) */}
        {patientData && patientData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Patient Reports & Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patientData.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="mb-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-800 mb-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-gray-500">Date: {new Date(item.date).toLocaleDateString()}</p>
                  )}
                  {item.patientName && (
                    <p className="text-xs text-gray-500 mt-1">Patient: {item.patientName}</p>
                  )}
                  {item.reportType && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {item.reportType}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      </>
  );
};

export default Profile;

