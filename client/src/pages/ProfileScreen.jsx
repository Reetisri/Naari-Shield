import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, User, Mail, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-24 pb-12 px-6">
      <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
            Naari Shield
          </span>
        </div>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 border border-white/5 hover:border-purple-500/20 text-xs font-semibold rounded-xl hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </header>

      <div className="max-w-xl mx-auto w-full glass-premium p-8 rounded-2xl space-y-6 relative overflow-hidden mt-12">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-600/10 blur-3xl rounded-full" />
        
        <div className="text-center space-y-2">
          <div className="h-20 w-20 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full mx-auto flex items-center justify-center font-extrabold text-white text-3xl shadow-lg shadow-purple-500/15">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-white mt-4">{user?.name}</h2>
          <span className="inline-flex px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
            Role: {user?.role === 'user' ? 'Woman (User)' : 'Guardian'}
          </span>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
            <Mail className="h-5 w-5 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Email Address</span>
              <span className="text-sm text-slate-200">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
            <Phone className="h-5 w-5 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Phone Number</span>
              <span className="text-sm text-slate-200">{user?.phoneNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/60 border border-white/5 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Account Verification</span>
              <span className="text-sm text-emerald-400 font-semibold">Active & Secured via JWT</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>Naari Shield Safety ID:</span>
          <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded">{user?._id}</span>
        </div>
      </div>
    </div>
  );
}
