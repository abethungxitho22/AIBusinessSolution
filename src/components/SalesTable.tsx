import { useState } from 'react';
import { supabase, type SalesEntry } from '../lib/supabase';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  entries: SalesEntry[];
  onDeleted: () => void;
}

export default function SalesTable({ entries, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const fmt = (n: number) =>
    `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from('sales_entries').delete().eq('id', id);
    setDeleting(null);
    onDeleted();
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition"
      >
        <h3 className="text-white font-semibold text-sm">
          Sales History
          <span className="ml-2 text-slate-500 font-normal">({entries.length} records)</span>
        </h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto border-t border-slate-700/50">
          {entries.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No sales recorded yet. Add your first sale above.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Product</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Unit Price</th>
                  <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {entries.slice(0, 50).map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/3 transition">
                    <td className="px-4 py-3 text-white capitalize">{entry.product_name}</td>
                    <td className="px-4 py-3 text-slate-300 text-right">{entry.quantity}</td>
                    <td className="px-4 py-3 text-slate-300 text-right">{fmt(entry.unit_price)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium text-right">{fmt(entry.total_price)}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(entry.sale_date).toLocaleDateString('en-ZA')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleting === entry.id}
                        className="text-slate-600 hover:text-red-400 transition disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
