import React from 'react';
import { Sparkles, Heart, Award, Users } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="bg-[#fcfcfc] min-h-screen py-16 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37] text-[#b58d24] rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Nuestra Identidad</span>
          </div>
          <h1 className="font-serif-title text-4xl sm:text-5xl font-bold text-stone-900 leading-tight">
            Mujer Latina: Belleza que Inspira y Empodera
          </h1>
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
            Nacimos con el propósito de transformar la industria de la belleza en la región, creando cosméticos y tratamientos capilares de prestigio formulados a la medida de nuestros tonos cálidos, texturas vibrantes y clima latino.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 text-[#b58d24] flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900">
              Belleza Auténtica
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              No creemos en estándares impuestos. Desarrollamos paletas y acabados que realzan los subtonos dorados, oliva, canela y profundos característicos de nuestra identidad.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 text-[#b58d24] flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900">
              Calidad y Pureza Botánica
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Nuestras fórmulas integran activos botánicos certificados como el aceite de argán virgen, keratina hidrolizada y pigmentos minerales micronizados libres de crueldad animal.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/15 text-[#b58d24] flex items-center justify-center">
              <Users size={24} />
            </div>
            <h3 className="font-serif-title text-xl font-bold text-stone-900">
              Comunidad y Cercanía
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Atendemos de manera personalizada a cada clienta a través de WhatsApp, ofreciendo asesoría en colorimetría, rutinas de cuidado capilar y despacho directo y seguro.
            </p>
          </div>

        </div>

        {/* Corporate Gallery "Nuestro Entorno" */}
        <div className="space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Detrás de Cada Fórmula
            </span>
            <h2 className="font-serif-title text-3xl font-bold text-stone-900 mt-1">
              Nuestro Entorno & Creación
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-stone-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBRtAH_hUp93_iZeEYPYvrjfIJviUJkihzYTY1-tfSfJRy4Qh7CNjechCZ1WzCA4ubl_gHvFTyIRCp85rX7Q1vHzl-DILpvThVo5A1g7lRoR1IEFCnXPzC-k2baU0oLlRO_-QbJzXxEj6hVCg5I8jFUASNjpgt98TgIBlWzLK9HH_w78LZZiECn4Kt7NY9jp7uIAj0Pj3nzTWqGh_OCaMLYRV7q4A3biJHyJaJtVMDCSVmGcvju_Va"
                alt="Laboratorio de formulación"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-stone-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG3GgHGosoACKiWUwym4DMdIdIAOKVz82WSFC8mKD2UKoucclsltVhv0mWUgKICIP39Zrixf4lcL_VPrg0EL235aKJJJBEdxggerW0OCb75FoCnZ1t7o30Gq2N93eL9UpHeNxisAUM-dhM3dLTKmBEAuG8q_stBAo1uTXG5hAr4822UFUQxZjWICGwXe4upvtjkY_mQkMdDIC9x6QD_MktBV8em-hMMnwiuJQR4uRoE6SpY0JuWMeP"
                alt="Detalle de aceites y extractos"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-stone-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2nA4WAjjWtq6PsHo3g3RRZP4Ew3mf4DmPeTw4XK6ut71TSVxCShe61EgB1dfXpX1ekoKz2uwK0SPaxbtig7HYdaABnbMQtigxg3pVapTEdS2EKg24fy46UB9JpWnlyL9zpHbrmvCrQTlpCbjuQ7h0zCPT05G1a2E90Nh8a5JrcohoLrFqF3xMWpJkvSG6u-6JCtBkR1EvKCU-vHyRUPfI7u5THaIlEg-7nYmqn3gPP3vX5JAcmfQ0"
                alt="Proceso de envasado artesanal"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-stone-100">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMScOdi90ZmP1G4lwi71yLWO3yeBfQiCBsHKG0df60ApArJRRQxYGlCaHxRjtGjawlqySg6oqbo4IMA11wZul3ebxWZir7mqJO5kzD1ATBQGqbK8v_53AobnHFXqTrZHVyjc2o5_F4AqKdKQ9Mk7_2mO-BCv-eqXIQHPATBZ6OdS0XFcsepHiw0gKtGGhzV6SG_Uku5R4lcnT6LDun2K1kq0_RRrqwcNxn-wR5dBYgcio_Cl4WZGlv"
                alt="Sesiones editoriales"
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
