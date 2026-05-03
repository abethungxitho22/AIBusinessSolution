import { useEffect, useState, useCallback } from 'react';
import { supabase, BUSINESS_TYPE_LABELS, type Profile, type SalesEntry } from '../lib/supabase';
import { analyzeSales, generateAdvice } from '../lib/aiEngine';
import SalesForm from '../components/SalesForm';
import SalesTable from '../components/SalesTable';
import AIInsights from '../components/AIInsights';
import {
  Store,
  LogOut,
  BarChart3,
  PlusCircle,
  RefreshCw,
  Tag,
} from 'lucide-react';

type Tab = 'insights' | 'sales';

interface Props {
  userId: string;
}

export default function Dashboard({ userId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('insights');

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  }, [userId]);

  const loadSales = useCallback(async () => {
    const { data } = await supabase
      .from('sales_entries')
      .select('*')
      .eq('user_id', userId)
      .order('sale_date', { ascending: false });
    setEntries(data || []);
  }, [userId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadSales()]);
      setLoading(false);
    })();
  }, [loadProfile, loadSales]);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const insight = analyzeSales(entries);
  const advice = profile ? generateAdvice(insight, profile.business_type) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top nav */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {profile?.business_name || 'My Business'}
              </p>
              {profile && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">
                    {BUSINESS_TYPE_LABELS[profile.business_type]}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">
              @{profile?.username}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {profile?.username || 'there'}
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Here is what your AI assistant found in your sales data.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 gap-1 w-fit">
          <button
            onClick={() => setTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'insights'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            AI Insights
          </button>
          <button
            onClick={() => setTab('sales')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'sales'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Record Sales
          </button>
        </div>

        {tab === 'insights' && profile && advice ? (
          <AIInsights insight={insight} advice={advice} businessType={profile.business_type} />
        ) : tab === 'insights' ? (
          <div className="text-slate-500 text-sm">Loading insights...</div>
        ) : null}

        {tab === 'sales' && (
          <div className="space-y-5">
            <SalesForm userId={userId} onSaved={loadSales} />
            <SalesTable entries={entries} onDeleted={loadSales} />
          </div>
        )}
      </main>
    </div>
  );
}
