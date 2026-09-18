import React, { useState } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Product } from '../types';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ProductDetailViewProps {
  controller: StoreController;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ controller }) => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    navigateToProduct,
    products,
  } = controller;

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Producto no seleccionado.</p>
        <button
          onClick={() => setActiveView('catalog')}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-full text-sm font-semibold"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  // Thumbnails: main image + galleryUrls
  const allImages = [
    selectedProduct.imageUrl,
    ...(selectedProduct.galleryUrls && selectedProduct.galleryUrls.length > 0
      ? selectedProduct.galleryUrls
      : []),
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [addedToast, setAddedToast] = useState(false);

  // Reviews form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'Isabella Gómez',
      rating: 5,
      date: 'Hace 3 días',
      comment: '¡Absolutamente maravilloso! La textura y el brillo que deja en el cabello es como salir de un salón de belleza de lujo. Repetiré sin duda.',
    },
    {
      id: 'rev-2',
      name: 'Mariana Duarte',
      rating: 5,
      date: 'Hace 1 semana',
      comment: 'El aroma es delicioso y los resultados se notan desde la primera aplicación. Me encantó el empaque y la atención por WhatsApp.',
    },
  ]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    setReviewsList((prev) => [
      {
        id: `rev-${Date.now()}`,
        name: reviewerName.trim(),
        rating: reviewerRating,
        date: 'Reciente',
        comment: reviewerComment.trim(),
      },
      ...prev,
    ]);

    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const favorite = isInWishlist(selectedProduct.id);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back and Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveView('catalog')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900 transition"
          >
            <ArrowLeft size={16} />
            <span>Volver al Catálogo</span>
          </button>

          <nav className="hidden sm:flex text-xs text-stone-400 gap-2">
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('home')}>Inicio</span>
            <span>/</span>
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('catalog')}>Catálogo</span>
            <span>/</span>
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('catalog')}>{selectedProduct.category}</span>
            <span>/</span>
            <span className="text-[#b58d24] font-medium truncate max-w-[200px]">{selectedProduct.name}</span>
          </nav>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
          
          {/* Left: Gallery Column (7 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
              <img
                src={allImages[activeImageIndex] || selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover transition duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center text-stone-700 hover:text-red-500 transition"
                title="Añadir a lista de deseos"
              >
                <Heart size={20} className={favorite ? 'fill-red-500 text-red-500' : ''} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition flex-shrink-0 bg-stone-100 ${
                      activeImageIndex === idx
                        ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Buy Box & Details (6 cols) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#b58d24] uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <span className="font-mono text-stone-400">SKU: {selectedProduct.sku}</span>
              </div>

              <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                {selectedProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={17}
                      className={
                        i < Math.floor(selectedProduct.rating)
                          ? 'fill-[#d4af37] text-[#d4af37]'
                          : 'text-stone-300'
                      }
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{selectedProduct.rating}</span>
                <span className="text-stone-400">({reviewsList.length + selectedProduct.reviewsCount} reseñas verificadas)</span>
              </div>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-3xl sm:text-4xl font-bold text-stone-900">
                  ${selectedProduct.price.toFixed(2)}
                </span>
                {selectedProduct.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full">
                    <CheckCircle2 size={13} />
                    {selectedProduct.stock <= 5 ? `¡Solo quedan ${selectedProduct.stock} unidades!` : 'En Stock disponible'}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-full">
                    Agotado Temporalmente
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed pt-2">
                {selectedProduct.description}
              </p>

              {/* Quantity Selector & Add to Cart */}
              <div className="pt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-stone-50">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-4 py-2 text-stone-600 hover:bg-stone-200 transition font-bold disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-stone-900 font-bold text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= selectedProduct.stock}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-4 py-2 text-stone-600 hover:bg-stone-200 transition font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={selectedProduct.stock <= 0}
                    onClick={handleAddToCart}
                    id="product-detail-add-cart"
                    className="flex-1 min-w-[200px] py-3.5 px-6 bg-[#d4af37] hover:bg-[#c29e2f] disabled:bg-stone-300 text-black disabled:text-stone-500 font-semibold rounded-full shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2 transition duration-200"
                  >
                    <ShoppingBag size={18} />
                    <span>{selectedProduct.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}</span>
                  </button>
                </div>

                {/* Toast Notification */}
                {addedToast && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span>¡{selectedProduct.name} añadido a tu carrito!</span>
                    </div>
                    <button
                      onClick={() => setActiveView('cart')}
                      className="underline hover:text-emerald-950 font-bold"
                    >
                      Ver Carrito →
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Trust highlights */}
            <div className="pt-6 border-t border-stone-100 grid grid-cols-2 gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-[#b58d24]" />
                <span>Envío express nacional</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#b58d24]" />
                <span>Garantía de originalidad</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <div className="mt-12 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10">
          
          <div className="flex border-b border-stone-200 gap-8">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-sm sm:text-base font-serif-title font-bold transition border-b-2 ${
                activeTab === 'desc'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Descripción Detallada
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm sm:text-base font-serif-title font-bold transition border-b-2 ${
                activeTab === 'specs'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Especificaciones
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm sm:text-base font-serif-title font-bold transition border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Reseñas de Clientes ({reviewsList.length})
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed max-w-4xl">
                <p>{selectedProduct.description}</p>
                <p>
                  Cada lote de producción es testeado dermatológicamente y formulado sin crueldad animal. Nuestro compromiso con los estándares de pureza garantiza una aplicación uniforme, sedosa y de larga persistencia aromática y visual.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-sm text-stone-700 max-w-2xl space-y-3">
                <p><strong>SKU de Fabricación:</strong> {selectedProduct.sku}</p>
                <p><strong>Categoría Principal:</strong> {selectedProduct.category}</p>
                <p><strong>Especificaciones Técnicas:</strong> {selectedProduct.specifications || 'Fórmula concentrada de alta cosmética.'}</p>
                <p><strong>Certificación:</strong> Aprobación de control de calidad para cosméticos.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Reviews list */}
                <div className="lg:col-span-7 space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-stone-100 bg-stone-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{rev.name}</span>
                        <span className="text-xs text-stone-400">{rev.date}</span>
                      </div>
                      <div className="flex text-[#d4af37]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < rev.rating ? 'fill-[#d4af37]' : 'text-stone-300'}
                          />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Form to leave a review */}
                <div className="lg:col-span-5 bg-stone-50 p-6 rounded-2xl border border-stone-200">
                  <h4 className="font-serif-title text-lg font-bold text-stone-900 mb-3">
                    Deja tu Valoración
                  </h4>
                  <form onSubmit={handleAddReview} className="space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Tu Nombre</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Ej. Sofía Morales"
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Calificación</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewerRating(star)}
                            className="p-1 hover:scale-110 transition"
                          >
                            <Star
                              size={20}
                              className={
                                star <= reviewerRating
                                  ? 'fill-[#d4af37] text-[#d4af37]'
                                  : 'text-stone-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Tu Comentario</label>
                      <textarea
                        rows={3}
                        required
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Cuéntanos tu experiencia con este producto..."
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-semibold rounded-lg transition"
                    >
                      Publicar Reseña
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="font-serif-title text-2xl font-bold text-stone-900 mb-6">
              También te podría gustar
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigateToProduct(rel)}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer group flex flex-col"
                >
                  <div className="aspect-square w-full bg-stone-100 overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="font-serif-title text-sm font-bold text-stone-900 group-hover:text-[#b58d24] transition line-clamp-1">
                      {rel.name}
                    </h4>
                    <span className="text-sm font-bold text-stone-800 mt-2">
                      ${rel.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
