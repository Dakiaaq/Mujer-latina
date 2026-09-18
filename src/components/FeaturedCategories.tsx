import React from 'react';
import { StoreController } from '../controllers/useStoreController';

interface FeaturedCategoriesProps {
  controller: StoreController;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ controller }) => {
  const { categories, setCategoryFilter, setActiveView } = controller;

  const handleCategoryClick = (slug: string) => {
    setCategoryFilter(slug);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-14 bg-[#fcfcfc] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-[#b58d24] font-bold">
            Explora Nuestra Selección
          </span>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
            Categorías Principales
          </h2>
          <div className="w-12 h-0.5 bg-[#d4af37] mx-auto mt-3" />
        </div>

        {/* Circular Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className="flex flex-col items-center group cursor-pointer"
              id={`cat-card-${cat.slug}`}
            >
              {/* Circular image container with animated gold ring */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#d4af37] to-stone-300 group-hover:from-[#d4af37] group-hover:to-[#f3e5ab] transition duration-300 shadow-md group-hover:shadow-xl group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Title & subtle indicator */}
              <h3 className="mt-3.5 text-base font-semibold text-stone-800 group-hover:text-[#b58d24] transition text-center font-serif-title">
                {cat.name}
              </h3>
              <span className="text-xs text-stone-500 tracking-wider uppercase group-hover:text-stone-700 transition">
                Ver Colección →
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
