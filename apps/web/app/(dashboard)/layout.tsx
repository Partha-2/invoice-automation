'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Receipt, FileText, Building2, Landmark, 
  Calculator, Package, FileCheck, Download, LogOut, Bell, ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Vendors', href: '/vendors', icon: Building2 },
  { name: 'GST Engine', href: '/gst', icon: Landmark },
  { name: 'TDS Engine', href: '/tds', icon: Calculator },
  { name: 'Assets', href: '/assets', icon: Package },
  { name: 'Export', href: '/exports', icon: Download },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('vp_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vp_token');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6FA]">
      {/* Sidebar */}
      <aside className="w-[236px] bg-[#0A0F1E] fixed inset-y-0 left-0 z-50">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-[#3B7FFF] to-[#1A47CC] rounded-lg flex items-center justify-center font-extrabold text-white text-sm">VP</div>
          <div>
            <div className="text-white font-bold text-sm">VendorPay Pro</div>
            <div className="text-white/30 text-[9px]">Finance Automation</div>
          </div>
        </div>
        
        <div className="px-3 py-3">
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-2 py-2">Overview</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#3B7FFF]/20 text-white border-l-2 border-[#3B7FFF]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[236px]">
        {/* Top bar */}
        <header className="h-[52px] bg-white border-b border-[#E2E6EF] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="text-sm font-semibold text-[#0C1220]">
            {navigation.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'VendorPay'}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-lg bg-[#F0F2F7] flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#3D4560]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}