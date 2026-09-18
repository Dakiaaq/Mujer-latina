import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { ShoppingBag, Heart, User, Menu, X, LogIn, ShieldCheck } from 'lucide-react';

interface TopNavBarProps {
  controller: StoreController;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ controller }) => {
  const {
    activeView,
    setActiveView,
    cartTotalCount,
    wishlist,
    currentUser,
    openLoginModal,
    storeSettings,
    setIsProfileEditing,
  } = controller;

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const brandLogoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdNwwVQtlCdmCLIffs_4B-7mTe5vBcdO7JVBvf_dbsl4nAtNz1aHLVy21EcMr_VSAk0HKqaGAiXfgw7u67mUujsb8SqrunVsrB_Hz6AM4lJP09IDIlhLSNPY6OuIde7HwczlB6sk7_aIG5AyeIScVfB9f25RtvJqNrBxKELLtyab_gFMph46y-9FKnheMPlvRIvtHG5hOtjlrf3STQRcImBPjT5-UByzDqnTu4sxBAb1UpylVUboXdiHvasV00KeIsGA';

  return (
    <header className="sticky top-0 z-50 bg-[#111111] text-white border-b border-[#2b2b2b] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="nav-brand-logo"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-lg group-hover:scale-105 transition duration-300">
              <img
                src={brandLogoUrl}
                alt={storeSettings?.storeName || "Mujer Latina"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#d4af37] transition">
                {storeSettings?.storeName || 'Mujer Latina'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveView('home')}
              className={`transition pb-1 ${
                activeView === 'home'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveView('catalog')}
              className={`transition pb-1 ${
                activeView === 'catalog' || activeView === 'product_detail'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveView('about')}
              className={`transition pb-1 ${
                activeView === 'about'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Nosotros
            </button>
          </nav>

          {/* Action Icons (Wishlist, Cart, Profile) */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Wishlist Icon */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="relative p-2 text-stone-300 hover:text-[#d4af37] transition"
              title="Mis Favoritos"
              id="nav-wishlist-btn"
            >
              <Heart size={22} className={wishlist.length > 0 ? 'fill-[#d4af37] text-[#d4af37]' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setActiveView('cart')}
              className="relative p-2 text-stone-300 hover:text-[#d4af37] transition"
              title="Carrito de Compras"
              id="nav-cart-btn"
            >
              <ShoppingBag size={22} />
              {cartTotalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#25D366] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Authentication / User State */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Admin shortcut button ONLY for administrators */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveView('admin_dashboard')}
                    className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black rounded-full text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-sm"
                    title="Panel de Administración"
                    id="nav-admin-panel-btn"
                  >
                    <ShieldCheck size={14} />
                    <span className="hidden sm:inline">Panel Admin</span>
                  </button>
                )}

                {/* Profile link button showing user's name & avatar */}
                <button
                  onClick={() => {
                    setIsProfileEditing(false);
                    if (currentUser.role === 'admin') {
                      setActiveView('admin_dashboard');
                    } else {
                      setActiveView('profile');
                    }
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-800 transition group cursor-pointer"
                  title={`Mi Perfil (${currentUser.fullName})`}
                  id="nav-profile-btn"
                >
                  <div className="relative">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-[#d4af37] group-hover:ring-2 group-hover:ring-[#d4af37]/60 transition"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-800 text-[#d4af37] flex items-center justify-center border border-stone-700 group-hover:border-[#d4af37] transition">
                        <User size={18} />
                      </div>
                    )}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium text-stone-300 max-w-[100px] truncate group-hover:text-[#d4af37] transition">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </button>
              </div>
            ) : (
              /* When NO session: ONLY show elegant "Iniciar sesión" button */
              <button
                onClick={openLoginModal}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold tracking-wide border border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center gap-1.5 shadow-sm"
                title="Iniciar sesión"
                id="nav-login-btn"
              >
                <LogIn size={15} />
                <span>Iniciar sesión</span>
              </button>
            )}

            {/* Mobile hamburger menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161616] border-b border-stone-800 px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
          <button
            onClick={() => { setActiveView('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 rounded text-stone-200 hover:bg-stone-800 font-medium"
          >
            Inicio
          </button>
          <button
            onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 rounded text-stone-200 hover:bg-stone-800 font-medium"
          >
            Catálogo
          </button>
          <button
            onClick={() => { setActiveView('about'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 px-3 rounded text-stone-200 hover:bg-stone-800 font-medium"
          >
            Nosotros
          </button>

          {/* Conditional Mobile Auth */}
          <div className="pt-2 border-t border-stone-800">
            {currentUser ? (
              <div className="space-y-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => { setActiveView('admin_dashboard'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold text-xs flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>Panel de Administración</span>
                  </button>
                )}
                <button
                  onClick={() => { 
                    setIsProfileEditing(false);
                    setActiveView('profile'); 
                    setMobileMenuOpen(false); 
                  }}
                  className="w-full text-left py-2 px-3 rounded text-stone-200 hover:bg-stone-800 font-medium text-xs flex items-center gap-2"
                >
                  <User size={16} className="text-[#d4af37]" />
                  <span>Mi Perfil ({currentUser.fullName.split(' ')[0]})</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openLoginModal(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#d4af37] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn size={15} />
                <span>Iniciar sesión</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
