import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from 'notistack';

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Upload = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    patientName: '',
    reportType: '',
    image: null,
    imagePreview: null
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setError('');
      
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
      enqueueSnackbar('Image selected', { variant: 'success' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title || !formData.image) {
      setError('Please fill in title and select an image');
      return;
    }

    const data = new FormData();
    data.append('file', formData.image);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('patientName', formData.patientName || user?.name || 'Unknown');
    data.append('reportType', formData.reportType || 'General');
    data.append('uploadedBy', user?.username || 'Unknown');

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          date: '',
          patientName: '',
          reportType: '',
          image: null,
          imagePreview: null
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to upload report. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload Patient Report</h1>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Report uploaded successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter report title (e.g., X-Ray Report, Blood Test)"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter description or notes about the report"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  id="patientName"
                  name="patientName"
                  defaultValue={user?.name}
                  type="text"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Patient name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                id="reportType"
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select report type</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Blood Test">Blood Test</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="ECG">ECG</option>
                <option value="Prescription">Prescription</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Report Image *
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-2 text-xs text-gray-500">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
            </div>

            {formData.imagePreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="max-w-full h-64 object-contain mx-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    date: '',
_                    patientName: '',
                    reportType: '',
                    image: null,
                    imagePreview: null
                  });
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Upload Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;

