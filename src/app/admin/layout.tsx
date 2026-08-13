'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Boxes,
  ClipboardList,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { AdminThemeProvider, useAdminTheme } from '@/context/AdminThemeContext';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const { theme, setTheme } = useAdminTheme();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) return;
    const stored = localStorage.getItem('hnf_admin_user');
    if (!stored) {
      router.push('/admin/login');
    } else {
      setAdminUser(JSON.parse(stored));
    }
  }, [pathname, isLoginPage, router]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isWhite = theme === 'white';

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Products Management', href: '/admin/products', icon: ShoppingBag },
    { name: 'Category Management', href: '/admin/categories', icon: FolderTree },
    { name: 'Inventory & Variants', href: '/admin/inventory', icon: Boxes },
    { name: 'Orders Management', href: '/admin/orders', icon: ClipboardList },
    { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('hnf_admin_user');
    router.push('/admin/login');
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-300 ${
        isWhite ? 'bg-[#F8F9FA] text-stone-900' : 'bg-stone-900 text-stone-100'
      }`}
    >
      {/* --- DESKTOP PERSISTENT SIDEBAR (Visible >= lg) --- */}
      <aside
        className={`hidden lg:flex w-64 border-r flex-col justify-between flex-shrink-0 transition-colors duration-300 ${
          isWhite ? 'bg-white border-stone-200 shadow-sm' : 'bg-[#141312] border-stone-800'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className={`p-6 border-b ${isWhite ? 'border-stone-200' : 'border-stone-800'}`}>
            <Link href="/admin" className="block">
              <span
                className={`font-serif text-xl tracking-[0.15em] font-semibold uppercase block ${
                  isWhite ? 'text-stone-950' : 'text-white'
                }`}
              >
                HOUSE OF NF
              </span>
              <span className="text-[8px] tracking-[0.3em] text-[#C5A059] uppercase block font-semibold mt-0.5">
                ADMINISTRATION SUITE
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs font-medium uppercase tracking-wider">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all ${
                    isActive
                      ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md'
                      : isWhite
                      ? 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & External Store Link */}
        <div className={`p-4 border-t space-y-3 ${isWhite ? 'border-stone-200' : 'border-stone-800'}`}>
          <Link
            href="/"
            target="_blank"
            className={`flex items-center justify-between text-xs text-[#C5A059] hover:underline p-2.5 border font-semibold ${
              isWhite ? 'bg-stone-50 border-stone-200' : 'bg-stone-900 border-stone-800'
            }`}
          >
            <span>Live Customer Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#C5A059] text-stone-950 font-bold flex items-center justify-center text-xs">
                A
              </div>
              <div className="text-[10px]">
                <strong className={`block ${isWhite ? 'text-stone-900' : 'text-stone-200'}`}>
                  {adminUser?.name || 'Administrator'}
                </strong>
                <span className={isWhite ? 'text-stone-500' : 'text-stone-400'}>Super Admin</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`p-1 ${isWhite ? 'text-stone-500 hover:text-red-600' : 'text-stone-400 hover:text-red-400'}`}
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE DRAWER SIDEBAR (Visible when toggled on mobile) --- */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <aside
            className={`fixed inset-y-0 left-0 w-72 max-w-[80vw] flex flex-col justify-between p-6 z-10 transition-transform duration-300 ${
              isWhite ? 'bg-white text-stone-900' : 'bg-[#141312] text-[#F3EBDD]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-700/40">
                <Link href="/admin">
                  <span className="font-serif text-lg tracking-widest font-bold uppercase block">HOUSE OF NF</span>
                  <span className="text-[8px] tracking-[0.25em] text-[#C5A059] uppercase block font-semibold">ADMIN SUITE</span>
                </Link>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="py-4 space-y-1 text-xs font-medium uppercase tracking-wider">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 transition-all ${
                        isActive
                          ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md'
                          : isWhite
                          ? 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                          : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-stone-800 space-y-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between text-xs text-[#C5A059] hover:underline p-2.5 border border-stone-700 bg-stone-900/60 font-semibold"
              >
                <span>Live Customer Store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-bold uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* --- MAIN ADMIN CONTENT CONTAINER --- */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-colors duration-300 ${
          isWhite ? 'bg-[#F8F9FA]' : 'bg-[#1A1918]'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`h-16 border-b px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-300 ${
            isWhite ? 'bg-white border-stone-200' : 'bg-[#141312] border-stone-800'
          }`}
        >
          {/* Mobile Drawer Trigger & Portal Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-1.5 text-stone-700 dark:text-stone-300 hover:text-[#C5A059] lg:hidden"
              aria-label="Toggle admin menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059] flex-shrink-0" />
              <h1
                className={`font-serif text-xs sm:text-sm font-semibold uppercase tracking-widest ${
                  isWhite ? 'text-stone-900' : 'text-stone-200'
                }`}
              >
                Management Portal
              </h1>
            </div>
          </div>

          {/* Theme Switcher Toggle (White / Black) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-stone-900 p-1 rounded-full border border-stone-300/60 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setTheme('white')}
                className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 font-semibold transition-all rounded-full ${
                  isWhite
                    ? 'bg-white text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">White</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('black')}
                className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 font-semibold transition-all rounded-full ${
                  !isWhite
                    ? 'bg-[#C5A059] text-stone-950 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-stone-900" />
                <span className="hidden sm:inline">Black</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Responsive Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}
