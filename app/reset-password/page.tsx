'use client';

import React, { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function ResetPasswordContent() {
  const router = useRouter();
  const { updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const res = await updatePassword(password);

      if (res.error) {
        setErrorMsg(res.error.message || 'Unable to update password. Your reset link may have expired.');
      } else {
        setSuccessMsg('Your password has been reset successfully! Redirecting to sign in...');
        await signOut();
        setTimeout(() => {
          router.replace('/login');
        }, 1200);
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-valuecart-navy tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-valuecart-text-muted">
            Enter your new secure password below to regain access to your account.
          </p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {errorMsg}
            {errorMsg.includes('expired') && (
              <div className="mt-2">
                <Link href="/forgot-password" className="underline font-bold text-red-800">
                  Request a new password reset link
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

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                New Password
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

            <div>
              <label className="block text-xs font-bold text-valuecart-navy mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
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
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-valuecart-text-muted">
          <ShieldCheck className="w-4 h-4 text-valuecart-green" />
          <span>Encrypted Supabase Security</span>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-xs text-gray-400">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
