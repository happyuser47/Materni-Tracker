import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please try again.'
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40 px-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-100/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/60 border border-white/60 p-8 md:p-10">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-5 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MaterniTrack</h1>
            <p className="text-sm text-slate-500 mt-1.5">Maternal Health Tracking System</p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Sign In</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50/80 border border-red-200/60 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-400"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 placeholder:text-slate-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-teal-400 disabled:to-emerald-400 text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-teal-200/40 hover:shadow-teal-300/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Secure access for authorized personnel only.
        </p>
      </div>
    </div>
  );
}
