import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StateView } from '../../components/ui/StateView';
import { departmentOptions, doctorByDepartment, slotOptions } from '../../data/mockData';
import type { AsyncState } from '../../types/models';

export function AppointmentBookingPage() {
  const [department, setDepartment] = useState(departmentOptions[0]);
  const [doctor, setDoctor] = useState(doctorByDepartment[departmentOptions[0]][0]);
  const [timeSlot, setTimeSlot] = useState(slotOptions[2]);
  const [bookingState, setBookingState] = useState<AsyncState>('empty');

  const doctorOptions = useMemo(() => doctorByDepartment[department] ?? [], [department]);

  const onDepartmentChange = (value: string) => {
    setDepartment(value);
    const nextDoctors = doctorByDepartment[value];
    if (nextDoctors && nextDoctors.length > 0) {
      setDoctor(nextDoctors[0]);
    }
  };

  const submitBooking = () => {
    setBookingState('processing');

    window.setTimeout(() => {
      setBookingState('success');
    }, 900);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Book Appointment"
        description="Select department, doctor, and time slot before confirming your OPD visit."
      />

      <Card>
        <form className="booking-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Department
            <select value={department} onChange={(event) => onDepartmentChange(event.target.value)}>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>

          <label>
            Doctor
            <select value={doctor} onChange={(event) => setDoctor(event.target.value)}>
              {doctorOptions.map((doctorOption) => (
                <option key={doctorOption} value={doctorOption}>
                  {doctorOption}
                </option>
              ))}
            </select>
          </label>

          <label>
            Time Slot
            <select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)}>
              {slotOptions.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>

          <Button type="button" onClick={submitBooking}>
            Confirm Appointment
          </Button>
        </form>
      </Card>

      {bookingState === 'processing' && <StateView state="processing" />}
      {bookingState === 'success' && (
        <StateView
          state="success"
          title="Appointment confirmed"
          description={`Booked with ${doctor} (${department}) at ${timeSlot}.`}
        />
      )}
    </div>
  );
}
