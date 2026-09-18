import React, { useState, useEffect } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { StoreSettings, UserProfile } from '../../types';
import { 
  UserCheck, 
  Store, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Truck, 
  Sparkles, 
  Instagram, 
  Facebook, 
  Video, 
  X, 
  RefreshCw,
  Sliders,
  Camera,
  ExternalLink
} from 'lucide-react';

interface AdminSettingsViewProps {
  controller: StoreController;
}

// Avatares elegantes preconfigurados para administradora
const PRESET_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQBgiQ85pSSw6cK2vJFhXzUp2R3Dw04SJd-fJNatrQsrNLNbcSDL9Y1nBbLea8_AMJfndsXWqdZ30dGzRXoGp3_Prh16E0b1hCyhnKmwrn-MaVJ3JQlZGckfTs45neGHPrcaWaamdTZrTy8m2HQ9PgBrQAlNJOzHxUHAYvDLut5SIpZZ6WG-oiWiBRwvml9ZaPrxkBjv1PWKTqfQatxqKYg2akJTdhbmGDEJtj9pX5mMu1pHI4fNNh',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
];

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ controller }) => {
  const { 
    currentUser, 
    updateAdminAccount, 
    storeSettings, 
    updateStoreSettings,
    setActiveView 
  } = controller;

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'account' | 'store'>('account');

  // Notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // =========================================================================
  // ADMIN ACCOUNT FORM STATE
  // =========================================================================
  const [accountForm, setAccountForm] = useState({
    fullName: currentUser?.fullName || 'Administradora Mujer Latina',
    email: currentUser?.email || 'admin@mujerlatina.com',
    phone: currentUser?.phone || '+57 320 987 2232',
    documentType: currentUser?.documentType || 'Cédula de ciudadanía (C.C.)',
    documentNumber: currentUser?.documentNumber || '52987223',
    department: currentUser?.department || 'Cundinamarca',
    city: currentUser?.city || 'Bogotá',
    address: currentUser?.address || 'Sede Principal Calle 93 # 11-45',
    avatarUrl: currentUser?.avatarUrl || PRESET_AVATARS[0],
    roleTitle: 'Super Administradora & Propietaria',
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({});

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setAccountForm((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        documentType: currentUser.documentType || prev.documentType,
        documentNumber: currentUser.documentNumber || prev.documentNumber,
        department: currentUser.department || prev.department,
        city: currentUser.city || prev.city,
        address: currentUser.address || prev.address,
        avatarUrl: currentUser.avatarUrl || prev.avatarUrl,
      }));
    }
  }, [currentUser]);

  // Handle image upload via FileReader
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast('La imagen excede el límite recomendado de 3MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAccountForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        showToast('Foto de perfil cargada en vista previa. Recuerda guardar cambios.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Account Form
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!accountForm.fullName.trim()) errors.fullName = 'El nombre es obligatorio';
    if (!accountForm.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email.trim())) {
      errors.email = 'Formato de correo inválido';
    }
    if (!accountForm.phone.trim()) errors.phone = 'El teléfono es obligatorio';

    // Password validation if changing
    const wantsToChangePassword = Boolean(passwordForm.newPassword.trim() || passwordForm.currentPassword.trim());
    if (wantsToChangePassword) {
      if (!passwordForm.currentPassword.trim()) {
        errors.currentPassword = 'Ingresa tu contraseña actual para autorizar el cambio';
      }
      if (passwordForm.newPassword.length < 6) {
        errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setAccountErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Por favor corrige los campos señalados.', 'error');
      return;
    }

    setIsSavingAccount(true);
    try {
      const passwordData = wantsToChangePassword
        ? {
            currentPassword: passwordForm.currentPassword.trim(),
            newPassword: passwordForm.newPassword.trim(),
          }
        : undefined;

      const profilePayload: Partial<UserProfile> = {
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim().toLowerCase(),
        phone: accountForm.phone.trim(),
        documentType: accountForm.documentType,
        documentNumber: accountForm.documentNumber.trim(),
        documentId: `${accountForm.documentType.split('(')[1]?.replace(')', '') || 'C.C.'} ${accountForm.documentNumber.trim()}`,
        department: accountForm.department.trim(),
        city: accountForm.city.trim(),
        address: accountForm.address.trim(),
        avatarUrl: accountForm.avatarUrl,
      };

      const result = await updateAdminAccount(profilePayload, passwordData);

      if (result.success) {
        showToast('¡Datos de tu cuenta de administradora actualizados con éxito!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(result.error || 'Error al actualizar la cuenta.', 'error');
      }
    } catch {
      showToast('Ocurrió un error inesperado al guardar los datos.', 'error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  // =========================================================================
  // STORE SETTINGS FORM STATE (SOLO LAS COSAS IMPORTANTES)
  // =========================================================================
  const [storeForm, setStoreForm] = useState<StoreSettings>({
    storeName: storeSettings.storeName,
    storeSlogan: storeSettings.storeSlogan,
    whatsappNumber: storeSettings.whatsappNumber,
    whatsappDisplay: storeSettings.whatsappDisplay,
    supportEmail: storeSettings.supportEmail,
    supportPhone: storeSettings.supportPhone,
    storeAddress: storeSettings.storeAddress,
    storeCity: storeSettings.storeCity,
    storeDepartment: storeSettings.storeDepartment,
    businessHours: storeSettings.businessHours,
    standardShippingFee: storeSettings.standardShippingFee,
    freeShippingThreshold: storeSettings.freeShippingThreshold,
    bannerEnabled: storeSettings.bannerEnabled,
    bannerText: storeSettings.bannerText,
    instagramUrl: storeSettings.instagramUrl,
    tiktokUrl: storeSettings.tiktokUrl,
    facebookUrl: storeSettings.facebookUrl,
  });

  const [isSavingStore, setIsSavingStore] = useState(false);
  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({});

  // Sync storeForm if storeSettings change
  useEffect(() => {
    setStoreForm(storeSettings);
  }, [storeSettings]);

  // Submit Store Form
  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!storeForm.storeName.trim()) errors.storeName = 'El nombre de la marca es obligatorio';
    if (!storeForm.whatsappNumber.trim()) errors.whatsappNumber = 'El WhatsApp de pedidos es vital';
    if (!storeForm.supportEmail.trim()) errors.supportEmail = 'El correo de soporte es obligatorio';

    setStoreErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Por favor completa los campos requeridos de la tienda.', 'error');
      return;
    }

    setIsSavingStore(true);
    try {
      // Limpiar formato de WhatsApp para enlaces (ej: 573108924110)
      const cleanWhatsappDigits = storeForm.whatsappNumber.replace(/[^0-9]/g, '');

      updateStoreSettings({
        ...storeForm,
        whatsappNumber: cleanWhatsappDigits,
      });

      showToast('¡Configuración de la tienda guardada correctamente!');
    } catch {
      showToast('Error al guardar la configuración de la tienda.', 'error');
    } finally {
      setIsSavingStore(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-[#fcfcfc] min-h-screen text-stone-800" id="admin-settings-view">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-4 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs sm:text-sm max-w-md ${
            toast.type === 'success' 
              ? 'bg-stone-900 text-white border-stone-700' 
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
            toast.type === 'success' ? 'bg-[#d4af37] text-stone-950' : 'bg-white text-rose-900'
          }`}>
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <span className="font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white ml-auto p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header & Section Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4af37]/20 text-stone-900 border border-[#d4af37]/40 flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#b58d24]" />
              Panel Administrativo
            </span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Configuración del Sistema
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Administra los datos de tu cuenta como administradora y los parámetros operativos clave de la tienda.
          </p>
        </div>

        {/* Quick Link to Storefront */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('home')}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-stone-200"
          >
            <ExternalLink size={13} className="text-[#d4af37]" />
            <span>Ver Tienda en Vivo</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100/90 rounded-2xl w-full sm:w-fit border border-stone-200">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'account'
              ? 'bg-white text-stone-950 shadow-sm border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-900 hover:bg-white/50'
          }`}
          id="tab-btn-admin-account"
        >
          <UserCheck size={16} className={activeTab === 'account' ? 'text-[#d4af37]' : 'text-stone-400'} />
          <span>Mi Cuenta de Administradora</span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'store'
              ? 'bg-white text-stone-950 shadow-sm border border-stone-200/80'
              : 'text-stone-500 hover:text-stone-900 hover:bg-white/50'
          }`}
          id="tab-btn-store-settings"
        >
          <Store size={16} className={activeTab === 'store' ? 'text-[#d4af37]' : 'text-stone-400'} />
          <span>Configuración de la Tienda</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MI CUENTA DE ADMINISTRADORA */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="space-y-6">
          
          {/* Card: Avatar & Summary Profile Header */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-md bg-stone-100 flex-shrink-0">
                <img
                  src={accountForm.avatarUrl}
                  alt={accountForm.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PRESET_AVATARS[0];
                  }}
                />
              </div>

              {/* Upload label button overlay */}
              <label 
                htmlFor="avatar-upload-input" 
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition rounded-2xl flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold gap-1"
                title="Subir foto de perfil"
              >
                <Camera size={18} />
                <span>Cambiar Foto</span>
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37] text-stone-950 uppercase tracking-wider">
                  Super Administradora
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Estado Activo
                </span>
                <span className="text-stone-400 text-xs">
                  Miembro desde {currentUser?.memberSince || '2023'}
                </span>
              </div>

              <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">
                {accountForm.fullName || 'Administradora Mujer Latina'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={13} className="text-stone-400" />
                <span>{accountForm.email}</span>
                <span className="text-stone-300">•</span>
                <Phone size={13} className="text-stone-400" />
                <span>{accountForm.phone}</span>
              </p>

              {/* Selector rápido de avatares preconfigurados */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-stone-500 mb-1.5">
                  Elige un avatar sugerido o sube tu propia foto:
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAccountForm((p) => ({ ...p, avatarUrl: url }))}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition hover:scale-110 ${
                        accountForm.avatarUrl === url ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-105' : 'border-stone-200'
                      }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <label
                    htmlFor="avatar-upload-input"
                    className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-600 cursor-pointer transition text-xs"
                    title="Subir desde tu equipo"
                  >
                    <Upload size={12} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Información Personal y de Contacto */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 text-[#b58d24] flex items-center justify-center font-bold">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Datos Personales y de Contacto</h3>
                <p className="text-xs text-stone-500">Información visible en auditorías internas y órdenes de despacho</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                  placeholder="Ej. Valeria Gómez Restrepo"
                  className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                    accountErrors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                  id="admin-input-fullname"
                />
                {accountErrors.fullName && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.fullName}</p>
                )}
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Correo Electrónico (Acceso al Panel) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder="admin@mujerlatina.com"
                  className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                    accountErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                  id="admin-input-email"
                />
                {accountErrors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.email}</p>
                )}
              </div>

              {/* Teléfono / WhatsApp personal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Teléfono / WhatsApp Administrativo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountForm.phone}
                  onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                  placeholder="+57 320 987 2232"
                  className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                    accountErrors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                  id="admin-input-phone"
                />
                {accountErrors.phone && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.phone}</p>
                )}
              </div>

              {/* Cargo / Título Interno */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Cargo o Título Directivo
                </label>
                <input
                  type="text"
                  value={accountForm.roleTitle}
                  onChange={(e) => setAccountForm({ ...accountForm, roleTitle: e.target.value })}
                  placeholder="Super Administradora & Propietaria"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                  id="admin-input-role-title"
                />
              </div>

              {/* Tipo de Documento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Tipo de Documento
                </label>
                <select
                  value={accountForm.documentType}
                  onChange={(e) => setAccountForm({ ...accountForm, documentType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                  id="admin-select-document-type"
                >
                  <option value="Cédula de ciudadanía (C.C.)">Cédula de ciudadanía (C.C.)</option>
                  <option value="Cédula de extranjería (C.E.)">Cédula de extranjería (C.E.)</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT de Persona Natural / Jurídica</option>
                </select>
              </div>

              {/* Número de Documento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={accountForm.documentNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, documentNumber: e.target.value })}
                  placeholder="52987223"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                  id="admin-input-document-number"
                />
              </div>

              {/* Departamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Departamento / Región
                </label>
                <input
                  type="text"
                  value={accountForm.department}
                  onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })}
                  placeholder="Cundinamarca / Antioquia"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Ciudad / Municipio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Ciudad / Municipio
                </label>
                <input
                  type="text"
                  value={accountForm.city}
                  onChange={(e) => setAccountForm({ ...accountForm, city: e.target.value })}
                  placeholder="Bogotá / Medellín"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Dirección Principal */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Dirección Principal de Correspondencia u Oficina
                </label>
                <input
                  type="text"
                  value={accountForm.address}
                  onChange={(e) => setAccountForm({ ...accountForm, address: e.target.value })}
                  placeholder="Sede Principal Calle 93 # 11-45, Of. 302"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

            </div>
          </div>

          {/* Card: Seguridad y Cambio de Contraseña */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Seguridad y Cambio de Contraseña</h3>
                <p className="text-xs text-stone-500">Solo completa estos campos si deseas actualizar tu contraseña de acceso</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Contraseña Actual */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                      accountErrors.currentPassword ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    id="admin-input-current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {accountErrors.currentPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.currentPassword}</p>
                )}
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                      accountErrors.newPassword ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    id="admin-input-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {accountErrors.newPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.newPassword}</p>
                )}
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repite la nueva clave"
                    className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                      accountErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                    }`}
                    id="admin-input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {accountErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 font-medium">{accountErrors.confirmPassword}</p>
                )}
              </div>

            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-2.5 text-xs text-stone-600">
              <ShieldCheck size={16} className="text-[#b58d24] mt-0.5 flex-shrink-0" />
              <span>
                Las contraseñas de las cuentas administradoras se almacenan mediante hash criptográfico <strong>SHA-256</strong> con salazón única. Nunca se almacenan en texto plano en la base de datos ni en el almacenamiento local.
              </span>
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSavingAccount}
              className="px-6 py-3 bg-[#d4af37] hover:bg-[#c29e2f] text-stone-950 rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-[#d4af37]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="admin-save-account-btn"
            >
              {isSavingAccount ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSavingAccount ? 'Guardando cambios...' : 'Guardar Datos de Mi Cuenta'}</span>
            </button>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONFIGURACIÓN DE LA TIENDA Y LA PÁGINA (SOLO LO IMPORTANTE) */}
      {/* ========================================================================= */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStore} className="space-y-6">
          
          {/* Card 1: Identidad de Marca & WhatsApp de Pedidos */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 text-[#b58d24] flex items-center justify-center font-bold">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Identidad de Marca & Canal de Pedidos</h3>
                <p className="text-xs text-stone-500">Parámetros clave visibles en el encabezado, pie de página y checkout</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Nombre de la Marca */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Nombre Comercial de la Tienda <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeForm.storeName}
                  onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                  placeholder="Mujer Latina"
                  className={`w-full px-4 py-2.5 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition ${
                    storeErrors.storeName ? 'border-rose-400 bg-rose-50/20' : 'border-stone-200'
                  }`}
                  id="store-input-name"
                />
                {storeErrors.storeName && (
                  <p className="text-[11px] text-rose-500 font-medium">{storeErrors.storeName}</p>
                )}
              </div>

              {/* Slogan Comercial */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Lema / Slogan Comercial
                </label>
                <input
                  type="text"
                  value={storeForm.storeSlogan}
                  onChange={(e) => setStoreForm({ ...storeForm, storeSlogan: e.target.value })}
                  placeholder="Belleza que Empodera"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                  id="store-input-slogan"
                />
              </div>

              {/* WhatsApp Oficial para Pedidos (CLAVE) */}
              <div className="space-y-1.5 sm:col-span-2 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Número de WhatsApp Business Oficial para Recepción de Pedidos</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                    Canal Principal de Ventas
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-stone-500 block mb-1">
                      Número con código de país (sin símbolos ni espacios para enlace wa.me)
                    </span>
                    <input
                      type="text"
                      value={storeForm.whatsappNumber}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                      placeholder="573108924110"
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                        storeErrors.whatsappNumber ? 'border-rose-400' : 'border-emerald-300'
                      }`}
                      id="store-input-whatsapp-number"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 block mb-1">
                      Formato legible para mostrar en pantalla a clientes
                    </span>
                    <input
                      type="text"
                      value={storeForm.whatsappDisplay}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsappDisplay: e.target.value })}
                      placeholder="+57 310 892 4110"
                      className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      id="store-input-whatsapp-display"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-emerald-900 mt-2">
                  ℹ️ Este número es el receptor automático de todas las compras confirmadas por los clientes mediante el checkout de WhatsApp.
                </p>
              </div>

            </div>
          </div>

          {/* Card 2: Contacto, Horarios y Ubicación */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-700 flex items-center justify-center font-bold">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Atención al Cliente y Sede Física</h3>
                <p className="text-xs text-stone-500">Información legal de contacto y punto de despacho para clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Correo de Soporte */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Correo Electrónico de Soporte / Atención <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={storeForm.supportEmail}
                  onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value })}
                  placeholder="contacto@mujerlatina.com"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                  id="store-input-support-email"
                />
              </div>

              {/* Teléfono de Asistencia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Línea Telefónica de Asistencia
                </label>
                <input
                  type="text"
                  value={storeForm.supportPhone}
                  onChange={(e) => setStoreForm({ ...storeForm, supportPhone: e.target.value })}
                  placeholder="+57 (300) 123-4567"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Dirección Sede */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Dirección de la Tienda Física / Punto de Despacho
                </label>
                <input
                  type="text"
                  value={storeForm.storeAddress}
                  onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
                  placeholder="Calle 10 # 40-20, El Poblado"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Ciudad y Departamento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Ciudad y Departamento
                </label>
                <input
                  type="text"
                  value={`${storeForm.storeCity}, ${storeForm.storeDepartment}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setStoreForm({
                      ...storeForm,
                      storeCity: parts[0]?.trim() || '',
                      storeDepartment: parts[1]?.trim() || '',
                    });
                  }}
                  placeholder="Medellín, Antioquia"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Horario de Atención */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Horario de Atención al Público
                </label>
                <input
                  type="text"
                  value={storeForm.businessHours}
                  onChange={(e) => setStoreForm({ ...storeForm, businessHours: e.target.value })}
                  placeholder="Lunes a Sábado: 8:00 AM - 7:00 PM"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

            </div>
          </div>

          {/* Card 3: Envíos y Logística Nacional */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Tarifas de Envío y Despacho Nacional</h3>
                <p className="text-xs text-stone-500">Controla el cálculo automático de fletes en el carrito de compras</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Costo de Envío Estándar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Costo de Envío Estándar Nacional (COP $)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={storeForm.standardShippingFee}
                    onChange={(e) => setStoreForm({ ...storeForm, standardShippingFee: Number(e.target.value) || 0 })}
                    placeholder="15000"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                    id="store-input-shipping-fee"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Tarifa aplicada a pedidos que no alcancen el monto mínimo para envío gratuito.
                </p>
              </div>

              {/* Monto Mínimo para Envío Gratis */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Monto Mínimo para Envío Gratis (COP $)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    value={storeForm.freeShippingThreshold}
                    onChange={(e) => setStoreForm({ ...storeForm, freeShippingThreshold: Number(e.target.value) || 0 })}
                    placeholder="150000"
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                    id="store-input-free-shipping-threshold"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Compras iguales o superiores a este valor tendrán flete $0 COP.
                </p>
              </div>

            </div>
          </div>

          {/* Card 4: Barra Superior de Anuncios (Banner Promocional) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Barra Promocional de Anuncios Superior</h3>
                  <p className="text-xs text-stone-500">Franja destacada en la parte superior del encabezado</p>
                </div>
              </div>

              {/* Switch Activar/Desactivar */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={storeForm.bannerEnabled}
                  onChange={(e) => setStoreForm({ ...storeForm, bannerEnabled: e.target.checked })}
                  className="sr-only peer"
                  id="store-switch-banner"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                <span className="ml-2 text-xs font-bold text-stone-700">
                  {storeForm.bannerEnabled ? 'Activo' : 'Desactivado'}
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Texto del Anuncio Promocional
              </label>
              <textarea
                rows={2}
                value={storeForm.bannerText}
                onChange={(e) => setStoreForm({ ...storeForm, bannerText: e.target.value })}
                placeholder="✨ Envíos gratis por compras superiores a $150.000 COP a toda Colombia | Paga contraentrega o transferencia"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition resize-none"
                id="store-input-banner-text"
              />
              
              {storeForm.bannerEnabled && (
                <div className="p-3 bg-stone-900 text-white rounded-xl text-xs flex items-center justify-between shadow-inner">
                  <span className="text-stone-400 font-mono text-[10px] uppercase">Vista Previa:</span>
                  <span className="text-stone-200 text-center flex-1 mx-3 font-medium">
                    {storeForm.bannerText}
                  </span>
                  <span className="text-[#d4af37] text-[10px] font-bold">ACTIVO</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 5: Redes Sociales Oficiales */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-700 flex items-center justify-center font-bold">
                <Instagram size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-base">Redes Sociales Oficiales</h3>
                <p className="text-xs text-stone-500">Enlaces a los perfiles oficiales mostrados en el pie de página</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Instagram size={13} className="text-pink-600" />
                  <span>Instagram</span>
                </label>
                <input
                  type="text"
                  value={storeForm.instagramUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/mujerlatina.col"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Video size={13} className="text-stone-800" />
                  <span>TikTok</span>
                </label>
                <input
                  type="text"
                  value={storeForm.tiktokUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, tiktokUrl: e.target.value })}
                  placeholder="https://tiktok.com/@mujerlatina"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Facebook size={13} className="text-blue-600" />
                  <span>Facebook</span>
                </label>
                <input
                  type="text"
                  value={storeForm.facebookUrl}
                  onChange={(e) => setStoreForm({ ...storeForm, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/mujerlatinabeauty"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition"
                />
              </div>

            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSavingStore}
              className="px-6 py-3 bg-[#d4af37] hover:bg-[#c29e2f] text-stone-950 rounded-2xl text-xs sm:text-sm font-bold transition shadow-md shadow-[#d4af37]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="store-save-settings-btn"
            >
              {isSavingStore ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSavingStore ? 'Guardando configuración...' : 'Guardar Configuración de la Tienda'}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
