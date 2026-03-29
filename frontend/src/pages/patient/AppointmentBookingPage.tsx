import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';

interface Doctor {
  id: string;
  username: string;
  full_name: string;
  specialization: string;
}

type AsyncState = 'empty' | 'processing' | 'success' | 'error';

export function AppointmentBookingPage() {
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [bookingState, setBookingState] = useState<AsyncState>('empty');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  useEffect(() => {
    fetchAvailableDoctors();
  }, []);

  const fetchAvailableDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/doctors/available');
      const data = await response.json();
      
      if (data.success) {
        setAvailableDoctors(data.doctors);
        if (data.doctors.length > 0) {
          setSelectedDoctor(data.doctors[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Failed to load available doctors');
    }
  };

  const submitBooking = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please login first');
      return;
    }

    if (!selectedDoctor) {
      setError('Please select a doctor');
      return;
    }

    setBookingState('processing');
    setError('');

    try {
      // Add patient to doctor's queue
      const response = await fetch('http://localhost:8000/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          patient_id: currentUser.id,
          patient_name: currentUser.full_name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('selectedDoctorId', selectedDoctor.id);
        setBookingState('success');
        // Redirect to queue page after successful booking
        setTimeout(() => {
          navigate('/patient/queue');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to book appointment');
        setBookingState('error');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setBookingState('error');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Book Appointment"
        description="Select a doctor and time slot to join their queue."
      />

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      <Card>
        <form className="booking-form" onSubmit={(event) => { event.preventDefault(); submitBooking(); }}>
          <label>
            Select Doctor
            <select 
              value={selectedDoctor?.id || ''} 
              onChange={(event) => {
                const doctor = availableDoctors.find(d => d.id === event.target.value);
                setSelectedDoctor(doctor || null);
              }}
              required
            >
              {availableDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.full_name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </label>

          {selectedDoctor && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: '20px'
            }}>
              <h4>Doctor Details</h4>
              <p><strong>Name:</strong> Dr. {selectedDoctor.full_name}</p>
              <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
            </div>
          )}

          <label>
            Preferred Time Slot
            <select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)}>
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
            </select>
          </label>

          <Button type="submit" disabled={bookingState === 'processing' || !selectedDoctor}>
            {bookingState === 'processing' ? 'Booking...' : 'Book Appointment & Join Queue'}
          </Button>
        </form>
      </Card>

      {bookingState === 'processing' && <StateView state="processing" />}
      {bookingState === 'success' && (
        <StateView
          state="success"
          title="Appointment confirmed"
          description={`You have been added to Dr. ${selectedDoctor?.full_name}'s queue. Redirecting to queue status...`}
        />
      )}
      {bookingState === 'error' && (
        <StateView
          state="error"
          title="Booking failed"
          description="Please try again or contact support."
        />
      )}
    </div>
  );
}
