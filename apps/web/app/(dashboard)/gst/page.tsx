'use client';

import { useEffect, useState } from 'react';
import { gstApi } from '@/lib/api';
import { Download, FileText, Building, TrendingUp, AlertTriangle } from 'lucide-react';

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

export default function GstPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [register, setRegister] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('register');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, regRes] = await Promise.all([
        gstApi.stats(),
        gstApi.register()
      ]);
      setStats(statsRes.data);
      setRegister(regRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const kpis = [
    { label: 'Total GST Paid', value: formatCurrency(stats.totalGst), icon: FileText, color: 'bg-[#EEF4FF]', text: 'text-[#1A47CC]' },
    { label: 'CGST Input', value: formatCurrency(stats.cgst), icon: Building, color: 'bg-[#CDFAF5]', text: 'text-[#0A706B]' },
    { label: 'SGST Input', value: formatCurrency(stats.sgst), icon: Building, color: 'bg-[#CDFAF5]', text: 'text-[#0A706B]' },
    { label: 'IGST Input', value: formatCurrency(stats.igst), icon: TrendingUp, color: 'bg-[#EDE8FC]', text: 'text-[#4B1AA8]' },
  ];

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E6EF] shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${kpi.color} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.text}`} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-[#7C849E]">{kpi.label}</div>
            <div className="text-xl font-mono font-semibold text-[#0C1220]">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Credit Alert */}
      {(stats.creditEligible || 0) > 0 && (
        <div className="p-4 bg-[#E6F5EE] border border-[#90D4AE] rounded-xl flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#0A6E3E]" />
          <span className="text-sm font-medium text-[#0A6E3E]">
            ₹{(stats.creditEligible / 100000).toFixed(2)}L input credit available
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F2F7] p-1 rounded-lg w-fit">
        {['register', 'hsn', 'gstr1', 'gstr3b'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-[#1A47CC] shadow-sm' : 'text-[#7C849E] hover:text-[#0C1220]'
            }`}
          >
            {tab === 'register' && 'Purchase Register'}
            {tab === 'hsn' && 'HSN Summary'}
            {tab === 'gstr1' && 'GSTR-1'}
            {tab === 'gstr3b' && 'GSTR-3B'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
        {activeTab === 'register' && (
          <table className="w-full">
            <thead className="bg-[#F0F2F7]">
              <tr>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Vendor</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">GSTIN</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Invoice</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Date</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Taxable</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Rate</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">CGST</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">SGST</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">IGST</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EF]">
              {register.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-[#7C849E]">No GST records</td></tr>
              ) : (
                register.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FB]">
                    <td className="px-4 py-3 font-medium">{inv.vendor?.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{inv.vendor?.gstin || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-[#7C849E]">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 font-mono">₹{inv.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">{inv.gstRate}%</td>
                    <td className="px-4 py-3 font-mono text-[#0A706B]">₹{inv.cgst || 0}</td>
                    <td className="px-4 py-3 font-mono text-[#0A706B]">₹{inv.sgst || 0}</td>
                    <td className="px-4 py-3 font-mono text-[#4B1AA8]">₹{inv.igst || 0}</td>
                    <td className="px-4 py-3">
                      {inv.vendor?.gstStatus === 'ACTIVE' ? (
                        <span className="px-2 py-1 bg-[#E6F5EE] text-[#0A6E3E] rounded text-xs">✓ Eligible</span>
                      ) : (
                        <span className="px-2 py-1 bg-[#FEEEEC] text-[#B8291C] rounded text-xs">✗ Risk</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'gstr1' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">GSTR-1 Data</h3>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1A47CC] text-white rounded-lg text-sm">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            <div className="p-4 bg-[#EEF4FF] border border-[#B8CAFE] rounded-lg">
              <p className="text-sm text-[#1A47CC]">
                GSTR-1 captures inward supply details with HSN/SAC codes. Export as CSV for GST portal upload.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'gstr3b' && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">GSTR-3B Summary — Input Tax Credit</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-[#F0F2F7] rounded-lg">
                <div className="text-xs text-[#7C849E]">CGST</div>
                <div className="font-mono font-semibold text-[#0A706B]">{formatCurrency(stats.cgst)}</div>
              </div>
              <div className="p-4 bg-[#F0F2F7] rounded-lg">
                <div className="text-xs text-[#7C849E]">SGST</div>
                <div className="font-mono font-semibold text-[#0A706B]">{formatCurrency(stats.sgst)}</div>
              </div>
              <div className="p-4 bg-[#F0F2F7] rounded-lg">
                <div className="text-xs text-[#7C849E]">IGST</div>
                <div className="font-mono font-semibold text-[#4B1AA8]">{formatCurrency(stats.igst)}</div>
              </div>
              <div className="p-4 bg-[#E6F5EE] rounded-lg">
                <div className="text-xs text-[#0A6E3E]">Total ITC</div>
                <div className="font-mono font-semibold text-[#0A6E3E]">{formatCurrency(stats.creditEligible)}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hsn' && (
          <div className="p-6 text-center text-[#7C849E]">
            HSN summary will appear here. Add invoices with HSN codes to see breakdown.
          </div>
        )}
      </div>
    </div>
  );
}