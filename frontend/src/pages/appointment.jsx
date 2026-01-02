import React, { useState } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Heart, 
  Bone, 
  Baby, 
  Ear, 
  Activity,
  User,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  Users,
  Hash,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Wallet,
  MapPin,
  Printer
} from 'lucide-react';

// --- MOCK DATA ---
const HOSPITALS = [
  { id: 1, name: 'T.U. Teaching Hospital', location: 'Maharajgunj', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400' },
  { id: 2, name: 'Bir Hospital', location: 'Tundikhel', image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400' },
  { id: 3, name: 'Nepal Mediciti', location: 'Lalitpur', image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400' },
  { id: 4, name: 'HAMS Hospital', location: 'Dhumbarahi', image: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=400' },
  { id: 5, name: 'B&B Hospital', location: 'Gwarko', image: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400' },
  { id: 6, name: 'Norvic Hospital', location: 'Thapathali', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400' },
  { id: 7, name: 'Patan Hospital', location: 'Lagankhel', image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400' },
  { id: 8, name: 'Alka Hospital', location: 'Jawalakhel', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400' }
];

const SPECIALIZATIONS = [
  { id: 1, name: 'General Physician', icon: Stethoscope, color: 'bg-blue-500' },
  { id: 2, name: 'Dietician', icon: Activity, color: 'bg-emerald-500' },
  { id: 3, name: 'ENT', icon: Ear, color: 'bg-purple-500' },
  { id: 4, name: 'Cardiology', icon: Heart, color: 'bg-rose-500' },
  { id: 5, name: 'Orthopedics', icon: Bone, color: 'bg-orange-500' },
  { id: 6, name: 'Pediatrics', icon: Baby, color: 'bg-pink-500' },
  { id: 7, name: 'Dermatology', icon: User, color: 'bg-teal-500' },
  { id: 8, name: 'Gynecology', icon: Activity, color: 'bg-indigo-500' }
];

const DOCTORS = [
  { id: 1, name: 'Dr. Rajesh Sharma', rating: 4.8, experience: '15 years', consultationFee: 1500 },
  { id: 2, name: 'Dr. Sita Poudel', rating: 4.9, experience: '12 years', consultationFee: 1200 },
  { id: 3, name: 'Dr. Anil Thapa', rating: 4.7, experience: '10 years', consultationFee: 1000 }
];

const PAYMENT_METHODS = [
  { id: 1, name: 'eSewa', color: 'bg-[#60BB46]', textColor: 'text-[#60BB46]', logo: '💚' },
  { id: 2, name: 'Khalti', color: 'bg-[#5C2D91]', textColor: 'text-[#5C2D91]', logo: '💜' },
  { id: 3, name: 'Fonepay', color: 'bg-[#ED1C24]', textColor: 'text-[#ED1C24]', logo: '❤️' }
];

const getNextSevenDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      id: i,
      date: date.getDate(),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date
    });
  }
  return days;
};

// Steps Labels Configuration
const STEPS = [
  { id: 1, label: 'Facility' },
  { id: 2, label: 'Specialist' },
  { id: 3, label: 'Schedule' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Token' }
];

export default function HospitalBookingFlow() {
  const [step, setStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const dates = getNextSevenDays();

  const handlePaymentSubmit = () => {
    if (!selectedPayment) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(5);
    }, 1500);
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedHospital(null);
    setSelectedSpecialization(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedPayment(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Hospital Appointment
          </h1>
          <p className="text-slate-500">Book your consultation in a few simple steps</p>
        </div>

        {/* --- PROGRESS STEPPER (With Short Labels) --- */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full" />
            
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center group">
                {/* Circle Number */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-sm border-2
                  ${step >= s.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-400'}`}>
                  {step > s.id ? <CheckCircle size={20} /> : s.id}
                </div>
                {/* Short Label */}
                <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider transition-colors
                  ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- STEP 1: HOSPITAL SELECTION --- */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold mb-8 text-slate-800 text-center">Select a Facility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {HOSPITALS.map((hospital) => (
                <div key={hospital.id} 
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all overflow-hidden cursor-pointer"
                  onClick={() => { setSelectedHospital(hospital); setStep(2); }}
                >
                  <div className="h-40 overflow-hidden relative">
                    <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-teal-700 shadow-sm flex items-center gap-1">
                      <MapPin size={10} /> {hospital.location.split(',')[0]}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 text-lg mb-4 group-hover:text-indigo-600 transition-colors">{hospital.name}</h3>
                    <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center">
                      Select Facility <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 2: SPECIALIZATION --- */}
        {step === 2 && (
          <div className="animate-fadeIn max-w-4xl mx-auto">
            <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">
              <ArrowLeft size={18} /> Back to Hospitals
            </button>
            
            {/* Selected Context Card */}
            <div className="bg-white border-l-4 border-l-teal-500 rounded-xl p-6 mb-8 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Facility</p>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-teal-500"/> {selectedHospital?.name}
                </h3>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Select Department</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SPECIALIZATIONS.map((spec) => {
                const Icon = spec.icon;
                return (
                  <button key={spec.id} 
                    onClick={() => { setSelectedSpecialization(spec); setStep(3); }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all text-center group"
                  >
                    <div className={`${spec.color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                      <Icon size={28} />
                    </div>
                    <span className="font-bold text-slate-700 block text-sm">{spec.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- STEP 3: DOCTOR & DATE --- */}
        {step === 3 && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">
              <ArrowLeft size={18} /> Back to Departments
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Doctor List */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Available Specialists</h2>
                <div className="space-y-4">
                  {DOCTORS.map((doc) => (
                    <div key={doc.id} onClick={() => setSelectedDoctor(doc)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 bg-white
                      ${selectedDoctor?.id === doc.id ? 'border-indigo-600 ring-4 ring-indigo-50 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-black text-xl border border-slate-200">
                        {doc.name.split(' ')[1][0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-lg">{doc.name}</h4>
                        <p className="text-sm text-teal-600 font-medium mb-2">{selectedSpecialization?.name}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md">
                            <Star size={12} fill="currentColor" /> {doc.rating}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                            <Clock size={12} /> {doc.experience} exp
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-indigo-600">रू {doc.consultationFee}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Per Visit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Select Date</h2>
                <div className="grid grid-cols-3 gap-2">
                  {dates.map((d) => (
                    <button key={d.id} onClick={() => setSelectedDate(d)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all h-24
                      ${selectedDate?.id === d.id 
                        ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-teal-300 text-slate-600'}`}
                    >
                      <span className="text-[10px] font-bold uppercase mb-1 opacity-70">{d.day}</span>
                      <span className="text-2xl font-black leading-none mb-1">{d.date}</span>
                      <span className="text-[10px] font-bold uppercase text-indigo-500">{d.month}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-slate-100 rounded-xl p-4 mt-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500">Doctor</span>
                    <span className="font-bold text-slate-900">{selectedDoctor ? selectedDoctor.name : '-'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-900">{selectedDate ? `${selectedDate.month} ${selectedDate.date}, ${selectedDate.day}` : '-'}</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center">
                    <span className="text-slate-600 font-bold">Total Fee</span>
                    <span className="font-black text-indigo-600 text-lg">रू {selectedDoctor ? selectedDoctor.consultationFee : 0}</span>
                  </div>
                </div>

                <button onClick={() => setStep(4)} disabled={!selectedDoctor || !selectedDate}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 4: PAYMENT GATEWAY --- */}
        {step === 4 && (
          <div className="animate-fadeIn max-w-xl mx-auto">
            <button onClick={() => setStep(3)} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">
              <ArrowLeft size={18} /> Back to Scheduling
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Secure Payment</h2>
              <p className="text-slate-500 text-sm">Complete payment to generate your token</p>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              {/* Payment Header */}
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Amount to Pay</p>
                   <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-black">रू {selectedDoctor?.consultationFee}</span>
                     <span className="text-sm font-medium text-slate-400">NPR</span>
                   </div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CreditCard className="text-white" />
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Wallet size={18} className="text-indigo-600" /> Select Wallet
                </p>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button key={method.id} onClick={() => setSelectedPayment(method)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all group
                      ${selectedPayment?.id === method.id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform`}>
                          {method.logo}
                        </span>
                        <span className="font-bold text-slate-800 text-lg">{method.name}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${selectedPayment?.id === method.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                        {selectedPayment?.id === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-4">
                    <ShieldCheck size={14} className="text-teal-500"/> 
                    Secured by 256-bit Encryption
                  </div>
                  <button onClick={handlePaymentSubmit} disabled={!selectedPayment || isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Pay & Get Token <ChevronRight size={18}/></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 5: LIVE TOKEN (QUEUE STATUS) --- */}
        {step === 5 && (
          <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
            
            {/* Success Banner */}
            <div className="bg-teal-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-teal-200">
              <div>
                <h2 className="text-2xl font-black mb-1">Booking Confirmed!</h2>
                <p className="text-teal-100 font-medium text-sm">Payment successful via {selectedPayment?.name}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle size={28} className="text-white" />
              </div>
            </div>

            {/* Digital Token Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
              {/* Top Decorative Bar (Purplish-blue) */}
              <div className="h-3 w-full bg-indigo-600" />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Token Number</h3>
                    {/* Distinct Color: Gradient Text */}
                    <p className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
                      #A-42
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold mb-2 border border-teal-100">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" /> LIVE STATUS
                    </div>
                    <p className="text-slate-400 text-xs font-medium">Updated: Just now</p>
                  </div>
                </div>

                {/* Queue Stats Grid */}
                <div className="grid grid-cols-3 gap-4 py-8 border-y border-dashed border-slate-200 bg-slate-50/50 rounded-xl px-4 mb-8">
                  <div className="text-center">
                    <Users className="mx-auto mb-2 text-indigo-500" size={24} />
                    <p className="text-2xl font-black text-slate-800">4</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Ahead</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <Clock className="mx-auto mb-2 text-indigo-500" size={24} />
                    <p className="text-2xl font-black text-slate-800">25</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Mins</p>
                  </div>
                  <div className="text-center border-l border-slate-200">
                    <Hash className="mx-auto mb-2 text-indigo-500" size={24} />
                    <p className="text-2xl font-black text-slate-800">102</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Room</p>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium">Patient Name</span>
                     <span className="font-bold text-slate-900">Guest User</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium">Doctor</span>
                     <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500 font-medium">Date</span>
                     <span className="font-bold text-slate-900">
                       {selectedDate?.day}, {selectedDate?.month} {selectedDate?.date}
                     </span>
                   </div>
                </div>
              </div>
              
              {/* Bottom Action Bar */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex gap-3">
                <button onClick={() => window.print()} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm">
                  <Printer size={16} /> Save Ticket
                </button>
                <button onClick={resetFlow} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-100">
                  Book Another
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}