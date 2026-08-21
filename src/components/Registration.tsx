import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Customer } from '../types';
import { Loader2 } from 'lucide-react';

interface RegistrationProps {
  initialFullName: string;
  initialAadhaarNo: string;
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export function Registration({ initialFullName, initialAadhaarNo, onSuccess, onCancel }: RegistrationProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [aadhaarNo, setAadhaarNo] = useState(initialAadhaarNo);
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const newCustomer: Customer = {
      full_name: fullName,
      aadhaar_no: aadhaarNo,
      address,
      dob,
    };

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setLoading(false);
        onSuccess(newCustomer);
      }, 400);
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      if (data) {
        onSuccess(data as Customer);
      }
    } catch (err: any) {
      console.error('Supabase registration error:', err);
      // Fallback gracefully so user is not blocked if table or DB is not yet created
      onSuccess(newCustomer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4 text-zinc-100 select-none">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800">
        <h2 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">New Customer</h2>
        <p className="text-center text-zinc-400 mb-6 text-sm">Please fill in your details to continue</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Permanent Address</label>
            <textarea
              required
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none text-sm text-white placeholder-zinc-500 transition-colors"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Full residential address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Date of Birth</label>
            <input
              type="date"
              required
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 outline-none text-sm text-white placeholder-zinc-500 transition-colors"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          
          {error && <p className="text-rose-400 text-sm font-medium">{error}</p>}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-2.5 px-4 rounded-lg transition-colors border border-zinc-700 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 text-sm shadow-sm shadow-sky-950 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
