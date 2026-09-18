import React, { useState, useMemo } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { Order } from '../../types';
import { 
  Search, 
  Download, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Eye, 
  X, 
  Send, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Check, 
  ZoomIn, 
  AlertCircle, 
  Copy, 
  ChevronRight,
  Image as ImageIcon,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Package,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

interface AdminOrdersViewProps {
  controller: StoreController;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ controller }) => {
  const { 
    orders, 
    updateOrderStatus, 
    verifyOrderPayment, 
    updateOrderShipping, 
    attachPaymentReceipt 
  } = controller;

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Zoom Receipt Modal
  const [zoomedReceiptUrl, setZoomedReceiptUrl] = useState<string | null>(null);

  // Quick Tracking Edit in Modal
  const [editingTracking, setEditingTracking] = useState<string>('');
  const [editingCarrier, setEditingCarrier] = useState<string>('Envía');

  // Temporary toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => 
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q) ||
      (o.tracking && o.tracking.toLowerCase().includes(q)) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  // Group by the 3 operational categories
  const pendingOrders = useMemo(() => 
    filteredOrders.filter((o) => o.status === 'pending'),
    [filteredOrders]
  );

  const paidOrders = useMemo(() => 
    filteredOrders.filter((o) => o.status === 'paid'),
    [filteredOrders]
  );

  const shippedOrders = useMemo(() => 
    filteredOrders.filter((o) => o.status === 'shipped'),
    [filteredOrders]
  );

  // Calculations for KPI summaries
  const totalAmount = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const pendingAmount = useMemo(() => orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.total, 0), [orders]);
  const paidAmount = useMemo(() => orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0), [orders]);
  const shippedAmount = useMemo(() => orders.filter(o => o.status === 'shipped').reduce((sum, o) => sum + o.total, 0), [orders]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Pedido',
      'Fecha',
      'Hora',
      'Cliente',
      'Telefono',
      'Email',
      'Ciudad',
      'Departamento',
      'Direccion',
      'Total',
      'Estado',
      'Comprobante Verificado',
      'Transportadora',
      'Guia Tracking'
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.time}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.email || ''}"`,
      `"${o.city}"`,
      `"${o.department}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      o.total,
      `"${o.status}"`,
      o.receiptVerified ? '"Si"' : '"No"',
      `"${o.carrier || ''}"`,
      `"${o.tracking || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_mujer_latina_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exportación CSV descargada con éxito');
  };

  // Toggle Order Paid Checkbox
  const handleTogglePaid = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status === 'pending') {
      verifyOrderPayment(order.id, true);
      updateOrderStatus(order.id, 'paid');
      showToast(`Pedido ${order.id} verificado y movido a "Pedidos Pagados"`);
    } else if (order.status === 'paid') {
      verifyOrderPayment(order.id, false);
      updateOrderStatus(order.id, 'pending');
      showToast(`Pedido ${order.id} retornado a "Pendientes de Pago"`);
    }
  };

  // Toggle Order Shipped Checkbox
  const handleToggleShipped = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.status === 'paid') {
      const defaultCarrier = order.carrier || 'Envía';
      const defaultTracking = order.tracking || `ENV-${Math.floor(10000000 + Math.random() * 90000000)}`;
      updateOrderShipping(order.id, defaultCarrier, defaultTracking);
      updateOrderStatus(order.id, 'shipped');
      showToast(`Pedido ${order.id} despachado con guía ${defaultTracking}`);
    } else if (order.status === 'shipped') {
      updateOrderStatus(order.id, 'paid');
      showToast(`Pedido ${order.id} retornado a "Pedidos Pagados"`);
    }
  };

  // Copy tracking helper
  const handleCopyTracking = (tracking: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tracking);
    showToast(`Guía ${tracking} copiada al portapapeles`);
  };

  // Open detail modal and sync tracking edit state
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setEditingCarrier(order.carrier || 'Envía');
    setEditingTracking(order.tracking || '');
  };

  return (
    <div className="bg-white min-h-screen text-stone-900 font-sans p-4 sm:p-8 lg:p-10 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#d4af37]/40 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 size={16} className="text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & ACTIONS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Gestión de Pedidos
            </h1>
            <span className="px-3 py-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-full text-xs font-bold">
              {orders.length} pedidos totales
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Supervisión operativa en 3 fases: validación de comprobantes, alistamiento en bodega y despacho logístico.
          </p>
        </div>

        {/* Search Bar & Export Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, ID, teléfono o ciudad..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] shadow-sm transition"
              id="admin-orders-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-sm flex-shrink-0"
            id="admin-orders-export-btn"
            title="Exportar listado a archivo CSV"
          >
            <Download size={15} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CHIPS SUMMARY (CLEAN LIGHT THEME) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Volumen Total</p>
            <p className="text-xl font-bold font-serif-title text-stone-900 mt-0.5">
              ${totalAmount.toLocaleString()} COP
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">{orders.length} órdenes registradas</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-200/70 text-stone-700 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
              1. Pendientes
            </p>
            <p className="text-xl font-bold font-serif-title text-amber-900 mt-0.5">
              ${pendingAmount.toLocaleString()} COP
            </p>
            <p className="text-[11px] text-amber-700 mt-0.5">{pendingOrders.length} por validar pago</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        {/* Pagados */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              2. Pagados
            </p>
            <p className="text-xl font-bold font-serif-title text-blue-900 mt-0.5">
              ${paidAmount.toLocaleString()} COP
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">{paidOrders.length} listos para empaque</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Enviados */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              3. Enviados
            </p>
            <p className="text-xl font-bold font-serif-title text-emerald-900 mt-0.5">
              ${shippedAmount.toLocaleString()} COP
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">{shippedOrders.length} en tránsito con guía</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
          <span>Mostrando resultados coincidentes con <strong>"{searchQuery}"</strong> ({filteredOrders.length} de {orders.length} pedidos).</span>
          <button onClick={() => setSearchQuery('')} className="underline font-bold hover:text-amber-950">
            Limpiar filtro
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 1: PENDIENTES DE PAGO                                            */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden" id="seccion-pendientes-pago">
        {/* Card Header */}
        <div className="bg-amber-50/60 border-b border-amber-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Clock size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-stone-900">
                  1. Pendientes de Pago
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                  {pendingOrders.length} {pendingOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                Pedidos recibidos vía WhatsApp en espera de comprobante o verificación bancaria.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-stone-400 block uppercase">Subtotal categoría</span>
            <span className="font-serif-title font-bold text-base text-amber-900">
              ${pendingOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} COP
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          {pendingOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs sm:text-sm">
              <CheckCircle2 size={32} className="mx-auto text-stone-300 mb-2" />
              No hay pedidos pendientes de pago en esta lista.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm min-w-[920px]">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">ID & Fecha</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Destino</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5">Comprobante</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-center">¿Pagado?</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {pendingOrders.map((order) => {
                  const cleanPhone = order.phone.replace(/\D/g, '');

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-amber-50/30 transition cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* ID & Date */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-stone-900 block text-xs">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-stone-400 block mt-0.5">
                          {order.date} • {order.time}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-stone-900 block">
                          {order.customer}
                        </span>
                        <a
                          href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(order.customer)},%20te%20escribimos%20de%20Mujer%20Latina%20respecto%20a%20tu%20orden%20${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-mono mt-0.5"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <Phone size={11} /> {order.phone}
                        </a>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-stone-800 block text-xs">
                          {order.city}, {order.department}
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate max-w-[170px] mt-0.5" title={order.address}>
                          {order.address}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 font-serif-title font-bold text-stone-900 text-sm sm:text-base">
                        ${order.total.toLocaleString()}
                      </td>

                      {/* Comprobante */}
                      <td className="py-4 px-5">
                        {order.receiptUrl ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedReceiptUrl(order.receiptUrl || null);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold border border-amber-300/80 transition"
                            title="Ver comprobante bancario adjunto"
                          >
                            <ImageIcon size={13} />
                            <span>Ver Recibo</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-500 rounded-lg text-[11px] font-medium border border-stone-200">
                            <AlertCircle size={12} className="text-stone-400" />
                            <span>Sin comprobante</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
                          <Clock size={12} />
                          <span>Pendiente de Pago</span>
                        </span>
                      </td>

                      {/* Checkbox: Pagado */}
                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePaid(order, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold transition shadow-2xs group"
                          title="Hacer clic para marcar como Pagado y mover a la siguiente fase"
                        >
                          <Square size={16} className="text-amber-600 group-hover:text-amber-800" />
                          <span>Pagado</span>
                        </button>
                      </td>

                      {/* Action: Detalle */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="text-[#b58d24] hover:text-[#916e15] font-bold text-xs sm:text-sm inline-flex items-center gap-1 transition group"
                        >
                          <span>Detalle</span>
                          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: PEDIDOS PAGADOS                                                */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden" id="seccion-pedidos-pagados">
        {/* Card Header */}
        <div className="bg-blue-50/60 border-b border-blue-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-stone-900">
                  2. Pedidos Pagados
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-200/80 text-blue-900 border border-blue-300">
                  {paidOrders.length} {paidOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                Pagos validados listos para alistamiento, empaque y asignación de transportadora.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-stone-400 block uppercase">Subtotal categoría</span>
            <span className="font-serif-title font-bold text-base text-blue-900">
              ${paidOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} COP
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          {paidOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs sm:text-sm">
              <Clock size={32} className="mx-auto text-stone-300 mb-2" />
              No hay pedidos en fase de empaque actualmente.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm min-w-[920px]">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">ID & Fecha</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Destino</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5">Comprobante</th>
                  <th className="py-3.5 px-5">Transportadora / Guía</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-center">¿Enviado?</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {paidOrders.map((order) => {
                  const cleanPhone = order.phone.replace(/\D/g, '');

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50/30 transition cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* ID & Date */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-stone-900 block text-xs">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-stone-400 block mt-0.5">
                          {order.date} • {order.time}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-stone-900 block">
                          {order.customer}
                        </span>
                        <a
                          href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(order.customer)},%20te%20escribimos%20de%20Mujer%20Latina%20respecto%20a%20tu%20orden%20${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-mono mt-0.5"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <Phone size={11} /> {order.phone}
                        </a>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-stone-800 block text-xs">
                          {order.city}, {order.department}
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate max-w-[170px] mt-0.5" title={order.address}>
                          {order.address}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 font-serif-title font-bold text-stone-900 text-sm sm:text-base">
                        ${order.total.toLocaleString()}
                      </td>

                      {/* Comprobante Validado */}
                      <td className="py-4 px-5">
                        {order.receiptUrl ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedReceiptUrl(order.receiptUrl || null);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200 transition"
                            title="Ver comprobante validado"
                          >
                            <Check size={12} className="text-blue-600 font-bold" />
                            <span>Validado</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">
                            <Check size={12} />
                            <span>Verificado</span>
                          </span>
                        )}
                      </td>

                      {/* Transportadora / Guía */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-stone-900 block text-xs">
                          {order.carrier || 'Por asignar'}
                        </span>
                        {order.tracking ? (
                          <span className="text-[11px] text-stone-500 font-mono block">
                            {order.tracking}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 block font-medium">
                            Sin guía asignada
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-bold">
                          <CheckCircle2 size={12} />
                          <span>Pagado</span>
                        </span>
                      </td>

                      {/* Checkbox: Enviado */}
                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleShipped(order, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold transition shadow-2xs group"
                          title="Hacer clic para marcar como Enviado y mover a la siguiente fase"
                        >
                          <Square size={16} className="text-blue-600 group-hover:text-blue-800" />
                          <span>Enviado</span>
                        </button>
                      </td>

                      {/* Action: Detalle */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="text-[#b58d24] hover:text-[#916e15] font-bold text-xs sm:text-sm inline-flex items-center gap-1 transition group"
                        >
                          <span>Detalle</span>
                          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: ENVIADOS                                                       */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden" id="seccion-enviados">
        {/* Card Header */}
        <div className="bg-emerald-50/60 border-b border-emerald-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Truck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-lg sm:text-xl font-bold text-stone-900">
                  3. Enviados
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200/80 text-emerald-900 border border-emerald-300">
                  {shippedOrders.length} {shippedOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">
                Pedidos despachados en ruta de entrega con número de guía activo.
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs text-stone-400 block uppercase">Subtotal categoría</span>
            <span className="font-serif-title font-bold text-base text-emerald-900">
              ${shippedOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} COP
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          {shippedOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs sm:text-sm">
              <Truck size={32} className="mx-auto text-stone-300 mb-2" />
              No hay pedidos despachados en esta lista.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm min-w-[920px]">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">ID & Fecha</th>
                  <th className="py-3.5 px-5">Cliente</th>
                  <th className="py-3.5 px-5">Destino</th>
                  <th className="py-3.5 px-5">Total</th>
                  <th className="py-3.5 px-5">Transportadora</th>
                  <th className="py-3.5 px-5">Nº de Guía</th>
                  <th className="py-3.5 px-5">Estado</th>
                  <th className="py-3.5 px-5 text-center">Despachado</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {shippedOrders.map((order) => {
                  const cleanPhone = order.phone.replace(/\D/g, '');

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-emerald-50/30 transition cursor-pointer"
                      onClick={() => handleOpenDetail(order)}
                    >
                      {/* ID & Date */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-stone-900 block text-xs">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-stone-400 block mt-0.5">
                          {order.date} • {order.time}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-stone-900 block">
                          {order.customer}
                        </span>
                        <a
                          href={`https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(order.customer)},%20te%20escribimos%20de%20Mujer%20Latina%20para%20confirmar%20que%20tu%20pedido%20${order.id}%20ha%20sido%20enviado.`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-mono mt-0.5"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <Phone size={11} /> {order.phone}
                        </a>
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-5">
                        <span className="font-semibold text-stone-800 block text-xs">
                          {order.city}, {order.department}
                        </span>
                        <span className="text-[11px] text-stone-400 block truncate max-w-[170px] mt-0.5" title={order.address}>
                          {order.address}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 font-serif-title font-bold text-stone-900 text-sm sm:text-base">
                        ${order.total.toLocaleString()}
                      </td>

                      {/* Transportadora */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold border border-stone-200">
                          <Truck size={12} className="text-stone-600" />
                          <span>{order.carrier || 'Envía'}</span>
                        </span>
                      </td>

                      {/* Nº de Guía */}
                      <td className="py-4 px-5">
                        {order.tracking ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-stone-900 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                              {order.tracking}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyTracking(order.tracking!, e)}
                              className="text-stone-400 hover:text-stone-700 p-1"
                              title="Copiar guía de rastreo"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs italic">
                            Sin guía asignada
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold">
                          <Truck size={12} />
                          <span>Enviado</span>
                        </span>
                      </td>

                      {/* Checkbox: Despachado */}
                      <td className="py-4 px-5 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleShipped(order, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold transition shadow-2xs group"
                          title="Casilla marcada: Despachado. Clic para desmarcar si es necesario."
                        >
                          <CheckSquare size={16} className="text-emerald-700" />
                          <span>Enviado</span>
                        </button>
                      </td>

                      {/* Action: Detalle */}
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(order)}
                          className="text-[#b58d24] hover:text-[#916e15] font-bold text-xs sm:text-sm inline-flex items-center gap-1 transition group"
                        >
                          <span>Detalle</span>
                          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL DETALLE DE PEDIDO                                                   */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {selectedOrder.id}
                  </span>
                  
                  {selectedOrder.status === 'pending' && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Pendiente de Pago
                    </span>
                  )}
                  {selectedOrder.status === 'paid' && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
                      Pago Verificado
                    </span>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Despachado / En Ruta
                    </span>
                  )}
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-stone-900 mt-1">
                  Detalle del Pedido
                </h3>
                <p className="text-stone-400 text-xs mt-0.5">
                  Registrado el {selectedOrder.date} a las {selectedOrder.time}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Information Card */}
            <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 text-xs sm:text-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <User size={14} className="text-[#b58d24]" />
                  Información del Cliente
                </span>
                <a
                  href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(selectedOrder.customer)},%20te%20escribimos%20de%20Mujer%20Latina%20respecto%20a%20tu%20orden%20${selectedOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg font-bold text-xs transition shadow-2xs"
                >
                  <Send size={12} />
                  <span>Chatear por WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
                <div>
                  <span className="text-stone-400 text-[11px] block">Nombre Completo:</span>
                  <span className="font-bold text-stone-900">{selectedOrder.customer}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Teléfono / WhatsApp:</span>
                  <span className="font-mono font-bold text-stone-900">{selectedOrder.phone}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Ciudad & Departamento:</span>
                  <span className="font-semibold text-stone-800">{selectedOrder.city}, {selectedOrder.department}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">Dirección de Entrega:</span>
                  <span className="text-stone-800 font-medium">{selectedOrder.address}</span>
                </div>
                {selectedOrder.documentId && (
                  <div>
                    <span className="text-stone-400 text-[11px] block">Identificación:</span>
                    <span className="text-stone-800">{selectedOrder.documentId}</span>
                  </div>
                )}
                {selectedOrder.email && (
                  <div>
                    <span className="text-stone-400 text-[11px] block">Correo:</span>
                    <span className="text-stone-800">{selectedOrder.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Receipt Card */}
            <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#b58d24]" />
                Comprobante de Pago Bancario
              </span>

              {selectedOrder.receiptUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div 
                    className="relative w-28 h-28 rounded-xl overflow-hidden border border-stone-200 cursor-pointer group flex-shrink-0 bg-stone-100"
                    onClick={() => setZoomedReceiptUrl(selectedOrder.receiptUrl || null)}
                    title="Clic para ampliar comprobante"
                  >
                    <img 
                      src={selectedOrder.receiptUrl} 
                      alt="Comprobante de pago" 
                      className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <ZoomIn size={20} />
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 text-xs">
                    <p className="font-bold text-stone-900 text-sm">
                      {selectedOrder.receiptBank || 'Transferencia Bancolombia / Nequi'}
                    </p>
                    {selectedOrder.receiptRef && (
                      <p className="text-stone-500 font-mono text-[11px]">
                        {selectedOrder.receiptRef}
                      </p>
                    )}
                    <p className="text-emerald-700 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 size={14} />
                      Comprobante validado en cuenta empresarial
                    </p>
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomedReceiptUrl(selectedOrder.receiptUrl || null)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <ZoomIn size={13} />
                        <span>Ver a tamaño completo</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-stone-200 text-center space-y-2">
                  <p className="text-xs text-stone-500">
                    Este pedido fue generado vía WhatsApp y aún no tiene comprobante adjunto.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleReceipt = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8k11gOXdrBwN5ATOyaIeByyisa7i6sOfTxzlrMg1MyCEw5COmvYKRsya3IL00K0a0M5rKWWVnjNSugpi7w9z4GqH7HV-kTwzjVP7R58vk3Cgue7c33oXLf3cIdA-ESBg1-My2OlJmICOmgCBYkTgS9j10wilmgj7BcJo6j0CdK2K1DdrJSNFCP69nj9hXEY5q78ntwK6rHcBLwzctpZ7mZhdQnXMak_mlCZWq_fs2OtRIEwBfi7v0';
                      attachPaymentReceipt(selectedOrder.id, sampleReceipt, 'Bancolombia App');
                      setSelectedOrder({
                        ...selectedOrder,
                        receiptUrl: sampleReceipt,
                        receiptBank: 'Bancolombia App',
                        receiptVerified: true,
                        status: 'paid'
                      });
                      showToast('Comprobante validado y orden actualizada a Pagada');
                    }}
                    className="px-4 py-2 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#8e6e18] border border-[#d4af37]/40 rounded-xl text-xs font-bold transition"
                  >
                    + Simular / Validar Comprobante Bancario
                  </button>
                </div>
              )}
            </div>

            {/* Logistics & Tracking Form */}
            <div className="bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Truck size={14} className="text-[#b58d24]" />
                Datos de Despacho & Guía
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 text-xs font-bold mb-1">Transportadora</label>
                  <select
                    value={editingCarrier}
                    onChange={(e) => setEditingCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Envía">Envía</option>
                    <option value="Servientrega">Servientrega</option>
                    <option value="Coordinadora">Coordinadora</option>
                    <option value="InterRapidísimo">InterRapidísimo</option>
                    <option value="TCC">TCC</option>
                    <option value="Domicilio Local Express">Domicilio Local Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 text-xs font-bold mb-1">Número de Guía</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingTracking}
                      onChange={(e) => setEditingTracking(e.target.value)}
                      placeholder="Ej: ENV-88912736"
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateOrderShipping(selectedOrder.id, editingCarrier, editingTracking);
                        setSelectedOrder({
                          ...selectedOrder,
                          carrier: editingCarrier,
                          tracking: editingTracking,
                          status: editingTracking ? 'shipped' : selectedOrder.status
                        });
                        showToast('Datos de guía actualizados exitosamente');
                      }}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex-shrink-0"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="space-y-3">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                Artículos Ordenados ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
              </span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl bg-white overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      {it.imageUrl ? (
                        <img 
                          src={it.imageUrl} 
                          alt={it.productName} 
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                          <Package size={18} />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-stone-900">{it.productName}</p>
                        <p className="text-stone-400 text-xs">
                          {it.sku} • Cant: {it.quantity} x ${it.unitPrice.toLocaleString()} COP
                        </p>
                      </div>
                    </div>
                    <span className="font-serif-title font-bold text-stone-900 text-sm">
                      ${(it.quantity * it.unitPrice).toLocaleString()} COP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal productos:</span>
                <span>${selectedOrder.subtotal.toLocaleString()} COP</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Costo de despacho:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'Gratis' : `$${selectedOrder.shippingFee.toLocaleString()} COP`}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 font-bold text-base">
                <span className="text-stone-900">Total liquidado:</span>
                <span className="font-serif-title text-xl sm:text-2xl text-stone-900">
                  ${selectedOrder.total.toLocaleString()} COP
                </span>
              </div>
            </div>

            {/* Operational Phase Trigger Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {selectedOrder.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'paid');
                    verifyOrderPayment(selectedOrder.id, true);
                    setSelectedOrder({ ...selectedOrder, status: 'paid', receiptVerified: true });
                    showToast(`Pedido ${selectedOrder.id} marcado como Pagado`);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
                >
                  <CheckCircle2 size={16} />
                  <span>Aprobar Pago y Mover a "Pagados"</span>
                </button>
              )}

              {selectedOrder.status === 'paid' && (
                <button
                  type="button"
                  onClick={() => {
                    const defaultCarrier = editingCarrier || selectedOrder.carrier || 'Envía';
                    const defaultTracking = editingTracking || selectedOrder.tracking || `ENV-${Math.floor(10000000 + Math.random() * 90000000)}`;
                    updateOrderShipping(selectedOrder.id, defaultCarrier, defaultTracking);
                    updateOrderStatus(selectedOrder.id, 'shipped');
                    setSelectedOrder({ 
                      ...selectedOrder, 
                      status: 'shipped',
                      carrier: defaultCarrier,
                      tracking: defaultTracking
                    });
                    showToast(`Pedido ${selectedOrder.id} despachado exitosamente`);
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
                >
                  <Truck size={16} />
                  <span>Confirmar Despacho y Mover a "Enviados"</span>
                </button>
              )}

              {selectedOrder.status === 'shipped' && (
                <button
                  type="button"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'paid');
                    setSelectedOrder({ ...selectedOrder, status: 'paid' });
                    showToast(`Pedido ${selectedOrder.id} retornado a fase de preparación`);
                  }}
                  className="py-3 px-5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold rounded-xl text-xs sm:text-sm transition"
                >
                  Reabrir a "Pagados"
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="py-3 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs sm:text-sm transition"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ZOOM COMPROBANTE MODAL                                                    */}
      {/* ========================================================================= */}
      {zoomedReceiptUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setZoomedReceiptUrl(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div>
                <h4 className="font-serif-title font-bold text-stone-900 text-lg">
                  Comprobante de Transferencia Bancaria
                </h4>
                <p className="text-stone-400 text-xs">Inspección de alta resolución para verificación contable</p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedReceiptUrl(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center max-h-[75vh]">
              <img 
                src={zoomedReceiptUrl} 
                alt="Comprobante en alta resolución" 
                className="w-full h-auto max-h-[75vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setZoomedReceiptUrl(null)}
                className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition"
              >
                Cerrar vista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
