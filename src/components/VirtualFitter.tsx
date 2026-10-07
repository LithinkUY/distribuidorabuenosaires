import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Check, Car, Sparkles, MessageCircle, ShoppingBag, Palette } from 'lucide-react';

export const VirtualFitter: React.FC = () => {
  const { isFitterOpen, setIsFitterOpen, formatPrice, addToCart, products, storeSettings } = useStore();

  const [carType, setCarType] = useState<'sedan' | 'suv' | 'pickup' | 'hatchback'>('pickup');
  const [material, setMaterial] = useState<'cuero' | 'alcantara' | 'neoprene' | 'pana'>('cuero');
  const [seatColor, setSeatColor] = useState<'negro' | 'grafito' | 'marron' | 'beige'>('negro');
  const [stitchColor, setStitchColor] = useState<'rojo' | 'blanco' | 'azul' | 'amarillo' | 'negro'>('rojo');
  const [pattern, setPattern] = useState<'diamante' | 'recto' | 'perforado'>('diamante');
  const [includeEmbroidery, setIncludeEmbroidery] = useState(true);
  const [embroideryText, setEmbroideryText] = useState('CUSTOM');

  if (!isFitterOpen) return null;

  // Base pricing
  const basePrices: Record<string, number> = {
    cuero: 190,
    alcantara: 240,
    neoprene: 170,
    pana: 140,
  };

  const calculatedUSD = basePrices[material] + (includeEmbroidery ? 20 : 0);

  // Material descriptions
  const materialDescriptions: Record<string, string> = {
    cuero: 'Cuero ecológico automotriz de 1.2mm con tacto suave, resistente al desgaste y fácil de limpiar con paño húmedo.',
    alcantara: 'Microfibra italiana de alto agarre antideslizante con textura gamuzada fresca en verano y cálida en invierno.',
    neoprene: 'Neoprene sellado 100% impermeable, concebido para barro, arena, deportes acuáticos y uso intensivo 4x4.',
    pana: 'Pana automotriz acolchada tradicional con gran absorción acústica y calidez clásica.',
  };

  // Color mapping
  const colorHex: Record<string, string> = {
    negro: '#121316',
    grafito: '#2d3139',
    marron: '#42281d',
    beige: '#b8a68d',
  };

  const stitchHex: Record<string, string> = {
    rojo: '#dc2626',
    blanco: '#f8fafc',
    azul: '#2563eb',
    amarillo: '#eab308',
    negro: '#09090b',
  };

  const handleOrderCustomConfig = () => {
    // Find matching base product or first product
    const baseProduct = products[0];
    addToCart(baseProduct, 1, {
      carBrand: carType.toUpperCase(),
      carModel: `Probador Virtual 3D (${pattern})`,
      material: `${material.toUpperCase()} - ${seatColor.toUpperCase()}`,
      stitchingColor: stitchColor.toUpperCase(),
    });
    setIsFitterOpen(false);
  };

  const handleWhatsAppQuote = () => {
    const rawNumber = (storeSettings?.whatsappNumber || '5491112345678').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `¡Hola Distribuidora Buenos Aires! 👋 Diseñé esta combinación en el Probador Virtual:\n` +
      `• Formato: ${carType.toUpperCase()}\n` +
      `• Material: ${material.toUpperCase()} (${seatColor})\n` +
      `• Costura: ${stitchColor.toUpperCase()} en diseño ${pattern.toUpperCase()}\n` +
      `• Bordado: ${includeEmbroidery ? `Sí ("${embroideryText}")` : 'Sin bordado'}\n` +
      `• Precio Estimado: ${formatPrice(calculatedUSD)}\n` +
      `¿Podrían confirmarme la disponibilidad en stock?`
    );
    window.open(`https://wa.me/${rawNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Probador Virtual & Simulador de Tapizados 3D
              </h2>
              <p className="text-xs text-slate-600">
                Personalizá tu juego de asientos en tiempo real y visualizá materiales y costuras
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFitterOpen(false)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          
          {/* Interactive Visualizer Canvas (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 to-black border border-slate-200 flex items-center justify-center p-6 shadow-inner">
              
              {/* Ambient car cockpit glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${stitchHex[stitchColor]} 0%, transparent 70%)`,
                }}
              />

              {/* Dynamic SVG / Vector High-Definition Seat Representation */}
              <div className="relative w-full max-w-xs sm:max-w-sm aspect-[3/4] flex items-center justify-center transition-all duration-300">
                <svg
                  viewBox="0 0 320 440"
                  className="w-full h-full drop-shadow-2xl transition-all duration-300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Seat Shadow */}
                  <ellipse cx="160" cy="425" rx="110" ry="12" fill="#000000" opacity="0.6" filter="blur(6px)" />

                  {/* Headrest */}
                  <rect
                    x="115"
                    y="25"
                    width="90"
                    height="65"
                    rx="18"
                    fill={colorHex[seatColor]}
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2.5"
                    strokeDasharray={pattern === 'perforado' ? '4 2' : 'none'}
                  />
                  {/* Headrest cushion detail */}
                  <rect x="130" y="38" width="60" height="38" rx="8" fill="white" fillOpacity="0.04" />
                  {includeEmbroidery && (
                    <text
                      x="160"
                      y="62"
                      fill={stitchHex[stitchColor]}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      letterSpacing="2"
                    >
                      {embroideryText.slice(0, 10).toUpperCase()}
                    </text>
                  )}

                  {/* Metal headrest bars */}
                  <rect x="135" y="85" width="8" height="22" rx="4" fill="#52525b" />
                  <rect x="177" y="85" width="8" height="22" rx="4" fill="#52525b" />

                  {/* Seat Backrest Shell */}
                  <path
                    d="M 85 105 C 80 180, 70 230, 60 280 C 75 295, 245 295, 260 280 C 250 230, 240 180, 235 105 C 235 98, 85 98, 85 105 Z"
                    fill={colorHex[seatColor]}
                    stroke="#27272a"
                    strokeWidth="3"
                  />

                  {/* Lateral Bolsters (Sport side supports) */}
                  <path
                    d="M 85 110 C 65 170, 55 240, 70 280 C 85 270, 95 210, 98 120 Z"
                    fill={colorHex[seatColor]}
                    fillOpacity="0.85"
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2"
                  />
                  <path
                    d="M 235 110 C 255 170, 265 240, 250 280 C 235 270, 225 210, 222 120 Z"
                    fill={colorHex[seatColor]}
                    fillOpacity="0.85"
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2"
                  />

                  {/* Center Backrest Panel with Pattern */}
                  <rect
                    x="100"
                    y="110"
                    width="120"
                    height="165"
                    rx="12"
                    fill={material === 'alcantara' ? '#1c1e24' : colorHex[seatColor]}
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2"
                  />

                  {/* Stitching Patterns */}
                  {pattern === 'diamante' && (
                    <g stroke={stitchHex[stitchColor]} strokeWidth="1.2" opacity="0.85">
                      <line x1="105" y1="120" x2="215" y2="180" />
                      <line x1="105" y1="150" x2="215" y2="210" />
                      <line x1="105" y1="180" x2="215" y2="240" />
                      <line x1="105" y1="210" x2="215" y2="270" />

                      <line x1="215" y1="120" x2="105" y2="180" />
                      <line x1="215" y1="150" x2="105" y2="210" />
                      <line x1="215" y1="180" x2="105" y2="240" />
                      <line x1="215" y1="210" x2="105" y2="270" />
                    </g>
                  )}

                  {pattern === 'recto' && (
                    <g stroke={stitchHex[stitchColor]} strokeWidth="1.5" opacity="0.85">
                      <line x1="100" y1="135" x2="220" y2="135" />
                      <line x1="100" y1="160" x2="220" y2="160" />
                      <line x1="100" y1="185" x2="220" y2="185" />
                      <line x1="100" y1="210" x2="220" y2="210" />
                      <line x1="100" y1="235" x2="220" y2="235" />
                      <line x1="100" y1="260" x2="220" y2="260" />
                    </g>
                  )}

                  {pattern === 'perforado' && (
                    <g fill={stitchHex[stitchColor]} opacity="0.7">
                      {Array.from({ length: 7 }).map((_, r) =>
                        Array.from({ length: 6 }).map((_, c) => (
                          <circle
                            key={`${r}-${c}`}
                            cx={115 + c * 18}
                            cy={130 + r * 20}
                            r="1.8"
                          />
                        ))
                      )}
                    </g>
                  )}

                  {/* Seat Base Cushion */}
                  <path
                    d="M 50 300 C 50 280, 270 280, 270 300 C 275 350, 280 405, 270 410 C 240 420, 80 420, 50 410 C 40 405, 45 350, 50 300 Z"
                    fill={colorHex[seatColor]}
                    stroke="#27272a"
                    strokeWidth="3"
                  />
                  {/* Seat Base Stitching Accents */}
                  <path
                    d="M 85 305 L 85 405"
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2"
                    strokeDasharray={pattern === 'perforado' ? '4 2' : 'none'}
                  />
                  <path
                    d="M 235 305 L 235 405"
                    stroke={stitchHex[stitchColor]}
                    strokeWidth="2"
                    strokeDasharray={pattern === 'perforado' ? '4 2' : 'none'}
                  />
                </svg>
              </div>

              {/* Floating Badge in corner */}
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Simulador en vivo · Calce Milimétrico</span>
              </div>
            </div>

            {/* Material info card below */}
            <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600">
              <strong className="text-slate-900 block mb-1">
                Material seleccionado: {material.toUpperCase()}
              </strong>
              {materialDescriptions[material]}
            </div>
          </div>

          {/* Controls Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              
              {/* 1. Vehicle category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  1. Formato de Carrocería
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'pickup', label: 'Pick-Up / 4x4' },
                    { id: 'suv', label: 'SUV / Crossover' },
                    { id: 'sedan', label: 'Sedán' },
                    { id: 'hatchback', label: 'Hatchback' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setCarType(v.id as any)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition-colors ${
                        carType === v.id
                          ? 'bg-blue-50/40 border-blue-500 text-slate-900'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span>{v.label}</span>
                      {carType === v.id && <Check className="w-3.5 h-3.5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Material choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  2. Material Principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cuero', label: 'Cuero Ecológico', tag: 'Más Popular' },
                    { id: 'alcantara', label: 'Alcántara Sport', tag: 'Deportivo' },
                    { id: 'neoprene', label: 'Neoprene 4x4', tag: 'Impermeable' },
                    { id: 'pana', label: 'Pana Automotriz', tag: 'Clásico' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMaterial(m.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                        material === m.id
                          ? 'bg-blue-50/40 border-blue-500 text-slate-900'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-900">{m.label}</span>
                      <span className="text-[10px] text-slate-500">{m.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Base Seat Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  3. Tono del Tapizado
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'negro', label: 'Negro Profundo', hex: '#121316' },
                    { id: 'grafito', label: 'Gris Grafito', hex: '#2d3139' },
                    { id: 'marron', label: 'Marrón Suela', hex: '#42281d' },
                    { id: 'beige', label: 'Beige Arena', hex: '#b8a68d' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSeatColor(c.id as any)}
                      className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        seatColor === c.id ? 'border-blue-500 scale-110' : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {seatColor === c.id && <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Stitching color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  4. Hilo de Costura Acentuada
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'rojo', label: 'Rojo Ferrari', hex: '#dc2626' },
                    { id: 'blanco', label: 'Blanco Glaciar', hex: '#f8fafc' },
                    { id: 'azul', label: 'Azul Eléctrico', hex: '#2563eb' },
                    { id: 'amarillo', label: 'Amarillo Competición', hex: '#eab308' },
                    { id: 'negro', label: 'Costura Tonal', hex: '#09090b' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStitchColor(s.id as any)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        stitchColor === s.id ? 'border-white scale-110' : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: s.hex }}
                      title={s.label}
                    >
                      {stitchColor === s.id && (
                        <Check className={`w-3.5 h-3.5 ${s.id === 'blanco' || s.id === 'amarillo' ? 'text-black' : 'text-slate-900'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Stitching Pattern */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  5. Patrón de Diseño
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'diamante', label: 'Capitoné Diamante' },
                    { id: 'recto', label: 'Líneas Horizontales' },
                    { id: 'perforado', label: 'Microperforado' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPattern(p.id as any)}
                      className={`px-2 py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                        pattern === p.id
                          ? 'bg-blue-50/40 border-blue-500 text-slate-900 font-semibold'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Custom Embroidery Option */}
              <div className="p-3 bg-slate-100/60 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeEmbroidery}
                      onChange={(e) => setIncludeEmbroidery(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 bg-white border-slate-300"
                    />
                    <span>Bordado personalizado en apoyacabezas (+$25.000 ARS)</span>
                  </label>
                </div>
                {includeEmbroidery && (
                  <input
                    type="text"
                    maxLength={12}
                    value={embroideryText}
                    onChange={(e) => setEmbroideryText(e.target.value)}
                    placeholder="Texto de bordado (ej: HILUX, RANGER)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs text-slate-600">Total Estimado del Juego Completo:</span>
                <span className="font-display font-extrabold text-2xl text-slate-900">
                  {formatPrice(calculatedUSD)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsAppQuote}
                  className="py-3 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Consultar WhatsApp</span>
                </button>

                <button
                  onClick={handleOrderCustomConfig}
                  className="py-3 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-50/40"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
