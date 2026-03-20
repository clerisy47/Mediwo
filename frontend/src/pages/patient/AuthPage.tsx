import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MediwoLogo } from '../../components/ui/MediwoLogo';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="auth-page">
      <NavLink to="/" className="logo-link">
        <MediwoLogo />
      </NavLink>

      <section className="auth-card">
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

        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p>Use your email or phone number to continue securely.</p>

        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Email or Phone
            <input type="text" placeholder="name@example.com or +91" required />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" required />
          </label>
          {mode === 'signup' && (
            <label>
              Confirm Password
              <input type="password" placeholder="••••••••" required />
            </label>
          )}
          <Button type="submit" fullWidth>
            {mode === 'login' ? 'Login to Dashboard' : 'Create Account'}
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
