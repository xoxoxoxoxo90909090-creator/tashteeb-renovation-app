import React, { useState } from 'react';
import { useLanguage, useProject, useIap } from '../context';
import { DESIGN_OPTIONS, ESTIMATE_NOTE } from '../data';
import { Sparkles, Info, ArrowLeft, ArrowRight, Palette, Lock, Wand2, Image as ImageIcon } from 'lucide-react';
import { AiImageStudioModal } from '../components/AiImageStudioModal';

interface DesignScreenProps {
  onOpenRoomDesign: (designId: string) => void;
  onOpenPaywall: () => void;
  onOpenProjectSetup: () => void;
}

export const DesignScreen: React.FC<DesignScreenProps> = ({
  onOpenRoomDesign,
  onOpenPaywall,
  onOpenProjectSetup
}) => {
  const { t, language, money, arabicNumber } = useLanguage();
  const { project } = useProject();
  const { isUnlocked } = useIap();

  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);

  const isRtl = language === 'ar';
  const area = project ? Number(project.area_sqm) || 120 : 120;
  const budget = project ? Number(project.budget_egp) || 0 : 0;

  const estimates = DESIGN_OPTIONS.map(d => Math.round((area * d.perSqm) / 1000) * 1000);
  let bestIndex = 0;
  estimates.forEach((val, idx) => {
    if (budget > 0 && val <= budget) bestIndex = idx;
  });

  const handleSelectDesign = (designId: string) => {
    // If unlocked, open room design; otherwise open paywall or let them preview
    if (!isUnlocked) {
      onOpenPaywall();
    } else {
      onOpenRoomDesign(designId);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl font-black text-[#292D32] tracking-tight">
          {t('تصميم شقتي')}
        </h1>
        <div className="px-3 py-1 rounded-full bg-[#EFE9E1] text-[#8B5E3C] text-xs font-bold border border-[#E4DDD3]">
          {arabicNumber(3)} {t('أنماط ديكور')}
        </div>
      </div>

      {!project ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4DDD3] shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center mx-auto">
            <Palette size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#292D32]">{t('ابدأ بخطة شقتك')}</h3>
          <p className="text-xs text-[#73777D] max-w-sm mx-auto">
            {t('أدخل المساحة والحالة والميزانية لنحسب لك المراحل والكميات والتكلفة.')}
          </p>
          <button
            onClick={onOpenProjectSetup}
            className="w-full py-3.5 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm transition shadow-sm cursor-pointer"
          >
            {t('أضف بيانات الشقة')}
          </button>
        </div>
      ) : (
        <>
          {/* AI Image Studio Banner */}
          <div className="bg-gradient-to-r from-[#8B5E3C] via-[#9c6a45] to-[#8B5E3C] rounded-3xl p-5 text-white shadow-md shadow-[#33291F]/10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-[#D5A66D]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{t('استوديو التصميم والتعديل بالذكاء الاصطناعي')}</h3>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/20 font-bold">
                      gemini-nano-banana-2.1
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    {t('أنشئ وعدّل صور وتصاميم ديكور شقتك باستخدام الأوامر النصية')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAiStudioOpen(true)}
                className="flex-1 py-2.5 px-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Wand2 size={14} />
                <span>{t('إنشاء تصميم جديد من نص')}</span>
              </button>
              <button
                onClick={() => setIsAiStudioOpen(true)}
                className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ImageIcon size={14} />
                <span>{t('تعديل صورة')}</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-[#73777D] leading-relaxed">
            {t('اختيارات تناسب مساحة شقتك وميزانيتك. كل تصميم مرتبط بخاماته وتكلفته التقديرية.')}
          </p>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#292D32]">
              {t('اختار اتجاهك')}
            </h2>
            {!isUnlocked && (
              <button
                onClick={onOpenPaywall}
                className="text-xs text-[#8B5E3C] font-bold flex items-center gap-1 hover:underline"
              >
                <Lock size={12} />
                <span>{t('خطة Premium')}</span>
              </button>
            )}
          </div>

          {/* Design Cards */}
          <div className="space-y-4">
            {DESIGN_OPTIONS.map((design, index) => {
              const estCost = estimates[index];
              const isBestFit = index === bestIndex && budget > 0;

              return (
                <div
                  key={design.id}
                  onClick={() => handleSelectDesign(design.id)}
                  className="bg-white rounded-3xl overflow-hidden border border-[#EEE7DE] shadow-md shadow-[#33291F]/5 transition hover:shadow-lg hover:border-[#D5A66D] cursor-pointer group"
                >
                  <div className="relative h-48 w-full bg-[#EFE9E1] overflow-hidden">
                    <img
                      src={design.image}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <h3 className="text-xl font-bold">{t(design.title)}</h3>
                        <p className="text-xs text-white/80">{t(design.description)}</p>
                      </div>
                      {isBestFit && (
                        <div className="px-3 py-1 rounded-full bg-[#D5A66D] text-[#29231D] font-bold text-xs shadow-md">
                          {t('الأنسب لميزانيتك')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between bg-white">
                    <div>
                      <span className="text-xs text-[#73777D] block">
                        {isUnlocked ? t('التقدير المبدئي') : t('خطة Premium')}
                      </span>
                      <span className="text-base font-bold text-[#292D32] font-mono">
                        {isUnlocked ? money(estCost) : t('افتح التفاصيل')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[#8B5E3C]">
                      <span>{isUnlocked ? t('تصميم الغرف') : t('افتح التفاصيل')}</span>
                      {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Note Card */}
          <div className="p-4 bg-[#EFE9E1] rounded-2xl border border-[#E4DDD3] text-xs text-[#292D32] leading-relaxed">
            {t(ESTIMATE_NOTE)}
          </div>
        </>
      )}

      {/* AI Image Studio Modal */}
      {isAiStudioOpen && (
        <AiImageStudioModal onClose={() => setIsAiStudioOpen(false)} />
      )}
    </div>
  );
};
