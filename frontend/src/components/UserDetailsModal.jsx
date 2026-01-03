import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const UserDetailsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [ formData, setFormData ] = useState({
    birthday: user?.birthday || '',
    sex: user?.sex || '',
    location: user?.location || '',
    religion: user?.religion || '',
    nationality: user?.nationality || '',
    emergencyContact: user?.emergencyContact || '',
    bloodGroup: user?.bloodGroup || '',
    position: user?.position || '',
    hospitalName: user?.hospitalName || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        birthday: user.birthday || '',
        sex: user.sex || '',
        location: user.location || '',
        religion: user.religion || '',
        nationality: user.nationality || '',
        emergencyContact: user.emergencyContact || '',
        bloodGroup: user.bloodGroup || '',
        position: user.position || '',
        hospitalName: user.hospitalName || ''
      });
    }
  }, [ user, isOpen ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [ e.target.name ]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      ...formData,
      additionalDetailsCompleted: true
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-2">
                Birthday *
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                Sex *
              </label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="City, State"
                required
              />
            </div>

            <div>
              <label htmlFor="religion" className="block text-sm font-medium text-gray-700 mb-2">
                Religion
              </label>
              <input
                id="religion"
                name="religion"
                type="text"
                value={formData.religion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter religion"
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                Nationality *
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter nationality"
                required
              />
            </div>

            <div>
              <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                Blood Group
              </label>
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact
              </label>
              <input
                id="emergencyContact"
                name="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Emergency contact number"
              />
            </div>

            {/* Doctor-specific fields */}
            {user?.role === 'DOCTOR' && (
              <>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter position (e.g., surgeon, radiologist, etc.)"
                  />
                </div>

                <div>
                  <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name
                  </label>
                  <input
                    id="hospitalName"
                    name="hospitalName"
                    type="text"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter hospital name"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetailsModal;

