import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OurStorySectionProps {
  controller: StoreController;
}

export const OurStorySection: React.FC<OurStorySectionProps> = ({ controller }) => {
  const { setActiveView } = controller;

  const storyImgUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8k11gOXdrBwN5ATOyaIeByyisa7i6sOfTxzlrMg1MyCEw5COmvYKRsya3IL00K0a0M5rKWWVnjNSugpi7w9z4GqH7HV-kTwzjVP7R58vk3Cgue7c33oXLf3cIdA-ESBg1-My2OlJmICOmgCBYkTgS9j10wilmgj7BcJo6j0CdK2K1DdrJSNFCP69nj9hXEY5q78ntwK6rHcBLwzctpZ7mZhdQnXMak_mlCZWq_fs2OtRIEwBfi7v0';

  return (
    <section className="py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Column */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-stone-200">
              <img
                src={storyImgUrl}
                alt="Nuestra Historia - Mujer Latina"
                className="w-full h-[450px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-bold">
                  Desde 2023
                </span>
                <p className="font-serif-title text-xl font-bold">
                  Diseñado en Latinoamérica con estándares internacionales.
                </p>
              </div>
            </div>

            {/* Decorative accent element */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-[#d4af37] rounded-2xl -z-10 hidden sm:block" />
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#b58d24] font-bold">
              <Sparkles size={14} />
              <span>Manifiesto de Marca</span>
            </div>

            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
              Creemos en una belleza sin estereotipos, creada por y para nosotras.
            </h2>

            <p className="text-stone-600 text-base leading-relaxed">
              Mujer Latina nació de la convicción de que los cosméticos de alta gama debían reflejar la extraordinaria diversidad de nuestra piel y cabello. Durante décadas, el mercado tradicional ofreció fórmulas genéricas que no respondían a los climas, tonos cálidos ni necesidades de hidratación profunda de nuestra región.
            </p>

            <p className="text-stone-600 text-base leading-relaxed">
              Combinamos ingredientes botánicos ancestrales —como el aceite de argán puro, la rosa mosqueta y mantecas tropicales— con biotecnología avanzada y pigmentos de máxima fijación. Cada producto es una celebración de tu poder, identidad y estilo.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveView('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-7 py-3.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-semibold rounded-full shadow-md transition duration-200 flex items-center gap-2"
              >
                <span>Conoce Más de Nosotros</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
