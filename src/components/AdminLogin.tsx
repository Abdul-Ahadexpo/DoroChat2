import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLogin({ onLogin, isOpen, onClose }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, use proper authentication
    if (password === '69') {
      onLogin();
      setPassword('');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6 border border-slate-700 animate-scale-in hover-lift">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-purple-100 p-1.5 md:p-2 rounded-full animate-bounce-in">
              <Lock size={20} className="text-purple-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">Admin Login</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all duration-200 hover-lift focus-ring rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 md:p-3 border border-slate-600 rounded-lg focus-ring pr-10 md:pr-12 bg-slate-700 text-white placeholder-slate-400 transition-all duration-200 text-sm md:text-base"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-all duration-200 hover-lift focus-ring rounded p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs md:text-sm mt-2 animate-slide-in">{error}</p>}
           
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 md:py-3 rounded-lg transition-all duration-200 font-medium hover-lift focus-ring text-sm md:text-base"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
