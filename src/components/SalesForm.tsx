import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, FileText, X } from 'lucide-react';
import { parseTextSales } from '../lib/aiEngine';

interface Props {
  userId: string;
  onSaved: () => void;
}

type Mode = 'manual' | 'text';

export default function SalesForm({ userId, onSaved }: Props) {
  const [mode, setMode] = useState<Mode>('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [freeText, setFreeText] = useState('');

  const [form, setForm] = useState({
    product_name: '',
    quantity: '1',
    unit_price: '',
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('sales_entries').insert({
        user_id: userId,
        product_name: form.product_name.trim(),
        quantity: parseInt(form.quantity),
        unit_price: parseFloat(form.unit_price),
        sale_date: form.sale_date,
        notes: form.notes.trim(),
      });
      if (insertError) throw insertError;
      setForm({ product_name: '', quantity: '1', unit_price: '', sale_date: new Date().toISOString().split('T')[0], notes: '' });
      setSuccess('Sale recorded successfully.');
      setTimeout(() => setSuccess(''), 3000);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save sale.');
    } finally {
      setLoading(false);
    }
  }

  async function submitText(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const parsed = parseTextSales(freeText);
    if (parsed.length === 0) {
      setError('Could not extract sales from your text. Try: "5 bread loaves at R15" or "weave extensions R450 x 2"');
      return;
    }
    setLoading(true);
    try {
      const entries = parsed.map((p) => ({
        user_id: userId,
        product_name: p.product_name || 'Unknown product',
        quantity: p.quantity || 1,
        unit_price: p.unit_price || 0,
        sale_date: new Date().toISOString().split('T')[0],
        notes: 'Imported from text',
      }));
      const { error: insertError } = await supabase.from('sales_entries').insert(entries);
      if (insertError) throw insertError;
      setFreeText('');
      setSuccess(`${entries.length} sale(s) imported from your text.`);
      setTimeout(() => setSuccess(''), 4000);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import sales.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-lg">Record Sale</h3>
        <div className="flex bg-slate-700/50 rounded-xl p-1 gap-1">
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'manual'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Manual
          </button>
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              mode === 'text'
                ? 'bg-emerald-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> From text
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl px-4 py-3 mb-4">
          {success}
        </div>
      )}

      {mode === 'manual' ? (
        <form onSubmit={submitManual} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Product / Service name</label>
              <input
                required
                value={form.product_name}
                onChange={(e) => set('product_name', e.target.value)}
                placeholder="e.g. Chicken burger, Weave install, Chair"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity</label>
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Unit price (R)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.unit_price}
                onChange={(e) => set('unit_price', e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Sale date</label>
              <input
                type="date"
                required
                value={form.sale_date}
                onChange={(e) => set('sale_date', e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes (optional)</label>
              <input
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Cash sale"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm"
          >
            {loading ? 'Saving...' : 'Save sale'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitText} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Describe your sales in plain text</label>
            <textarea
              required
              rows={5}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={`Examples:\n"Sold 10 bread loaves at R15 each"\n"weave extensions R450 x 2"\n"Chairs: 3 units R850"`}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
            />
          </div>
          <p className="text-xs text-slate-500">
            Our NLP engine will extract product names, quantities and prices from your text automatically.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm"
          >
            {loading ? 'Processing...' : 'Import sales from text'}
          </button>
        </form>
      )}
    </div>
  );
}
