'use client';

import { useEffect, useState } from 'react';
import { tdsApi } from '@/lib/api';
import { Download, Calculator, FileText, AlertTriangle, Info } from 'lucide-react';

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

export default function TdsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [register, setRegister] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('register');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, regRes, codesRes] = await Promise.all([
        tdsApi.stats(),
        tdsApi.register(),
        tdsApi.codes()
      ]);
      setStats(statsRes.data);
      setRegister(regRes.data);
      setCodes(codesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const kpis = [
    { label: 'Total TDS', value: formatCurrency(stats.total), icon: Calculator, color: 'bg-[#FEEEEC]', text: 'text-[#B8291C]' },
    { label: 'Section 393', value: formatCurrency(stats.s393), icon: FileText, color: 'bg-[#EEF4FF]', text: 'text-[#1A47CC]' },
    { label: 'Section 394', value: formatCurrency(stats.s394), icon: FileText, color: 'bg-[#EDE8FC]', text: 'text-[#4B1AA8]' },
    { label: 'Overrides', value: stats.overrides || 0, icon: AlertTriangle, color: 'bg-[#FEF3E2]', text: 'text-[#A85500]' },
  ];

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      <div className="p-4 bg-[#EEF4FF] border border-[#B8CAFE] rounded-xl flex items-center gap-3">
        <Info className="w-5 h-5 text-[#1A47CC]" />
        <span className="text-sm text-[#1A47CC]">
          <b>ITA 2025 (from 1 Apr 2026):</b> Old section numbers (194C, 194J…) replaced by Payment Codes 1001–1067 under Sections 392, 393, 394.
        </span>
      </div>

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

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F0F2F7] p-1 rounded-lg w-fit">
        {['register', 'summary', 'codes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-white text-[#1A47CC] shadow-sm' : 'text-[#7C849E] hover:text-[#0C1220]'
            }`}
          >
            {tab === 'register' && 'TDS Register'}
            {tab === 'summary' && 'Challan Summary'}
            {tab === 'codes' && 'Payment Codes'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
        {activeTab === 'register' && (
          <table className="w-full">
            <thead className="bg-[#F0F2F7]">
              <tr>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Invoice</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Vendor</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">PAN</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Date</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Gross</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Code</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Nature</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Section</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Rate</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">TDS</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EF]">
              {register.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-[#7C849E]">No TDS records</td></tr>
              ) : (
                register.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FB]">
                    <td className="px-4 py-3 font-mono text-sm">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 font-medium">{inv.vendor?.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{inv.vendor?.pan}</td>
                    <td className="px-4 py-3 text-sm text-[#7C849E]">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 font-mono">₹{inv.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-[#EEF4FF] text-[#1A47CC] rounded text-xs">{inv.tdsCode || '—'}</span></td>
                    <td className="px-4 py-3 text-sm max-w-[150px] truncate">{inv.pcNature || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${inv.tdsSection === '393' ? 'bg-[#EEF4FF] text-[#1A47CC]' : inv.tdsSection === '394' ? 'bg-[#EDE8FC] text-[#4B1AA8]' : 'bg-[#F0F2F7] text-[#7C849E]'}`}>
                        S.{inv.tdsSection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{inv.tdsRate}%</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#B8291C]">₹{inv.tdsAmount || 0}</td>
                    <td className="px-4 py-3">
                      {inv.isOverride ? (
                        <span className="px-2 py-1 bg-[#FEF3E2] text-[#A85500] rounded text-xs">Manual</span>
                      ) : (
                        <span className="text-[#7C849E]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'summary' && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">TDS Challan Summary by Code</h3>
            <table className="w-full">
              <thead className="bg-[#F0F2F7]">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Code</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Nature</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Section</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Rate</th>
                  <th className="px-4 py-2 text-right text-[10px] font-bold uppercase text-[#7C849E]">Total TDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EF]">
                {register.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[#7C849E]">No TDS records</td></tr>
                ) : (
                  Object.entries(
                    register.reduce((acc: any, inv: any) => {
                      const code = inv.tdsCode || 'unknown';
                      acc[code] = (acc[code] || 0) + Number(inv.tdsAmount || 0);
                      return acc;
                    }, {})
                  ).map(([code, amount]: any) => {
                    const pc = codes.find((p: any) => p.code === code);
                    return { code, amount, pc };
                  }).map((item: any) => (
                    <tr key={item.code}>
                      <td className="px-4 py-3 font-mono font-semibold">{item.code}</td>
                      <td className="px-4 py-3 text-sm">{item.pc?.nature || '—'}</td>
                      <td className="px-4 py-3">S.{item.pc?.section}</td>
                      <td className="px-4 py-3">{item.pc?.rate}%</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[#B8291C]">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">Payment Codes Reference (TY 2026-27)</h3>
            <table className="w-full">
              <thead className="bg-[#F0F2F7]">
                <tr>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Code</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Nature of Payment</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Old Section</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Rate</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Threshold</th>
                  <th className="px-4 py-2 text-left text-[10px] font-bold uppercase text-[#7C849E]">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6EF]">
                {codes.slice(0, 20).map((pc: any) => (
                  <tr key={pc.code}>
                    <td className="px-4 py-3 font-mono font-semibold">{pc.code}</td>
                    <td className="px-4 py-3 text-sm">{pc.nature}</td>
                    <td className="px-4 py-3 font-mono text-sm">{pc.old}</td>
                    <td className="px-4 py-3">{pc.rate}%</td>
                    <td className="px-4 py-3">₹{pc.threshold.toLocaleString()}</td>
                    <td className="px-4 py-3">S.{pc.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}