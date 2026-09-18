import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Star, ShoppingBag, Heart, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedProductsBentoProps {
  controller: StoreController;
}

export const FeaturedProductsBento: React.FC<FeaturedProductsBentoProps> = ({ controller }) => {
  const {
    products,
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
  } = controller;

  // Find the hero gold treatment product
  const heroProduct = products.find((p) => p.sku === 'ML-CAP-001') || products[0];
  // Secondary featured products
  const secondaryProducts = products.filter((p) => p.id !== heroProduct.id && p.isFeatured).slice(0, 4);

  return (
    <section className="py-16 bg-[#f7f6f2] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-[#b58d24] font-bold">
              <Sparkles size={14} />
              <span>Edición De Lujo</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              Colección Destacada
            </h2>
          </div>
          <button
            onClick={() => setActiveView('catalog')}
            className="mt-4 md:mt-0 text-sm font-semibold text-[#b58d24] hover:text-[#8e6e19] flex items-center gap-1.5 group"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Hero Card (Large Feature 7 cols) */}
          <div className="lg:col-span-7 bg-[#111111] text-white rounded-2xl overflow-hidden border border-[#d4af37]/50 shadow-xl flex flex-col justify-between relative group">
            <div className="p-8 sm:p-10 z-10 space-y-4 max-w-lg">
              <span className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] rounded-full text-xs font-bold uppercase tracking-wider">
                Colección Oro Puro
              </span>

              <h3 className="font-serif-title text-3xl sm:text-4xl font-bold text-white leading-tight">
                {heroProduct.name}
              </h3>

              <div className="flex items-center gap-2 text-[#d4af37]">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#d4af37]" />
                  ))}
                </div>
                <span className="text-sm font-bold text-white">{heroProduct.rating}</span>
                <span className="text-xs text-stone-400">({heroProduct.reviewsCount} reseñas)</span>
              </div>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                {heroProduct.description}
              </p>

              <div className="pt-2 flex items-center gap-6">
                <div>
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Precio</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#d4af37]">
                    ${heroProduct.price.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => addToCart(heroProduct, 1)}
                    id="hero-add-cart-btn"
                    className="px-6 py-3 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-semibold rounded-full shadow-md flex items-center gap-2 text-sm transition"
                  >
                    <ShoppingBag size={16} />
                    <span>Añadir</span>
                  </button>

                  <button
                    onClick={() => navigateToProduct(heroProduct)}
                    className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-full text-sm font-medium transition"
                  >
                    Detalles
                  </button>
                </div>
              </div>
            </div>

            {/* Product visual showcase inside hero */}
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-stone-900/50">
              <img
                src={heroProduct.imageUrl}
                alt={heroProduct.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            </div>
          </div>

          {/* Secondary Bento Grid (5 cols, 2x2 cards) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {secondaryProducts.map((product) => {
              const favorite = isInWishlist(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col group relative"
                  id={`bento-product-${product.sku}`}
                >
                  {/* Image container */}
                  <div 
                    onClick={() => navigateToProduct(product)}
                    className="relative w-full aspect-square bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                        Últimas {product.stock}
                      </span>
                    )}

                    {/* Wishlist quick toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow flex items-center justify-center text-stone-700 hover:text-red-500 transition"
                      title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      <Heart
                        size={16}
                        className={favorite ? 'fill-red-500 text-red-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] text-[#b58d24] font-semibold uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h4 
                        onClick={() => navigateToProduct(product)}
                        className="font-serif-title text-base font-bold text-stone-900 group-hover:text-[#b58d24] transition cursor-pointer line-clamp-1 mt-0.5"
                      >
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
                        <Star size={13} className="fill-[#d4af37] text-[#d4af37]" />
                        <span>{product.rating}</span>
                        <span>({product.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-lg font-bold text-stone-900">
                        ${product.price.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="p-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black rounded-full transition"
                        title="Añadir al Carrito"
                      >
                        <ShoppingBag size={15} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
