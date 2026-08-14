import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Customer } from '../types';
import { Loader2, Database, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onSuccess: (customer: Customer) => void;
  onRegister: (fullName: string, aadhaarNo: string) => void;
}

export function Login({ onSuccess, onRegister }: LoginProps) {
  const [fullName, setFullName] = useState('');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 12);
    const match = truncated.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarNo(formatAadhaar(e.target.value));
  };

  const handleDemoLogin = () => {
    const demoCustomer: Customer = {
      full_name: 'Priya Sharma',
      aadhaar_no: '4829 1049 8821',
      address: 'Flat 402, Shanti Heights, Bandra West, Mumbai 400050',
      dob: '1995-06-15',
    };
    onSuccess(demoCustomer);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // If Supabase is not configured, seamlessly use local demo flow
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setLoading(false);
        if (fullName.trim().toLowerCase() === 'priya sharma') {
          handleDemoLogin();
        } else {
          onRegister(fullName, aadhaarNo);
        }
      }, 400);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('customers')
        .select('*')
        .eq('full_name', fullName)
        .eq('aadhaar_no', aadhaarNo)
        .single();

      if (dbError && dbError.code === 'PGRST116') {
        // Not found in DB, redirect to registration
        onRegister(fullName, aadhaarNo);
      } else if (dbError) {
        throw dbError;
      } else if (data) {
        onSuccess(data as Customer);
      }
    } catch (err: any) {
      console.error('Supabase login error:', err);
      const isNetworkErr = err?.name === 'TypeError' || err?.message?.includes('fetch') || err?.message?.includes('NetworkError');
      if (isNetworkErr) {
        setError('Cannot connect to Supabase. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, or use Quick Demo Login.');
      } else {
        setError(err.message || 'An error occurred during database lookup');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-xl mb-3 border border-blue-100">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">SignKYC Customer Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to start your RBI-compliant Video-CIP session</p>
        </div>

        {/* Supabase Status Banner */}
        {!isSupabaseConfigured ? (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Supabase in Demo Mode</p>
              <p className="mt-0.5 text-amber-700">
                Database keys are not configured in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code>. You can test immediately with <strong>Demo Login</strong> or type any name.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Connected to Supabase project</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
            <input
              type="text"
              required
              maxLength={14}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono transition-colors"
              value={aadhaarNo}
              onChange={handleAadhaarChange}
              placeholder="e.g. 4829 1049 8821"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs font-semibold text-blue-700 underline hover:text-blue-900 block"
              >
                Click here to bypass and continue in Demo Mode →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Verification'}
          </button>
        </form>

        {/* Quick Demo Bypass Button */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-gray-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick Demo Login (Priya Sharma)</span>
          </button>
        </div>

      </div>
    </div>
  );
}

