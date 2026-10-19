import React, { useState } from 'react';
import {
  IconShield,
  IconCalculator,
  IconUsers,
  IconCheck,
  IconInvoice
} from '../components/Icons';

export function LoginPage({ users, company, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === trimmedEmail &&
          (u.password === password || (!u.password && password === '123456'))
      );

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('Invalid email or password. Please check your credentials or use the demo accounts below.');
        setIsLoading(false);
      }
    }, 400);
  };

  const fillDemoAccount = (role) => {
    setErrorMessage('');
    const user = users.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password || (role === 'Admin' ? 'admin' : role === 'Accountant' ? 'acct123' : 'user123'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo & Header */}
        <div className="w-20 h-20 rounded-2xl bg-white border border-blue-100 p-2 flex items-center justify-center shadow-md shadow-blue-500/10 mx-auto mb-3">
          <img src="/logo.png" alt="SB Logo" className="w-full h-full object-contain" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 card-shadow">
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter the login credentials created by your Administrator
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 leading-snug">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.in"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 uppercase">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Quick 1-Click Role Login
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('Admin')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-center transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-1">
                  <IconShield className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-blue-900">Admin</div>
                <div className="text-[9px] text-blue-600 truncate">admin@sb.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('Accountant')}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-center transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center mx-auto mb-1">
                  <IconCalculator className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-indigo-900">Accountant</div>
                <div className="text-[9px] text-indigo-600 truncate">ananya@sb.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('User')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center mx-auto mb-1">
                  <IconUsers className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900">Staff</div>
                <div className="text-[9px] text-slate-500 truncate">rohan@sb.in</div>
              </button>
            </div>
          </div>

        </div>

        {/* Security / Admin Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Admins can manage or add staff & accountant logins from the <strong className="text-slate-600">Staff & Roles</strong> tab inside the application.
        </p>
      </div>

    </div>
  );
}
