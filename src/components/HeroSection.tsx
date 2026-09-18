import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';

interface HeroSectionProps {
  controller: StoreController;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ controller }) => {
  const { setActiveView } = controller;

  const heroImageUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDjmiNZ18X4HMI39EGmmIc1w67-mZ45e169M3EXoCBKZgO7kbNhgFKHHkkK16w1ouCMOKSTVijBvnzz9ZZgSGQBhlUhkU7qqyJ9Mp0d1PviOEWFKu3dsG4_5H_v4a6ByvKsFBg_VlqPyQeCwxAnJw6jG8wWRUD_jDfnoIArIXgK9NPV_q1IIJrohAh12pvUo9tjob8tGF4kmwLmV2jz1JJY8SrzKW5nKHsB-tjEmqdPBkB3pXQrVFo9';

  return (
    <section className="relative bg-[#111111] text-white overflow-hidden border-b border-stone-800">
      {/* Background ambient gold gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#201d14] border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold tracking-wider uppercase">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Colección Exclusiva 2026</span>
            </div>

            <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Belleza que <br />
              <span className="text-[#d4af37] italic font-serif">Empodera</span> Tu Esencia
            </h1>

            <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Fórmulas de alta pigmentación y tratamientos botánicos de lujo creados para celebrar la riqueza de nuestros tonos, texturas y elegancia natural.
            </p>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setActiveView('catalog')}
                id="hero-cta-collection"
                className="px-8 py-4 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-semibold rounded-full shadow-lg shadow-[#d4af37]/20 hover:shadow-xl hover:scale-[1.02] transition duration-200 flex items-center gap-2"
              >
                <span>Ver Colección</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setActiveView('about')}
                id="hero-cta-about"
                className="px-7 py-4 bg-transparent hover:bg-stone-900 text-stone-200 border border-stone-700 hover:border-stone-500 font-medium rounded-full transition duration-200"
              >
                Nuestra Historia
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-stone-800/80 grid grid-cols-3 gap-4 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#d4af37] flex-shrink-0" />
                <span>Ingredientes Botánicos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#d4af37] flex-shrink-0" />
                <span>Fórmula No Testeada</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#d4af37] flex-shrink-0" />
                <span>Pago y Envío Seguro</span>
              </div>
            </div>
          </div>

          {/* Right Editorial Portrait Hero Image */}
          <div className="lg:col-span-5 relative z-10">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative gold frame */}
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-[#d4af37]/40 via-transparent to-[#d4af37]/20 blur-sm -z-10" />
              
              <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-2xl bg-stone-900 aspect-[4/5]">
                <img
                  src={heroImageUrl}
                  alt="Mujer Latina - Belleza que Empodera"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating pill badge on the image */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">Edición Limitada</p>
                    <p className="font-serif-title text-base font-bold">Suero Iluminador de Argán</p>
                  </div>
                  <button
                    onClick={() => setActiveView('catalog')}
                    className="p-2.5 bg-[#d4af37] text-black rounded-full hover:bg-white transition"
                    title="Ver Producto"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
