'use client';

import { useEffect, useState } from 'react';
import { exportApi } from '@/lib/api';
import { Download, FileText, BookOpen, Calculator, Building, Database, FileCheck, FileSpreadsheet } from 'lucide-react';

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

const EXPORTS = [
  {
    id: 'zoho',
    name: 'Zoho Books',
    icon: BookOpen,
    color: 'bg-[#1A47CC]',
    text: 'text-[#1A47CC]',
    desc: 'Vendor bills ready to import with all tax fields mapped.',
    fields: ['VendorName', 'BillDate', 'TaxAmount', 'TDSAmount', 'AccountCode'],
    badge: 'Zoho Vendor Bills',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    icon: Calculator,
    color: 'bg-[#2CA01C]',
    text: 'text-[#2CA01C]',
    desc: 'IIF/CSV format for QuickBooks Online bill import.',
    fields: ['Vendor', 'TxnDate', 'Amount', 'TaxCode', 'Status'],
    badge: 'QB Expenses',
  },
  {
    id: 'tally',
    name: 'Tally Prime',
    icon: FileText,
    color: 'bg-[#A85500]',
    text: 'text-[#A85500]',
    desc: 'CSV voucher import with ledger names, TDS, and GST columns.',
    fields: ['VoucherDate', 'PartyLedger', 'TDSAmount', 'GSTAmt', 'Narration'],
    badge: 'Tally Vouchers',
  },
  {
    id: 'gst',
    name: 'GST Portal',
    icon: Building,
    color: 'bg-[#0A706B]',
    text: 'text-[#0A706B]',
    desc: 'GSTR-1 & GSTR-3B ready data for direct filing.',
    fields: ['GSTIN', 'HSN', 'IGST', 'CGST', 'SGST'],
    badge: 'GSTR Filing',
  },
];

const TDS_EXPORT = [
  {
    id: 'tds-26q',
    name: 'TDS Filing (26Q)',
    icon: FileSpreadsheet,
    color: 'bg-[#4B1AA8]',
    text: 'text-[#4B1AA8]',
    desc: 'Section 393/394 payment codes with PAN, amounts — structured for quarterly TDS filing.',
    fields: ['PAN', 'PaymentCode', 'GrossAmt', 'TDSAmt', 'Section'],
    badge: 'TDS Filing',
  },
  {
    id: 'audit',
    name: 'Full Audit Package',
    icon: FileCheck,
    color: 'bg-[#0C1220]',
    text: 'text-[#0C1220]',
    desc: 'All invoices with narration, source URLs, override reasons — for CA / auditor review.',
    fields: ['Narration', 'SourceURL', 'OverrideReason', 'AuditTrail', 'CreatedAt'],
    badge: 'Audit Package',
  },
];

function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportsPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    // Could load export stats here
  }, []);

  const handleExport = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      let data: any[] = [];
      let filename = '';

      switch (id) {
        case 'zoho':
          const zoho = await exportApi.zoho();
          data = zoho.data;
          filename = 'vendorpay-zoho';
          break;
        case 'quickbooks':
          const qb = await exportApi.quickbooks();
          data = qb.data;
          filename = 'vendorpay-quickbooks';
          break;
        case 'tally':
          const tally = await exportApi.tally();
          data = tally.data;
          filename = 'vendorpay-tally';
          break;
        case 'audit':
          const audit = await exportApi.audit();
          data = audit.data;
          filename = 'vendorpay-audit-package';
          break;
        default:
          alert('Export not implemented');
          return;
      }

      downloadCSV(data, filename);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-[#EEF4FF] border border-[#B8CAFE] rounded-xl flex items-center gap-3">
        <FileText className="w-5 h-5 text-[#1A47CC]" />
        <span className="text-sm text-[#1A47CC]">
          All exports are formatted to match the direct import structure of each accounting platform. No manual column mapping required.
        </span>
      </div>

      {/* Accounting Platforms */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Accounting Software</h3>
        <div className="grid grid-cols-4 gap-4">
          {EXPORTS.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl border border-[#E2E6EF] p-4 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${exp.color} flex items-center justify-center mb-3`}>
                <exp.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-[#0C1220]">{exp.name}</div>
              <div className="text-xs text-[#7C849E] mt-1 mb-3">{exp.desc}</div>
              <div className="flex flex-wrap gap-1 mb-3">
                {exp.fields.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-[#F0F2F7] text-[#3D4560] rounded text-xs font-mono">
                    {f}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleExport(exp.id)}
                disabled={loading[exp.id]}
                className={`flex items-center gap-2 w-full justify-center px-3 py-2 rounded-lg text-sm font-medium ${
                  exp.color.replace('bg-', 'bg-opacity-80 ') + ' text-white'
                } hover:opacity-90 disabled:opacity-50`}
                style={{ backgroundColor: exp.id === 'zoho' ? '#1A47CC' : exp.id === 'quickbooks' ? '#2CA01C' : exp.id === 'tally' ? '#A85500' : '#0A706B' }}
              >
                <Download className="w-4 h-4" />
                {loading[exp.id] ? 'Exporting...' : `Export for ${exp.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tax & Audit Exports */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Tax Filing & Audit</h3>
        <div className="grid grid-cols-2 gap-4">
          {TDS_EXPORT.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl border border-[#E2E6EF] p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${exp.color} flex items-center justify-center flex-shrink-0`}>
                  <exp.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#0C1220]">{exp.name}</div>
                  <div className="text-xs text-[#7C849E] mt-1 mb-3">{exp.desc}</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exp.fields.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-[#F0F2F7] text-[#3D4560] rounded text-xs font-mono">
                        {f}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleExport(exp.id)}
                    disabled={loading[exp.id]}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: exp.id === 'tds-26q' ? '#4B1AA8' : '#0C1220' }}
                  >
                    <Download className="w-4 h-4" />
                    {loading[exp.id] ? 'Exporting...' : 'Download CSV'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Format Reference */}
      <div className="bg-white rounded-xl border border-[#E2E6EF] p-4">
        <h3 className="font-semibold mb-3">📋 CSV File Format Reference</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-[#3D4560] mb-2">Zoho Books</h4>
            <div className="font-mono text-xs bg-[#F0F2F7] p-3 rounded-lg">
              VendorName,BillDate,Description,TaxAmount,TDSAmount,Total,Status
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#3D4560] mb-2">QuickBooks</h4>
            <div className="font-mono text-xs bg-[#F0F2F7] p-3 rounded-lg">
              Vendor,TxnDate,Amount,TaxCode,Memo,Status
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#3D4560] mb-2">Tally Prime</h4>
            <div className="font-mono text-xs bg-[#F0F2F7] p-3 rounded-lg">
              VoucherDate,PartyLedger,TDSAmount,GSTAmt,NetAmount,Narration
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#3D4560] mb-2">GST Portal</h4>
            <div className="font-mono text-xs bg-[#F0F2F7] p-3 rounded-lg">
              GSTIN,InvoiceNo,InvoiceDate,TaxableValue,Rate,CGST,SGST,IGST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}