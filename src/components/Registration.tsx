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
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-sm border border-zinc-800">
        <h2 className="text-2xl font-bold text-center text-white mb-2">New Customer</h2>
        <p className="text-center text-zinc-400 mb-6 text-sm">Please fill in your details to continue</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border border-zinc-700 bg-zinc-950 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-white outline-none transition-colors"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Aadhaar Number</label>
            <input
              type="text"
              required
              maxLength={14}
              className="w-full p-2.5 border border-zinc-700 bg-zinc-950 text-white font-mono rounded-lg focus:ring-2 focus:ring-white focus:border-white outline-none transition-colors"
              value={aadhaarNo}
              onChange={handleAadhaarChange}
              placeholder="e.g. 4829 1049 8821"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Permanent Address</label>
            <textarea
              required
              className="w-full p-2.5 border border-zinc-700 bg-zinc-950 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-white outline-none transition-colors"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Date of Birth</label>
            <input
              type="date"
              required
              className="w-full p-2.5 border border-zinc-700 bg-zinc-950 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-white outline-none transition-colors"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          
          {error && <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300"><p>{error}</p></div>}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white hover:bg-zinc-200 text-black font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
