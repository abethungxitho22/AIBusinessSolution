import { useState } from 'react';
import { supabase, BUSINESS_TYPE_LABELS, type BusinessType } from '../lib/supabase';
import { Store, Eye, EyeOff, ChevronDown } from 'lucide-react';

interface Props {
  onSwitchToLogin: () => void;
  onRegistered: (email: string) => void;
}

const BUSINESS_TYPES = Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][];

export default function RegisterPage({ onSwitchToLogin, onRegistered }: Props) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    cellphone: '',
    business_name: '',
    business_type: '' as BusinessType | '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.business_type) return setError('Please select your business type.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (!/^\+?[\d\s\-()]{9,15}$/.test(form.cellphone))
      return setError('Enter a valid South African cellphone number.');

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username: form.username,
            business_type: form.business_type,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: form.username,
          email: form.email,
          cellphone: form.cellphone,
          business_type: form.business_type,
          business_name: form.business_name,
        });
      }

      onRegistered(form.email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Business Assistant</h1>
          <p className="text-slate-400 mt-1 text-sm">Smart insights for South African small businesses</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  placeholder="john_doe"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Cellphone</label>
                <input
                  type="tel"
                  required
                  value={form.cellphone}
                  onChange={(e) => set('cellphone', e.target.value)}
                  placeholder="071 234 5678"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Business name</label>
              <input
                type="text"
                required
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                placeholder="My Shop Name"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Business type</label>
              <div className="relative">
                <select
                  required
                  value={form.business_type}
                  onChange={(e) => set('business_type', e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-10 [&>option]:bg-slate-800 [&>option]:text-white"
                >
                  <option value="" disabled className="text-slate-400">Select your business type</option>
                  {BUSINESS_TYPES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
