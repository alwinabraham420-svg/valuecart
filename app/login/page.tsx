'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { user, signIn, signUp, loading: authLoading } = useAuth();

  const initialMode =
    searchParams.get('tab') === 'signup' || searchParams.get('mode') === 'signup'
      ? 'signup'
      : 'signin';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Message states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Existing account alert with convenient Sign In CTA
  const [showExistingAccountOptions, setShowExistingAccountOptions] = useState(false);

  // Synchronous lock to prevent double clicks / rapid repeated requests
  const isSubmittingRef = useRef(false);

  // If user is already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectPath);
    }
  }, [user, authLoading, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Prevent duplicate submission / double clicks
    if (isSubmittingRef.current) return;

    setErrorMsg('');
    setSuccessMsg('');
    setShowExistingAccountOptions(false);

    // 2. Validate and sanitize inputs
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      const cleanFullName = fullName.trim();
      if (!cleanFullName) {
        setErrorMsg('Please enter your full name.');
        return;
      }

      const cleanMobile = mobile.replace(/\D/g, '');
      const indianPhoneRegex = /^[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(cleanMobile)) {
        setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).');
        return;
      }

      if (!password) {
        setErrorMsg('Please enter a password.');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      // Lock submission
      isSubmittingRef.current = true;
      setSubmitting(true);

      try {
        const res = await signUp(cleanEmail, password, cleanFullName, cleanMobile);

        if (res.error) {
          const errMsg = res.error.message || '';
          const status = (res.error as any).status;
          const code = (res.error as any).code;

          if (
            code === 'user_already_exists' ||
            code === 'email_exists' ||
            errMsg.toLowerCase().includes('already exists') ||
            errMsg.toLowerCase().includes('already registered')
          ) {
            setErrorMsg('An account with this email already exists. Please sign in instead.');
            setShowExistingAccountOptions(true);
          } else if (code === 'weak_password') {
            setErrorMsg('Password must be at least 6 characters long.');
          } else if (code === 'email_address_invalid') {
            setErrorMsg('Please enter a valid, deliverable email address.');
          } else if (
            status === 429 ||
            code === 'over_email_send_rate_limit' ||
            errMsg.includes('rate limit') ||
            errMsg.includes('seconds')
          ) {
            setErrorMsg('Too many attempts. Please wait a moment and try again.');
          } else if (code === 'email_not_confirmed' || errMsg.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Email verification is required by your Supabase project settings. In your Supabase Dashboard, go to Authentication > Providers > Email and turn "Confirm email" OFF for instant signups.');
          } else {
            setErrorMsg(errMsg || 'Failed to create account. Please verify your details.');
          }
        } else {
          // Account created and immediately authenticated
          setSuccessMsg('Account created successfully! Signing you in...');
          setTimeout(() => {
            router.replace(redirectPath);
          }, 600);
        }
      } catch {
        setErrorMsg('Unable to connect right now. Please check your internet connection and try again.');
      } finally {
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
    } else {
      // Sign In Flow
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }

      isSubmittingRef.current = true;
      setSubmitting(true);

      try {
        const res = await signIn(cleanEmail, password);

        if (res.error) {
          const errMsg = res.error.message || '';
          const status = (res.error as any).status;
          const code = (res.error as any).code;

          if (code === 'invalid_credentials' || errMsg.toLowerCase().includes('invalid login credentials')) {
            setErrorMsg('Email or password is incorrect. Please verify your credentials or reset your password.');
          } else if (code === 'email_not_confirmed' || errMsg.toLowerCase().includes('email not confirmed')) {
            setErrorMsg('Email verification is required by your Supabase project settings. Please turn off "Confirm email" in your Supabase Dashboard (Authentication > Providers > Email).');
          } else if (
            status === 429 ||
            code === 'over_email_send_rate_limit' ||
            errMsg.includes('rate limit') ||
            errMsg.includes('seconds')
          ) {
            setErrorMsg('Too many attempts. Please wait a moment and try again.');
          } else {
            setErrorMsg(errMsg || 'Unable to sign in. Please verify your credentials or reset your password.');
          }
        } else {
          setSuccessMsg('Signed in successfully! Redirecting...');
          setTimeout(() => {
            router.replace(redirectPath);
          }, 500);
        }
      } catch {
        setErrorMsg('Unable to connect right now. Please check your internet connection and try again.');
      } finally {
        isSubmittingRef.current = false;
        setSubmitting(false);
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
              setShowExistingAccountOptions(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
              setShowExistingAccountOptions(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>

            {/* Existing Account Action Links */}
            {showExistingAccountOptions && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                    setShowExistingAccountOptions(false);
                  }}
                  className="px-3.5 py-1.5 bg-valuecart-navy text-white text-[11px] font-bold rounded-lg hover:bg-valuecart-navy-light transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <Link
                  href="/forgot-password"
                  className="px-3 py-1 bg-white border border-gray-300 text-valuecart-navy text-[11px] font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Forgot Password
                </Link>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-xs font-semibold text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-valuecart-navy">
                Password
              </label>
              {mode === 'signin' && (
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-valuecart-navy hover:text-valuecart-green transition-colors"
                >
                  Forgot Password?
                </Link>
              )}
            </div>
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
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
