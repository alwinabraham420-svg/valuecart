'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { user, signIn, signUp, loading: authLoading } = useAuth();

  const initialMode = searchParams.get('tab') === 'signup' || searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If user is already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectPath);
    }
  }, [user, authLoading, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const cleanMobile = mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      setSubmitting(true);
      const res = await signUp(email.trim(), password, fullName.trim(), cleanMobile);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error.message || 'Failed to create account. Please try again.');
      } else {
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.replace(redirectPath);
        }, 800);
      }
    } else {
      // Sign In
      setSubmitting(true);
      const res = await signIn(email.trim(), password);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error.message || 'Invalid email or password. Please check your credentials.');
      } else {
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => {
          router.replace(redirectPath);
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-valuecart-navy text-white mb-2 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-valuecart-navy tracking-tight">
            {mode === 'signin' ? 'Sign in to ValueCart' : 'Create Customer Account'}
          </h1>
          <p className="text-xs text-valuecart-text-muted">
            {redirectPath.includes('checkout')
              ? 'Sign in or register to complete your order securely'
              : 'Access your order history, delivery tracking, and saved wishlist'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-valuecart-navy shadow-xs'
                : 'text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-valuecart-navy shadow-xs'
                : 'text-valuecart-text-muted hover:text-valuecart-navy'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-valuecart-navy focus:ring-1 focus:ring-valuecart-navy transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                  Mobile Number (India +91)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-valuecart-navy focus:ring-1 focus:ring-valuecart-navy transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-valuecart-navy focus:ring-1 focus:ring-valuecart-navy transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-valuecart-navy focus:ring-1 focus:ring-valuecart-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <span>Processing...</span>
            ) : mode === 'signin' ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create ValueCart Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-[11px] text-valuecart-text-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-valuecart-green" />
            <span>Encrypted Supabase Auth</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span>Verified Orders</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
