'use client';

import { useEffect, useState } from 'react';
import { vendorsApi } from '@/lib/api';
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { LoadingSpinner, PageLoader } from '@/components/Loading';

export default function VendorsPage() {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', pan: '', gstin: '', accountNumber: '', ifscCode: '', bankName: '' });

  useEffect(() => { loadVendors(); }, []);

  const loadVendors = async () => {
    try {
      const { data } = await vendorsApi.list({ search: search || undefined });
      setVendors(data.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load vendors', 'error');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vendorsApi.create(form);
      setShowModal(false);
      setForm({ name: '', pan: '', gstin: '', accountNumber: '', ifscCode: '', bankName: '' });
      loadVendors();
      showToast('Vendor created successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create vendor', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await vendorsApi.delete(id);
      loadVendors();
      showToast('Vendor deleted', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete vendor', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C849E]" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadVendors()}
              className="pl-10 pr-4 py-2 border border-[#E2E6EF] rounded-lg text-sm w-64"
            />
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm font-medium hover:bg-[#1237A8]">
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F0F2F7]">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Vendor</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">PAN</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">GSTIN</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Type</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">GST Status</th>
              <th className="px-4 py-2 text-right text-[10px] font-bold uppercase text-[#7C849E]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EF]">
            {vendors.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[#7C849E]">No vendors yet</td></tr>
            ) : (
              vendors.map((vendor: any) => (
                <tr key={vendor.id} className="hover:bg-[#F8F9FB]">
                  <td className="px-4 py-3 font-medium">{vendor.name}</td>
                  <td className="px-4 py-3 font-mono text-sm">{vendor.pan}</td>
                  <td className="px-4 py-3 font-mono text-sm">{vendor.gstin || '—'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-[#F0F2F7] rounded text-xs">{vendor.vendorType}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${vendor.gstStatus === 'ACTIVE' ? 'bg-[#E6F5EE] text-[#0A6E3E]' : 'bg-[#FEEEEC] text-[#B8291C]'}`}>
                      {vendor.gstStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1 hover:bg-[#F0F2F7] rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(vendor.id)} className="p-1 hover:bg-[#F0F2F7] rounded ml-1"><Trash2 className="w-4 h-4 text-[#B8291C]" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add New Vendor</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Vendor Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">PAN *</label>
                  <input type="text" value={form.pan} onChange={(e) => setForm({...form, pan: e.target.value.toUpperCase()})} maxLength={10} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">GSTIN</label>
                  <input type="text" value={form.gstin} onChange={(e) => setForm({...form, gstin: e.target.value.toUpperCase()})} maxLength={15} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Account Number *</label>
                  <input type="text" value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">IFSC *</label>
                  <input type="text" value={form.ifscCode} onChange={(e) => setForm({...form, ifscCode: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm" disabled={submitting}>Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm flex items-center gap-2">
                  {submitting && <LoadingSpinner size="sm" />}
                  {submitting ? 'Saving...' : 'Save Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}