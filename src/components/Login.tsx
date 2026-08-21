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
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4 text-zinc-100 select-none">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-sky-500/10 text-sky-400 rounded-xl mb-3 border border-sky-500/20 shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">SignKYC Customer Portal</h2>
          <p className="text-sm text-zinc-400 mt-1">Sign in to start your RBI-compliant Video-CIP session</p>
        </div>

        {/* Supabase Status Banner */}
        {!isSupabaseConfigured ? (
          <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Supabase in Demo Mode</p>
              <p className="mt-0.5 text-amber-300/80">
                Database keys are not configured in <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[11px] text-amber-200 border border-amber-700/60">.env</code>. You can test immediately with <strong>Demo Login</strong> or type any name.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-5 p-2.5 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Connected to Supabase project</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none text-sm text-white placeholder-zinc-500 transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Aadhaar Number</label>
            <input
              type="text"
              required
              maxLength={14}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none text-sm font-mono text-white placeholder-zinc-500 transition-colors"
              value={aadhaarNo}
              onChange={handleAadhaarChange}
              placeholder="e.g. 4829 1049 8821"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-xs text-rose-300 space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-xs font-semibold text-sky-400 underline hover:text-sky-300 block cursor-pointer"
              >
                Click here to bypass and continue in Demo Mode →
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 text-sm shadow-sm shadow-sky-950 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Verification'}
          </button>
        </form>

        {/* Quick Demo Bypass Button */}
        <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Demo Login (Priya Sharma)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
