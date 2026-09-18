import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistViewProps {
  controller: StoreController;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ controller }) => {
  const {
    wishlistProducts,
    toggleWishlist,
    addToCart,
    navigateToProduct,
    setActiveView,
  } = controller;

  if (wishlistProducts.length === 0) {
    return (
      <div className="bg-[#fcfcfc] min-h-[65vh] py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-4 px-4">
          <div className="w-20 h-20 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Heart size={36} />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-stone-800">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-stone-500 text-sm">
            Guarda aquí los productos que amas haciendo clic en el corazón para encontrarlos en cualquier momento.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="mt-3 px-8 py-3.5 bg-[#d4af37] text-black font-bold rounded-full shadow hover:bg-[#c29e2f] transition inline-flex items-center gap-2"
          >
            <span>Explorar Colecciones</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif-title text-3xl font-bold text-stone-900 flex items-center gap-3">
              <span>Mis Favoritos</span>
              <Heart size={24} className="fill-[#d4af37] text-[#d4af37]" />
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Tienes {wishlistProducts.length} producto{wishlistProducts.length > 1 ? 's' : ''} guardado{wishlistProducts.length > 1 ? 's' : ''} en tu lista personal.
            </p>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="text-sm font-semibold text-[#b58d24] hover:underline"
          >
            + Seguir agregando productos
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col group relative"
                id={`wishlist-card-${product.sku}`}
              >
                {/* Image */}
                <div
                  onClick={() => navigateToProduct(product)}
                  className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-400 hover:text-red-500 transition"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Stock status badge */}
                  <div className="absolute top-3 left-3">
                    {isOutOfStock ? (
                      <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                        Agotado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                        En Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] text-[#b58d24] font-semibold uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => navigateToProduct(product)}
                      className="font-serif-title text-base font-bold text-stone-900 group-hover:text-[#b58d24] transition cursor-pointer line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-stone-900">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-[#d4af37] disabled:bg-stone-200 text-white hover:text-black disabled:text-stone-400 rounded-full text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ShoppingBag size={13} />
                      <span>{isOutOfStock ? 'Agotado' : 'Al Carrito'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
