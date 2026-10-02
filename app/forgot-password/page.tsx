'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function ForgotPasswordContent() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || cooldown > 0) return;

    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await resetPasswordForEmail(cleanEmail);

      if (res.error) {
        const errMsg = res.error.message || '';
        const status = (res.error as any).status;
        const code = (res.error as any).code;

        if (status === 429 || code === 'over_email_send_rate_limit' || errMsg.includes('rate limit') || errMsg.includes('seconds')) {
          setErrorMsg('Too many requests. Please wait a few minutes before requesting another reset link.');
        } else {
          setErrorMsg('Unable to send reset email. Please verify your email and try again.');
        }
      } else {
        setSubmittedEmail(cleanEmail);
        setSuccessMsg(`We've sent a password reset link to ${cleanEmail}. Please check your inbox and spam folder.`);
        setCooldown(60);
      }
    } catch {
      setErrorMsg('Unable to connect right now. Please check your internet connection and try again.');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-valuecart-border shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-valuecart-navy text-white mb-2 shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-valuecart-navy tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-valuecart-text-muted">
            Enter your registered email address and we will send you a secure link to reset your password.
          </p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-valuecart-green shrink-0 mt-0.5" />
              <p className="font-semibold text-green-900 leading-relaxed">
                {successMsg}
              </p>
            </div>
            {cooldown > 0 && (
              <p className="text-[11px] text-green-700 font-medium">
                You can request another email in {cooldown}s.
              </p>
            )}
          </div>
        )}

        {/* Form */}
        {!successMsg ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-valuecart-navy hover:bg-valuecart-navy-light text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Sending Reset Link...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={cooldown > 0 || submitting}
              onClick={handleSubmit}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-valuecart-navy font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {cooldown > 0 ? `Resend Reset Link (${cooldown}s)` : 'Resend Reset Link'}
            </button>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-valuecart-navy hover:text-valuecart-green transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Security badge */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-valuecart-text-muted">
          <ShieldCheck className="w-4 h-4 text-valuecart-green" />
          <span>Encrypted Supabase Security</span>
        </div>

      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
