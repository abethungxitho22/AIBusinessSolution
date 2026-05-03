import { Store, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

interface Props {
  email: string;
  onBack: () => void;
}

export default function VerifyEmailPage({ email, onBack }: Props) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
          <Store className="w-8 h-8 text-white" />
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl mt-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-5">
            <Mail className="w-7 h-7 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="text-emerald-400 font-semibold text-sm mb-5">{email}</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Click the link in the email to verify your account. Once verified, you will be taken directly to your dashboard.
          </p>

          {resent && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-2.5 mb-4">
              Verification email resent successfully.
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition mb-6 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Resending...' : 'Resend verification email'}
          </button>

          <div className="border-t border-white/10 pt-5">
            <button
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
