'use client';

import { useEffect, useState } from 'react';
import { assetsApi } from '@/lib/api';
import { Plus, Package, Laptop, Users, Building2, Truck, FileText, Download, Edit2, Trash2 } from 'lucide-react';

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

const categoryIcons: Record<string, any> = {
  IT_EQUIPMENT: Laptop,
  FURNITURE: Package,
  PLANT_MACHINERY: Building2,
  VEHICLE: Truck,
  BUILDING: Building2,
  OTHER: Package,
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', purchaseValue: 0, purchaseDate: new Date().toISOString().split('T')[0],
    category: 'IT_EQUIPMENT', deprMethod: 'SLM', usefulLife: 5, residualValue: 0, assignedTo: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [assetsRes, statsRes] = await Promise.all([
        assetsApi.list(),
        assetsApi.stats()
      ]);
      setAssets(assetsRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsApi.create(form);
      setShowModal(false);
      setForm({
        name: '', purchaseValue: 0, purchaseDate: new Date().toISOString().split('T')[0],
        category: 'IT_EQUIPMENT', deprMethod: 'SLM', usefulLife: 5, residualValue: 0, assignedTo: ''
      });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this asset?')) {
      try {
        await assetsApi.delete(id);
        loadData();
      } catch (err) { console.error(err); }
    }
  };

  const kpis = [
    { label: 'Total Assets', value: stats.total || 0, sub: `${stats.active || 0} active` },
    { label: 'Purchase Value', value: formatCurrency(stats.purchaseValue), sub: 'Original cost' },
    { label: 'Net Book Value', value: formatCurrency(stats.nbv), sub: 'Current value' },
    { label: 'Depreciation YTD', value: formatCurrency(stats.deprYtd), sub: 'This year' },
  ];

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="grid grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E6EF] shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-wide text-[#7C849E]">{kpi.label}</div>
                <div className="text-xl font-mono font-semibold text-[#0C1220]">{kpi.value}</div>
                <div className="text-xs text-[#7C849E]">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm font-medium hover:bg-[#1237A8]">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {assets.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl border border-[#E2E6EF] p-8 text-center text-[#7C849E]">
            No assets yet. Add your first asset.
          </div>
        ) : (
          assets.map((asset: any) => {
            const Icon = categoryIcons[asset.category] || Package;
            const deprPct = asset.purchaseValue ? 
              ((Number(asset.purchaseValue) - (Number(asset.currentNbv) || 0)) / Number(asset.purchaseValue)) * 100 
              : 0;
            return (
              <div key={asset.id} className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#1A47CC]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#0C1220]">{asset.name}</div>
                    <div className="text-xs text-[#7C849E] mt-1">
                      {asset.category?.replace('_', ' ')} • {asset.deprMethod} • {asset.usefulLife} yrs
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-[#F0F2F7] rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(asset.id)} className="p-1 hover:bg-[#F0F2F7] rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#7C849E]">Net Book Value</span>
                    <span className="font-mono font-semibold text-[#1A47CC]">{formatCurrency(asset.currentNbv)}</span>
                  </div>
                  <div className="h-1.5 bg-[#F0F2F7] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#3B7FFF] to-[#6366F1] rounded-full" style={{ width: `${100 - deprPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#7C849E] mt-1">
                    <span>{formatCurrency(asset.currentNbv)} NBV</span>
                    <span>{formatCurrency(asset.purchaseValue)} Cost</span>
                  </div>
                </div>
                {asset.assignedTo && (
                  <div className="mt-3 pt-3 border-t border-[#E2E6EF] flex items-center gap-2 text-xs text-[#7C849E]">
                    <Users className="w-3 h-3" /> Assigned to: {asset.assignedTo}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add New Asset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Asset Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Dell Laptop XPS 15"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Purchase Value *</label>
                  <input
                    type="number"
                    value={form.purchaseValue}
                    onChange={(e) => setForm({ ...form, purchaseValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="IT_EQUIPMENT">IT Equipment</option>
                    <option value="FURNITURE">Furniture & Fixtures</option>
                    <option value="PLANT_MACHINERY">Plant & Machinery</option>
                    <option value="VEHICLE">Vehicle</option>
                    <option value="BUILDING">Building</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Depreciation Method</label>
                  <select
                    value={form.deprMethod}
                    onChange={(e) => setForm({ ...form, deprMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SLM">SLM — Straight Line (Companies Act)</option>
                    <option value="WDV">WDV — Written Down Value (IT Act)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Useful Life (years)</label>
                  <input
                    type="number"
                    value={form.usefulLife}
                    onChange={(e) => setForm({ ...form, usefulLife: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    min={1}
                    max={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Employee name"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}