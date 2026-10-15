import React from 'react';
import { useLanguage, useProject } from '../context';
import { STAGES } from '../data';
import { 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';

interface RoadmapScreenProps {
  onOpenStageGuide: (stageId: number) => void;
  onOpenProjectSetup: () => void;
  onOpenAiChat?: (initialQuestion?: string) => void;
}

export const RoadmapScreen: React.FC<RoadmapScreenProps> = ({
  onOpenStageGuide,
  onOpenProjectSetup,
  onOpenAiChat
}) => {
  const { t, language, arabicNumber } = useLanguage();
  const { project, preferences } = useProject();

  const isRtl = language === 'ar';
  const completed = project ? Math.max(0, Math.min(STAGES.length, project.project_data.completed_stages || 0)) : 0;
  const allDone = completed >= STAGES.length;
  const currentStageIndex = Math.min(completed, STAGES.length - 1);
  const currentStage = STAGES[currentStageIndex];
  const nextStage = allDone ? null : STAGES[Math.min(completed + 1, STAGES.length - 1)];
  const percentage = Math.round((completed / STAGES.length) * 100);

  const checkedList = (project?.project_data.checked && project.project_data.checked[currentStage.id]) || [];

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl font-black text-[#292D32] tracking-tight">
          {t('خريطة التشطيب')}
        </h1>
        <div className="px-3 py-1 rounded-full bg-[#EFE9E1] text-[#8B5E3C] text-xs font-bold border border-[#E4DDD3]">
          {arabicNumber(completed)} / {arabicNumber(STAGES.length)} {t('مرحلة')}
        </div>
      </div>

      {!project ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4DDD3] shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center mx-auto">
            <Layers size={24} />
          </div>
          <h3 className="text-lg font-bold text-[#292D32]">{t('ابدأ بخطة شقتك')}</h3>
          <p className="text-xs text-[#73777D] max-w-sm mx-auto">
            {t('أدخل المساحة والحالة والميزانية لنحسب لك المراحل والكميات والتكلفة.')}
          </p>
          <button
            onClick={onOpenProjectSetup}
            className="w-full py-3.5 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <span>{t('أضف بيانات الشقة')}</span>
            {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      ) : (
        <>
          {/* Hero Card */}
          <div className="bg-white rounded-3xl p-6 border-l-4 border-l-[#D5A66D] border border-[#E4DDD3] shadow-md shadow-[#33291F]/5 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
                  {t('خريطة التشطيب')}
                </span>
                <h2 className="text-2xl font-bold text-[#292D32] mt-1 leading-tight">
                  {allDone ? t('اكتملت كل المراحل') : t(currentStage.title)}
                </h2>
              </div>
              <div className="text-4xl font-black text-[#8B5E3C] font-mono">
                {language === 'en'
                  ? (currentStage.id < 10 ? '0' : '') + currentStage.id
                  : (currentStage.id < 10 ? '٠' : '') + arabicNumber(currentStage.id)}
              </div>
            </div>

            <p className="text-xs text-[#73777D]">
              {t('اكتملت ')}
              {arabicNumber(completed)}
              {t(' من ')}
              {arabicNumber(STAGES.length)}
              {t(' مرحلة · ')}
              {arabicNumber(percentage)}
              {t('٪')}
            </p>

            {/* Progress Track */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-[#E4DDD3] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D5A66D] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {nextStage && (
                <div className="text-xs text-[#73777D] font-medium flex items-center justify-between">
                  <span>{t('التالي: ') + t(nextStage.title)}</span>
                  <span className="font-mono">{arabicNumber(percentage)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Inspection Alert Banner (if current stage requires inspection & preferences enabled) */}
          {!allDone && currentStage.needsInspection && preferences.inspectionReminders && (
            <div className="bg-[#EFE9E1] rounded-2xl p-4 border border-[#D5A66D]/40 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-white text-[#8B5E3C] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-[#292D32] mb-0.5">{t('تنبيه الفحص المتخصص')}</h4>
                <p className="text-[#73777D]">
                  {t('هذه المرحلة تحتاج فحصًا من متخصص مرخص قبل المتابعة.')}
                </p>
              </div>
            </div>
          )}

          {/* Current Stage Tasks Preview */}
          {!allDone && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#292D32]">
                  {t('قبل ما تكمل · ')}
                  {arabicNumber(checkedList.length)}
                  {t(' من ')}
                  {arabicNumber(currentStage.tasks.length)}
                </h3>
                <span className="text-[11px] text-[#73777D]">
                  {t(currentStage.guide)}
                </span>
              </div>

              <div className="space-y-2">
                {currentStage.tasks.map((item, idx) => {
                  const isChecked = checkedList.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenStageGuide(currentStage.id)}
                      className={`p-3.5 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                        isChecked
                          ? 'bg-white/60 border-[#E4DDD3] opacity-70'
                          : 'bg-white border-[#E4DDD3] hover:border-[#D5A66D] shadow-xs'
                      }`}
                    >
                      <div className="text-[#D5A66D] shrink-0">
                        {isChecked ? (
                          <CheckCircle2 size={22} className="text-[#8B5E3C]" />
                        ) : (
                          <Circle size={22} className="text-[#D5A66D]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold truncate ${isChecked ? 'line-through text-[#73777D]' : 'text-[#292D32]'}`}>
                          {t(item[0])}
                        </div>
                        <div className="text-xs text-[#73777D] truncate mt-0.5">
                          {t(item[1])}
                        </div>
                      </div>
                      <div className="text-[#73777D] opacity-60">
                        {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {allDone && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
              {t('مبروك! احتفظ بالضمانات والفواتير، ويمكنك مراجعة أي مرحلة من الدليل.')}
            </div>
          )}

          {/* Action Buttons: Guide & AI Engineer Consultation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenStageGuide(currentStage.id)}
              className="w-full py-3.5 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              <span>{t('افتح دليل المرحلة')}</span>
              {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </button>

            {onOpenAiChat && (
              <button
                onClick={() => onOpenAiChat(`أنا حالياً في مرحلة "${currentStage.title}". ما هي أهم النصائح الهندسية وخطوات استلام هذا البند من الصنايعي لتجنب أي أخطاء؟`)}
                className="w-full py-3.5 bg-white border border-[#E4DDD3] hover:border-[#8B5E3C] text-[#8B5E3C] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
              >
                <Sparkles size={15} className="text-[#D5A66D]" />
                <span>{language === 'ar' ? 'استشر المهندس عن هذه المرحلة' : 'Ask AI Engineer'}</span>
              </button>
            )}
          </div>

          {/* Full Stages Carousel / Mini List */}
          <div className="space-y-2.5 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#73777D]">
              {t('جميع مراحل التشطيب')} ({arabicNumber(STAGES.length)})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STAGES.map((st) => {
                const isStDone = st.id <= completed;
                const isCurrent = st.id === currentStage.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => onOpenStageGuide(st.id)}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      isCurrent
                        ? 'bg-white border-[#D5A66D] ring-2 ring-[#D5A66D]/30 font-bold'
                        : isStDone
                        ? 'bg-white/80 border-[#E4DDD3] text-[#73777D]'
                        : 'bg-white/50 border-[#E4DDD3] text-[#292D32] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] shrink-0 font-bold ${
                        isCurrent ? 'bg-[#8B5E3C] text-white' : isStDone ? 'bg-[#EFE9E1] text-[#8B5E3C]' : 'bg-[#F7F4EF] text-[#73777D]'
                      }`}>
                        {arabicNumber(st.id)}
                      </span>
                      <span className="truncate">{t(st.title)}</span>
                    </div>
                    {isStDone && <CheckCircle2 size={16} className="text-[#8B5E3C] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
