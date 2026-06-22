import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User as UserIcon, Phone, AlertCircle, Users, GraduationCap } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user'); // Default: user
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phoneNumber) {
      setError('Please fill in all fields');
      return;
    }

    // Check if email domain is authorized
    const allowedDomains = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 
      'aol.com', 'zoho.com', 'proton.me', 'protonmail.com', 'yandex.com', 
      'live.com', 'gmx.com', 'mail.com'
    ];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!allowedDomains.includes(emailDomain)) {
      setError('Registration is restricted to authorized email domains (e.g., @gmail.com, @yahoo.com, @outlook.com). Mock or temporary domains are not allowed.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await register(name, email, password, phoneNumber, role);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/15 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
              Naari Shield
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Create Account</h2>
          <p className="text-slate-400 text-sm">Join the protective women's safety ecosystem</p>
        </div>

        <div className="glass-premium p-8 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm flex items-start gap-2 animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('user')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                    role === 'user'
                      ? 'border-purple-500 bg-purple-500/15 text-white shadow-lg shadow-purple-500/5'
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:bg-slate-900/60'
                  }`}
                >
                  <UserIcon className={`h-6 w-6 ${role === 'user' ? 'text-purple-400' : ''}`} />
                  <span className="text-sm font-bold">Woman (User)</span>
                  <span className="text-[10px] text-slate-500 text-center">Triggers SOS & shares tracking</span>
                </div>

                <div
                  onClick={() => setRole('guardian')}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                    role === 'guardian'
                      ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-lg shadow-indigo-500/5'
                      : 'border-white/5 bg-slate-900/40 text-slate-400 hover:bg-slate-900/60'
                  }`}
                >
                  <Users className={`h-6 w-6 ${role === 'guardian' ? 'text-indigo-400' : ''}`} />
                  <span className="text-sm font-bold">Guardian</span>
                  <span className="text-[10px] text-slate-500 text-center">Receives alerts & tracks live updates</span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-sm"
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-sm"
                  placeholder="jane@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all placeholder:text-slate-600 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white text-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-semibold hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
