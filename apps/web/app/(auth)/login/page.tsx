'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/Loading';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: 'admin@demo.com',
    password: '',
    orgId: '0af48a72-998e-4c53-a66b-29ea3cf5646a',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await authApi.login(form.orgId, form.email, form.password);
      localStorage.setItem('vp_token', data.token.accessToken);
      localStorage.setItem('vp_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B7FFF] to-[#1A47CC] rounded-lg flex items-center justify-center font-extrabold text-white">VP</div>
              <span className="text-xl font-bold text-[#0C1220]">VendorPay Pro</span>
            </div>
            <p className="text-[#3D4560]">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[#FEEEEC] border border-[#F4A49D] rounded-lg text-[#B8291C] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3D4560] mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#E2E6EF] rounded-lg focus:border-[#1A47CC] focus:ring-2 focus:ring-[#1A47CC]/20"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3D4560] mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#E2E6EF] rounded-lg focus:border-[#1A47CC] focus:ring-2 focus:ring-[#1A47CC]/20"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#1A47CC] text-white font-medium rounded-lg hover:bg-[#1237A8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7C849E]">
              Demo: admin@demo.com / password123
            </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#0A0F1E] items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-2xl font-bold mb-2">Enterprise Finance Automation</h2>
          <p className="text-white/60">
            Streamline vendor payments with GST/TDS compliance, asset management, and audit-ready reporting.
          </p>
        </div>
      </div>
    </div>
  );
}