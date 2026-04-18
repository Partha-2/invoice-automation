'use client';

import { useEffect, useState } from 'react';
import { invoicesApi, vendorsApi, gstApi, tdsApi } from '@/lib/api';
import { FileText, CreditCard, Building2, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '₹0';
  return '₹' + (amount / 100000).toFixed(2) + 'L';
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [pendingInvoices, setPendingInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invStats, pending] = await Promise.all([
        invoicesApi.stats(),
        invoicesApi.list({ status: 'PENDING' }),
      ]);
      setStats(invStats.data);
      setPendingInvoices(pending.data.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  const kpis = [
    { label: 'Total Invoices', value: stats.total || 0, icon: FileText, color: 'bg-[#EEF4FF]', text: 'text-[#1A47CC]' },
    { label: 'Pending Approval', value: stats.pending || 0, icon: Clock, color: 'bg-[#FEF3E2]', text: 'text-[#A85500]' },
    { label: 'Net Payable', value: formatCurrency(stats.payableAmount), icon: CreditCard, color: 'bg-[#E6F5EE]', text: 'text-[#0A6E3E]' },
    { label: 'GST Credit', value: formatCurrency(stats.totalGst), icon: TrendingUp, color: 'bg-[#EDE8FC]', text: 'text-[#4B1AA8]' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
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

      {/* Alerts */}
      {(stats.pending || 0) > 0 && (
        <div className="p-4 bg-[#FEF3E2] border border-[#F9C56A] rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#A85500]" />
          <span className="text-sm font-medium text-[#A85500]">
            You have {stats.pending} invoice(s) pending approval
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Pending Invoices */}
        <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E6EF] flex items-center justify-between">
            <h3 className="font-semibold text-sm">⏳ Pending Invoices</h3>
          </div>
          <div className="divide-y divide-[#E2E6EF]">
            {pendingInvoices.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#7C849E]">No pending invoices</div>
            ) : (
              pendingInvoices.map((inv: any) => (
                <div key={inv.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{inv.vendor?.name}</div>
                    <div className="text-xs text-[#7C849E]">{inv.invoiceNumber} • {inv.invoiceDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-sm">₹{inv.grossAmount?.toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E6EF]">
            <h3 className="font-semibold text-sm">💸 Cash Flow</h3>
          </div>
          <div className="p-4">
            <div className="text-center py-4 text-sm text-[#7C849E]">
              Connect bank account to see flow
            </div>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white rounded-xl border border-[#E2E6EF] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E2E6EF]">
            <h3 className="font-semibold text-sm">🏆 Top Vendors</h3>
          </div>
          <div className="p-4">
            <div className="text-center py-4 text-sm text-[#7C849E]">
              Add invoices to see top vendors
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}