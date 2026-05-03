import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';
import { RefreshCw } from 'lucide-react';

type AuthView = 'login' | 'register' | 'verify';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setBooting(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      (() => {
        setSession(sess);
        if (sess) setView('login');
      })();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (session?.user) {
    return <Dashboard userId={session.user.id} />;
  }

  if (view === 'verify') {
    return (
      <VerifyEmailPage
        email={pendingEmail}
        onBack={() => setView('login')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onSwitchToLogin={() => setView('login')}
        onRegistered={(email) => {
          setPendingEmail(email);
          setView('verify');
        }}
      />
    );
  }

  return (
    <LoginPage onSwitchToRegister={() => setView('register')} />
  );
}
