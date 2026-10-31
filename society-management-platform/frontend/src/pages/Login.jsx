import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { Eye, EyeOff, Building2, Wifi, Shield, BarChart3 } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [registration, setRegistration] = useState({
    username: '', password: '', role_name: 'RESIDENT', admin_registration_key: '',
    name: '', phone: '', email: '', flat_id: '',
  });
  const [mode, setMode] = useState('login');
  const [flats, setFlats] = useState([]);
  const [flatsLoading, setFlatsLoading] = useState(false);
  const [flatsError, setFlatsError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadFlats = async () => {
    setFlatsLoading(true);
    setFlatsError('');
    try {
      const { data } = await axios.get('/api/auth/flats');
      setFlats(data);
    } catch {
      setFlatsError('Available flats could not be loaded. Check the API and try again.');
    } finally {
      setFlatsLoading(false);
    }
  };

  const openRegistration = () => {
    setMode('register');
    if (registration.role_name === 'RESIDENT') loadFlats();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        const payload = { ...registration };
        if (payload.role_name === 'RESIDENT') delete payload.admin_registration_key;
        else {
          delete payload.name;
          delete payload.phone;
          delete payload.email;
          delete payload.flat_id;
        }
        await register(payload);
        setCredentials({ username: registration.username, password: registration.password });
        setMode('login');
        addToast('Account created. Sign in with your new credentials.', 'success');
        return;
      }
      await login(credentials.username, credentials.password);
      addToast('Welcome back! Login successful.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const message = mode === 'register'
        ? error.response?.data?.message || error.response?.data?.detail || (!status
          ? 'Cannot reach the API. Check that the backend is running and try again.'
          : 'Account registration failed. Please try again.')
        : status === 401
        ? 'Invalid username or password. Please try again.'
        : !status
          ? 'Cannot reach the API. Check that the backend is running and your phone is on the same Wi-Fi as this computer.'
          : status >= 500
            ? 'The sign-in service is unavailable. Check the backend and database, then try again.'
            : error.response?.data?.detail || error.response?.data?.message || 'Sign-in failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Shield className="w-5 h-5" />, label: 'Secure Gateway' },
    { icon: <Wifi className="w-5 h-5" />, label: 'Real-time Alerts' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Live Analytics' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e40af 100%)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />
        <div className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #34d399, transparent)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-wide">RESIDENT360</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Your community.<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #a5b4fc, #34d399)' }}>
              One platform.
            </span>
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-10">
            Manage maintenance, visitors, facilities, complaints, and financials — all in one elegant dashboard designed for modern residential societies.
          </p>

          <div className="flex gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-indigo-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300">
                  {f.icon}
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          {[28, 25, 6, 8, 4].map((n, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-white">{n}{i === 0 ? '+' : i === 1 ? '+' : i === 2 ? '' : ''}</div>
              <div className="text-indigo-300 text-xs mt-1">{['Residents','Flats','Services','Events','Alerts'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #818cf8, #4f46e5)' }}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">RESIDENT360</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/15 mb-6" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-indigo-900' : 'text-indigo-100 hover:bg-white/10'}`}>
                Sign in
              </button>
              <button type="button" role="tab" aria-selected={mode === 'register'} onClick={openRegistration}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-indigo-900' : 'text-indigo-100 hover:bg-white/10'}`}>
                Create account
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{mode === 'login' ? 'Welcome back' : 'Join your community'}</h2>
            <p className="text-indigo-200 text-sm mb-7">{mode === 'login' ? 'Sign in to your account to continue' : 'Create an admin or resident account'}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="account-type">Account type</label>
                    <select id="account-type" value={registration.role_name}
                      onChange={e => {
                        const roleName = e.target.value;
                        setRegistration({ ...registration, role_name: roleName, flat_id: '' });
                        if (roleName === 'RESIDENT') loadFlats();
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="RESIDENT" className="text-gray-900">Resident</option>
                      <option value="ADMIN" className="text-gray-900">Admin</option>
                    </select>
                  </div>
                  {registration.role_name === 'ADMIN' ? (
                    <div>
                      <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="admin-key">Admin registration key</label>
                      <input id="admin-key" type="password" autoComplete="off" value={registration.admin_registration_key}
                        onChange={e => setRegistration({ ...registration, admin_registration_key: e.target.value })}
                        required placeholder="Provided by your system administrator"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      <p className="text-xs text-indigo-200/80 mt-1.5">Admin signup is available only when the server has enabled registration.</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="resident-name">Full name</label>
                        <input id="resident-name" value={registration.name} onChange={e => setRegistration({ ...registration, name: e.target.value })}
                          required autoComplete="name" placeholder="Your full name"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="resident-phone">Phone</label>
                          <input id="resident-phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" minLength={10} maxLength={10}
                            title="Enter a valid 10-digit Indian mobile number." value={registration.phone}
                            onChange={e => setRegistration({ ...registration, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            required autoComplete="tel-national" placeholder="10-digit mobile number"
                            className="w-full min-w-0 px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="resident-flat">Flat</label>
                          <select id="resident-flat" value={registration.flat_id} onChange={e => setRegistration({ ...registration, flat_id: e.target.value })}
                            required disabled={flatsLoading || flats.length === 0}
                            className="w-full min-w-0 px-3 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                            <option value="" className="text-gray-900">{flatsLoading ? 'Loading...' : 'Select'}</option>
                            {flats.map(flat => <option key={flat.id} value={flat.id} className="text-gray-900">{flat.block} / {flat.flat_number}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="resident-email">Email <span className="font-normal">(optional)</span></label>
                        <input id="resident-email" type="email" value={registration.email} onChange={e => setRegistration({ ...registration, email: e.target.value })}
                          autoComplete="email" placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      </div>
                      {flatsError && <div className="flex items-center justify-between gap-3 text-sm text-rose-200" role="alert">
                        <span>{flatsError}</span><button type="button" onClick={loadFlats} className="underline">Retry</button>
                      </div>}
                      {!flatsLoading && !flatsError && flats.length === 0 && <p className="text-sm text-amber-200" role="status">No unoccupied flats are currently available.</p>}
                    </>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={mode === 'login' ? credentials.username : registration.username}
                  onChange={e => mode === 'login'
                    ? setCredentials({ ...credentials, username: e.target.value })
                    : setRegistration({ ...registration, username: e.target.value })}
                  placeholder={mode === 'login' ? 'e.g. admin1' : 'Choose a username'}
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-200 mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={mode === 'login' ? credentials.password : registration.password}
                    onChange={e => mode === 'login'
                      ? setCredentials({ ...credentials, password: e.target.value })
                      : setRegistration({ ...registration, password: e.target.value })}
                    placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
                    required
                    minLength={mode === 'register' ? 8 : undefined}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent pr-12 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-indigo-300 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: loading ? '#6366f1' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'login' && <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-indigo-300 text-center mb-3 font-medium">DEMO CREDENTIALS</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setCredentials({ username: 'admin1', password: 'password123' })}
                  className="text-xs py-2 px-3 rounded-lg bg-white/10 text-indigo-200 hover:bg-white/20 transition-all font-medium">
                  👤 Admin Login
                </button>
                <button onClick={() => setCredentials({ username: 'resident_a101', password: 'password123' })}
                  className="text-xs py-2 px-3 rounded-lg bg-white/10 text-indigo-200 hover:bg-white/20 transition-all font-medium">
                  🏠 Resident Login
                </button>
              </div>
            </div>}
          </div>

          <p className="text-center text-indigo-300/60 text-xs mt-6">
            RESIDENT360 © 2026 · Secure · Distributed Architecture
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
