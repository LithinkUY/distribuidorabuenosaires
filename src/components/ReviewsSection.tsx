import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Star, CheckCircle2, MessageSquarePlus, ThumbsUp, ShieldCheck } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { reviews, addReview, storeSettings
  } = useStore();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form state
  const [author, setAuthor] = useState('');
  const [carModel, setCarModel] = useState('');
  const [productName, setProductName] = useState('Juego de Fundas Ecocuero con Bondeado Intermedio');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const approvedReviews = reviews.filter((r) => r.isApproved);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    addReview({
      author,
      carModel,
      productName,
      rating,
      comment,
      verifiedPurchase: true,
    });
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setShowSubmitModal(false);
      setAuthor('');
      setCarModel('');
      setComment('');
    }, 1200);
  };

  const sectionConfig = storeSettings?.homeSections?.find(s => s.id === 'resenas');
  if (sectionConfig && !sectionConfig.visible) return null;

  return (
    <section id="opiniones" className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-500 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Experiencias Reales de Conductores</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
              Opiniones y Recomendaciones de Clientes
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">4.9 / 5.0</span>
              <span className="text-slate-500 text-xs">· +850 autos tapizados</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4 text-blue-500" />
              <span>Dejar Opinión</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-slate-100/60 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                {/* Rating & Verified badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                      />
                    ))}
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Compra verificada
                    </span>
                  )}
                </div>

                {/* Comment Prose */}
                <p className="text-slate-700 text-xs leading-relaxed mb-4 italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Car Metadata (Clean unboxed text) */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block font-medium">{rev.author}</strong>
                  <span className="text-slate-500 text-[11px]">{rev.carModel}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal to Submit Review */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                Dejanos tu Opinión sobre el Tapizado
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Tu recomendación ayuda a otros conductores a elegir el calce ideal para su vehículo.
              </p>

              {submittedMessage ? (
                <div className="py-8 text-center text-emerald-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto" />
                  <p className="font-semibold text-sm">¡Muchas gracias por tu reseña!</p>
                  <p className="text-xs text-slate-600">Ha sido agregada exitosamente.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Agustín Pereira"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tu Vehículo (Marca, Modelo y Año) *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Toyota Corolla Cross 2024"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Calificación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-zinc-600 hover:text-amber-400 transition-colors"
                        >
                          <Star
                            className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Comentario o Experiencia *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Contanos sobre la calidad del material, cómo quedó el calce o la atención..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold text-slate-900 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      Publicar Opinión
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
