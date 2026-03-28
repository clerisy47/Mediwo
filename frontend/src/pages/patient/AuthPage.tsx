import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MediwoLogo } from '../../components/ui/MediwoLogo';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const endpoint = userType === 'patient' 
          ? '/api/auth/register/patient' 
          : '/api/auth/register/doctor';

        const payload = userType === 'patient' 
          ? {
              username: formData.username,
              password: formData.password,
              full_name: formData.fullName
            }
          : {
              username: formData.username,
              password: formData.password,
              full_name: formData.fullName,
              specialization: formData.specialization
            };

        const response = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Registration successful! Please login.');
          setMode('login');
        } else {
          setError(data.detail || 'Registration failed');
        }
      } else {
        const response = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store user info in localStorage (simplified for demo)
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on user role
          if (data.user.role === 'doctor') {
            navigate('/doctor/queue');
          } else {
            navigate('/patient/dashboard');
          }
        } else {
          setError(data.detail || 'Login failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <NavLink to="/" className="logo-link">
        <MediwoLogo />
      </NavLink>

      <section className="auth-card">
        {mode === 'signup' && (
          <div className="user-type-toggle" style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '15px' }}>
              <input
                type="radio"
                name="userType"
                value="patient"
                checked={userType === 'patient'}
                onChange={(e) => setUserType(e.target.value as 'patient' | 'doctor')}
              />
              Patient
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="doctor"
                checked={userType === 'doctor'}
                onChange={(e) => setUserType(e.target.value as 'patient' | 'doctor')}
              />
              Doctor
            </label>
          </div>
        )}

        <div className="auth-toggle" role="tablist" aria-label="Authentication modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'auth-tab auth-tab-active' : 'auth-tab'}
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

        <h1>{mode === 'login' ? 'Welcome back' : `Create your ${userType} account`}</h1>
        <p>{mode === 'login' ? 'Enter your credentials to access your account.' : 'Fill in the details to create a new account.'}</p>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid #ff6b6b', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </label>

          {mode === 'signup' && (
            <label>
              Full Name
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </label>
          )}

          {mode === 'signup' && userType === 'doctor' && (
            <label>
              Specialization
              <input
                type="text"
                name="specialization"
                placeholder="e.g., General Practitioner, Cardiologist"
                value={formData.specialization}
                onChange={handleInputChange}
              />
            </label>
          )}

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </label>

          {mode === 'signup' && (
            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </label>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </Button>
        </form>

        <div className="auth-footer-links">
          <NavLink to="/patient/dashboard">Continue as Demo Patient</NavLink>
          <NavLink to="/doctor/queue">Doctor Demo</NavLink>
          <NavLink to="/admin">Admin Demo</NavLink>
        </div>
      </section>
    </div>
  );
}
