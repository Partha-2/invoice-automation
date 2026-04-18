'use client';

import { useEffect, useState } from 'react';
import { invoicesApi, vendorsApi } from '@/lib/api';
import { Plus, Check, X, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { LoadingSpinner, PageLoader } from '@/components/Loading';

const PAYMENT_CODES = [
  { code: '1001', nature: 'Contractor (194C)', rate: 2 },
  { code: '1002', nature: 'Professional (194J)', rate: 10 },
  { code: '1004', nature: 'Rent (194I)', rate: 10 },
];

export default function InvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({
    vendorId: '', invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], 
    description: '', narration: '', amount: 0, gstRate: 18, supplyType: 'INTRA', tdsCode: '1002'
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const [invRes, vendorRes] = await Promise.all([
        invoicesApi.list({ status: filter === 'ALL' ? undefined : filter }),
        vendorsApi.list()
      ]);
      setInvoices(invRes.data.data);
      setVendors(vendorRes.data.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load invoices', 'error');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await invoicesApi.create(form);
      if (file) {
        await invoicesApi.uploadFile(data.id, file);
      }
      setShowModal(false);
      setForm({ vendorId: '', invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], description: '', narration: '', amount: 0, gstRate: 18, supplyType: 'INTRA', tdsCode: '1002' });
      setFile(null);
      loadData();
      showToast('Invoice created successfully', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await invoicesApi.approve(id);
      loadData();
      showToast('Invoice approved', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to approve invoice', 'error');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await invoicesApi.reject(id, reason);
      loadData();
      showToast('Invoice rejected', 'info');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to reject invoice', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoicesApi.delete(id);
      loadData();
      showToast('Invoice deleted', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete invoice', 'error');
    }
  };

  // Inline invoice form
  if (showModal) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">New Invoice</h2>
          <button onClick={() => setShowModal(false)} className="text-[#7C849E]">← Back</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E2E6EF] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Vendor *</label>
              <select value={form.vendorId} onChange={(e) => setForm({...form, vendorId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                <option value="">Select vendor...</option>
                {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Invoice Number *</label>
              <input type="text" value={form.invoiceNumber} onChange={(e) => setForm({...form, invoiceNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Date</label>
              <input type="date" value={form.invoiceDate} onChange={(e) => setForm({...form, invoiceDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Amount *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Description</label>
              <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">GST Rate</label>
              <select value={form.gstRate} onChange={(e) => setForm({...form, gstRate: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg">
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">TDS Code</label>
              <select value={form.tdsCode} onChange={(e) => setForm({...form, tdsCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                {PAYMENT_CODES.map((p) => <option key={p.code} value={p.code}>{p.code} - {p.nature} ({p.rate}%)</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-[#7C849E] mb-1">Invoice PDF</label>
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              {file && <p className="text-xs text-[#7C849E] mt-1">Selected: {file.name}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm" disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm flex items-center gap-2">
              {submitting && <LoadingSpinner size="sm" />}
              {submitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-[#E2E6EF] rounded-lg text-sm">
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#1A47CC] text-white rounded-lg text-sm font-medium hover:bg-[#1237A8]">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F0F2F7]">
            <tr>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Invoice</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Vendor</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Date</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Amount</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">GST</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">TDS</th>
              <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Net</th>
              <th className="px-4 py-2 text-center text-[10px] font-bold uppercase text-[#7C849E]">Status</th>
              <th className="px-4 py-2 text-center text-[10px] font-bold uppercase text-[#7C849E]">File</th>
              <th className="px-4 py-2 text-center text-[10px] font-bold uppercase text-[#7C849E]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E6EF]">
            {invoices.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-[#7C849E]">No invoices</td></tr>
            ) : (
              invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-[#F8F9FB]">
                  <td className="px-4 py-3 font-mono text-sm">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium">{inv.vendor?.name}</td>
                  <td className="px-4 py-3 text-sm text-[#7C849E]">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 font-mono">₹{inv.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{inv.gstRate}%</td>
                  <td className="px-4 py-3 text-sm text-[#B8291C]">₹{inv.tdsAmount || 0}</td>
                  <td className="px-4 py-3 font-mono font-semibold">₹{inv.grossAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${inv.status === 'PENDING' ? 'bg-[#FEF3E2] text-[#A85500]' : inv.status === 'APPROVED' ? 'bg-[#E6F5EE] text-[#0A6E3E]' : inv.status === 'PAID' ? 'bg-[#EEF4FF] text-[#1A47CC]' : 'bg-[#FEEEEC] text-[#B8291C]'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.fileUrl && (
                      <a 
                        href={`http://localhost:3001${inv.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-7 h-7 text-[#1A47CC] hover:bg-[#EEF4FF] rounded"
                        title="View PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => handleDelete(inv.id)} className="inline-flex items-center justify-center w-7 h-7 text-[#B8291C] hover:bg-[#FEEEEC] rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {inv.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(inv.id)} className="inline-flex items-center justify-center w-7 h-7 text-[#0A6E3E] hover:bg-[#E6F5EE] rounded" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleReject(inv.id)} className="inline-flex items-center justify-center w-7 h-7 text-[#B8291C] hover:bg-[#FEEEEC] rounded" title="Reject">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}