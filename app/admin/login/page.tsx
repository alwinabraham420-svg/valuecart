'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(password, email.trim());
      if (success) {
        router.push('/admin');
      } else {
        setError(
          'Invalid admin credentials. Please ensure the admin user exists in your Supabase Auth (Dashboard > Authentication > Users) with "Auto Confirm" checked.'
        );
        setLoading(false);
      }
    } catch {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-valuecart-navy flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-valuecart-green/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-valuecart-navy-light/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-gray-100">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="relative w-11 h-11 shrink-0">
              <Image
                src="/images/valuecart-logo.png"
                alt="ValueCart Logo"
                width={44}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black text-3xl tracking-tight text-valuecart-navy leading-none">
              Value<span className="text-valuecart-green">Cart</span>
            </span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-valuecart-green bg-valuecart-green-tint px-3 py-1 rounded-full">
            Operations &amp; Admin Portal
          </span>
          <h1 className="text-xl font-black text-valuecart-navy mt-3">
            Sign In to ValueCart Admin
          </h1>
          <p className="text-xs text-valuecart-text-muted mt-1">
            Access order fulfillment, supplier workflow &amp; profit analytics
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alwinabraham420@gmail.com"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-xs sm:text-sm text-valuecart-navy focus:outline-none focus:ring-2 focus:ring-valuecart-green"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-valuecart-green hover:bg-valuecart-green-dark active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-valuecart-text-muted">
          <ShieldCheck className="w-4 h-4 text-valuecart-green" />
          <span>Internal ValueCart Staff &amp; Operations Only</span>
        </div>

      </div>
    </div>
  );
}
