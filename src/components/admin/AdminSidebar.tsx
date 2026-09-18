import React, { useState } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { 
  LayoutDashboard, 
  Boxes, 
  ClipboardList, 
  Users, 
  BookOpen, 
  ExternalLink, 
  Database,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Settings,
  X,
  CheckCircle2
} from 'lucide-react';
import { getSupabaseStatus } from '../../services/supabaseClient';

interface AdminSidebarProps {
  controller: StoreController;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ controller }) => {
  const { activeView, setActiveView, inventoryAudit, orders } = controller;
  const supabaseStatus = getSupabaseStatus();

  // Pending orders count
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const isCurrent = (view: string) => activeView === view;

  return (
    <>
      <aside className="w-full lg:w-64 bg-[#000000] text-white border-r border-stone-800 flex flex-col justify-between flex-shrink-0 min-h-[600px] lg:min-h-screen shadow-md">
        
        {/* Top Header & Brand */}
        <div>
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center font-serif font-bold text-lg">
                M
              </div>
              <div>
                <h2 className="font-serif-title font-bold text-sm tracking-wider text-white">
                  Mujer Latina
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] block font-semibold">
                  Suite Admin v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Admin Profile Info */}
          <div 
            onClick={() => setActiveView('admin_settings')}
            className="p-3.5 mx-4 my-4 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center gap-3 cursor-pointer transition group"
            title="Ir a Configuración de Cuenta"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37] bg-stone-800 text-[#d4af37] font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
              {controller.currentUser?.avatarUrl ? (
                <img
                  src={controller.currentUser.avatarUrl}
                  alt={controller.currentUser.fullName || 'Admin'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>AD</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#d4af37] transition">
                {controller.currentUser?.fullName || 'Administradora'}
              </p>
              <p className="text-[10px] text-[#d4af37] truncate font-semibold">
                Super Administradora
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" title="Sesión activa" />
          </div>

          {/* Database Status indicator */}
          <div className="px-5 py-2.5 flex items-center justify-between text-[11px] text-stone-400 border-y border-stone-800/80 bg-stone-950/80">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-[#d4af37]" />
              <span className="font-medium text-stone-200">PostgreSQL Supabase</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              {supabaseStatus.isConfigured ? 'Cloud Sync' : 'Local Relational'}
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveView('admin_dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isCurrent('admin_dashboard')
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
                  : 'text-white hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} className={isCurrent('admin_dashboard') ? 'text-stone-950' : 'text-white'} />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveView('admin_inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isCurrent('admin_inventory')
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
                  : 'text-white hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Boxes size={18} className={isCurrent('admin_inventory') ? 'text-stone-950' : 'text-white'} />
                <span>Inventario</span>
              </div>
              {inventoryAudit.criticalItems.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-full">
                  {inventoryAudit.criticalItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin_orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isCurrent('admin_orders')
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
                  : 'text-white hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className={isCurrent('admin_orders') ? 'text-stone-950' : 'text-white'} />
                <span>Pedidos</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 bg-[#25D366] text-stone-950 text-[10px] font-extrabold rounded-full">
                  {pendingOrdersCount} WA
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin_customers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isCurrent('admin_customers')
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/25 ring-1 ring-[#d4af37]'
                  : 'text-white hover:bg-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={18} className={isCurrent('admin_customers') ? 'text-stone-950' : 'text-white'} />
                <span>Clientes</span>
              </div>
              {controller.customers && controller.customers.length > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isCurrent('admin_customers') ? 'bg-stone-950 text-white' : 'bg-stone-800 text-stone-200'
                }`}>
                  {controller.customers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin_settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                isCurrent('admin_settings')
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/25 ring-1 ring-[#d4af37]'
                  : 'text-white hover:bg-stone-900'
              }`}
              id="admin-sidebar-nav-settings"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className={isCurrent('admin_settings') ? 'text-stone-950' : 'text-white'} />
                <span>Configuración</span>
              </div>
            </button>

            <div className="pt-3 border-t border-stone-800 my-2">
              <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Auditoría & Sistema
              </span>

              <button
                onClick={() => setActiveView('docs')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                  isCurrent('docs')
                    ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md'
                    : 'text-white hover:bg-stone-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className={isCurrent('docs') ? 'text-stone-950' : 'text-white'} />
                  <span>Documentos (PRD/TRD)</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer Exit to Storefront & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={() => setActiveView('home')}
            className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-stone-800"
          >
            <ExternalLink size={14} className="text-[#d4af37]" />
            <span>Ver Tienda Pública</span>
          </button>

          <button
            onClick={controller.logout}
            className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border border-rose-900/50"
            id="admin-sidebar-logout-btn"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 pt-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>RLS & Anti-Hack Shield Activo</span>
          </div>
        </div>

      </aside>
    </>
  );
};
