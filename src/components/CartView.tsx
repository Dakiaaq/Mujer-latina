import React, { useState, useEffect } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Trash2, ArrowLeft, Send, ShieldCheck, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { ShippingData } from '../types';

interface CartViewProps {
  controller: StoreController;
}

export const CartView: React.FC<CartViewProps> = ({ controller }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartShippingFee,
    cartTotal,
    processOrderWithWhatsApp,
    setActiveView,
    currentUser,
    openLoginModal,
  } = controller;

  // Initialize shipping data: pre-filled if logged in, empty if guest
  const [shipping, setShipping] = useState<ShippingData>(() => ({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    city: currentUser?.city || '',
    address: currentUser?.address || '',
    documentId: currentUser?.documentId || '',
    additionalInfo: '',
    saveToProfile: false,
  }));

  const [saveToProfile, setSaveToProfile] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [orderProcessedSuccess, setOrderProcessedSuccess] = useState<string | null>(null);

  // Automatically update fields if user logs in while viewing the cart
  useEffect(() => {
    if (currentUser) {
      setShipping((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        phone: currentUser.phone || prev.phone,
        department: currentUser.department || prev.department,
        city: currentUser.city || prev.city,
        address: currentUser.address || prev.address,
        documentId: currentUser.documentId || prev.documentId,
      }));
    }
  }, [currentUser]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Ingresa tu nombre completo';
    if (!shipping.phone.trim()) errors.phone = 'Ingresa un número de WhatsApp de contacto';
    if (!shipping.department.trim()) errors.department = 'Ingresa tu departamento';
    if (!shipping.city.trim()) errors.city = 'Ingresa tu ciudad o municipio';
    if (!shipping.address.trim()) errors.address = 'Ingresa tu dirección de entrega';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = processOrderWithWhatsApp({
      ...shipping,
      saveToProfile,
    });
    if (result) {
      setOrderProcessedSuccess(result.order.id);
      // Open WhatsApp
      window.open(result.url, '_blank');
    }
  };

  if (orderProcessedSuccess) {
    return (
      <div className="bg-[#fcfcfc] min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="font-serif-title text-2xl font-bold text-stone-900">
            ¡Pedido Generado Exitosamente!
          </h2>

          <p className="text-stone-600 text-sm">
            Tu orden <strong className="text-stone-900 font-mono">{orderProcessedSuccess}</strong> ha sido registrada en el sistema y enviada a WhatsApp Business para confirmación de pago y emisión de guía.
          </p>

          <div className="p-4 bg-stone-50 rounded-2xl text-xs text-stone-600 space-y-1.5 text-left border border-stone-100">
            <p><strong>Destinatario:</strong> {shipping.fullName}</p>
            <p><strong>Ciudad:</strong> {shipping.city}, {shipping.department}</p>
            <p><strong>Estado:</strong> <span className="text-amber-600 font-bold">Pendiente de comprobante bancario</span></p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setOrderProcessedSuccess(null);
                setActiveView('profile');
              }}
              className="w-full py-3 bg-stone-900 text-white rounded-full text-sm font-semibold hover:bg-stone-800 transition"
            >
              Ver Mis Pedidos
            </button>
            <button
              onClick={() => {
                setOrderProcessedSuccess(null);
                setActiveView('catalog');
              }}
              className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium transition"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#fcfcfc] min-h-[60vh] py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-4 px-4">
          <div className="w-20 h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={32} />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-stone-800">
            Tu carrito está vacío
          </h2>
          <p className="text-stone-500 text-sm">
            Descubre nuestras fórmulas exclusivas y añade tus productos preferidos.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="mt-2 px-8 py-3.5 bg-[#d4af37] text-black font-bold rounded-full shadow-md hover:bg-[#c29e2f] transition"
          >
            Explorar Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif-title text-3xl font-bold text-stone-900">
              Carrito de Compras
            </h1>
            <p className="text-stone-500 text-sm">
              Revisa tus productos y procesa tu pedido vía WhatsApp oficial.
            </p>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft size={16} />
            <span>Seguir Comprando</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Cart Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-serif-title text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
                Artículos ({cart.length})
              </h3>

              <div className="divide-y divide-stone-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] uppercase tracking-wider text-[#b58d24] font-semibold block">
                        {item.product.category}
                      </span>
                      <h4 className="font-serif-title text-base font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm font-semibold text-stone-800 mt-1">
                        ${item.product.price.toFixed(2)} c/u
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-stone-50">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-stone-900 font-bold text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-stone-900 block">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 hover:text-red-500 mt-1 transition"
                        title="Eliminar del carrito"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout & Shipping Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCheckoutWhatsApp} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-serif-title text-xl font-bold text-stone-900">
                  Datos de entrega
                </h3>
                {currentUser ? (
                  <p className="text-xs text-stone-500 mt-1">
                    Hemos cargado tus datos guardados. Puedes modificarlos para este pedido.
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 mt-1">
                    ¿Ya tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="text-[#b58d24] font-semibold hover:underline cursor-pointer"
                    >
                      Inicia sesión para cargar automáticamente tus datos.
                    </button>
                  </p>
                )}
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    placeholder="Ej. Valentina Gómez"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                  {formErrors.fullName && <p className="text-red-500 text-[11px] mt-1">{formErrors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      WhatsApp / Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      placeholder="+57 312 000 0000"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    {formErrors.phone && <p className="text-red-500 text-[11px] mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      Número de documento <span className="text-stone-400 font-normal text-xs">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.documentId}
                      onChange={(e) => setShipping({ ...shipping, documentId: e.target.value })}
                      placeholder="Opcional"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={shipping.department}
                      onChange={(e) => setShipping({ ...shipping, department: e.target.value })}
                      placeholder="Ej. Cundinamarca"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    {formErrors.department && <p className="text-red-500 text-[11px] mt-1">{formErrors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      Ciudad / Municipio *
                    </label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      placeholder="Ej. Bogotá"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                    />
                    {formErrors.city && <p className="text-red-500 text-[11px] mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Dirección completa *
                  </label>
                  <input
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    placeholder="Calle / Carrera, Número, Barrio, Apto / Casa"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                  {formErrors.address && <p className="text-red-500 text-[11px] mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Información adicional para la entrega <span className="text-stone-400 font-normal text-xs">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.additionalInfo}
                    onChange={(e) => setShipping({ ...shipping, additionalInfo: e.target.value })}
                    placeholder="Torre, apartamento, conjunto, indicaciones para el repartidor"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {currentUser && (
                  <div className="pt-2">
                    <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none text-stone-700 text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        id="save-to-profile-checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="mt-0.5 sm:mt-0 w-4 h-4 rounded border-stone-300 text-[#b58d24] focus:ring-[#d4af37] accent-[#b58d24] cursor-pointer"
                      />
                      <span>Guardar estos cambios en mi información personal</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t border-stone-100 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Costo de Envío</span>
                  <span className="font-semibold text-stone-900">
                    {cartShippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">GRATIS</span>
                    ) : (
                      `$${cartShippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total a Pagar</span>
                  <span className="text-2xl text-[#b58d24] font-serif-title">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                type="submit"
                id="cart-submit-whatsapp-btn"
                className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 text-base transition duration-200 transform hover:scale-[1.01]"
              >
                <Send size={20} />
                <span>Procesar pedido por WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                <ShieldCheck size={14} className="text-[#d4af37]" />
                <span>Pago verificado por transferencia o contraentrega</span>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
