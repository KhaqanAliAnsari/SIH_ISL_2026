import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Customer } from '../types';
import { Loader2 } from 'lucide-react';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: dbError } = await supabase
        .from('customers')
        .select('*')
        .eq('full_name', fullName)
        .eq('aadhaar_no', aadhaarNo)
        .single();

      if (dbError && dbError.code === 'PGRST116') {
        // Not found, meaning new customer
        onRegister(fullName, aadhaarNo);
      } else if (dbError) {
        throw dbError;
      } else if (data) {
        onSuccess(data as Customer);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Customer Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              value={aadhaarNo}
              onChange={handleAadhaarChange}
              placeholder="e.g. 4829 1049 8821"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
