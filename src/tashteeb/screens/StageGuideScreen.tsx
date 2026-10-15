import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { STAGES, SAFETY_NOTE } from '../data';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface StageGuideScreenProps {
  stageId: number;
  onBack: () => void;
  onOpenProjectSetup: () => void;
  onOpenAiChat?: (initialQuestion?: string) => void;
}

export const StageGuideScreen: React.FC<StageGuideScreenProps> = ({
  stageId,
  onBack,
  onOpenProjectSetup,
  onOpenAiChat
}) => {
  const { t, language, arabicNumber } = useLanguage();
  const { project, updateProjectData } = useProject();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isRtl = language === 'ar';
  const stage = STAGES.find(s => s.id === stageId) || STAGES[0];
  const completed = project ? project.project_data.completed_stages || 0 : 0;

  const data = project?.project_data || { checked: {}, inspected: {}, completed_stages: 0, selected_design: null, room_choices: {} };
  const checked = data.checked[stage.id] || [];
  const inspected = Boolean(data.inspected[stage.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTask = (index: number) => {
    if (!project) return;
    const nextChecked = checked.includes(index)
      ? checked.filter(v => v !== index)
      : [...checked, index];

    updateProjectData({
      checked: {
        ...data.checked,
        [stage.id]: nextChecked
      }
    });
  };

  const toggleInspected = () => {
    if (!project) return;
    updateProjectData({
      inspected: {
        ...data.inspected,
        [stage.id]: !inspected
      }
    });
  };

  const completeStage = () => {
    if (!project) {
      showToast(t('أضف مشروعًا أولًا'));
      return;
    }
    if (stage.id <= completed) {
      showToast(t('هذه المرحلة مسجلة كمكتملة بالفعل.'));
      return;
    }
    if (stage.id > completed + 1) {
      showToast(t('المراحل تتم بالترتيب. أكمل المرحلة الحالية أولًا.'));
      return;
    }
    if (checked.length < stage.tasks.length) {
      showToast(t('علّم كل البنود المنفذة قبل إكمال المرحلة.'));
      return;
    }
    if (stage.needsInspection && !inspected) {
      showToast(t('هذه المرحلة تحتاج فحصًا من متخصص مرخص. أكد الفحص أولًا.'));
      return;
    }

    updateProjectData({
      completed_stages: stage.id
    });
    showToast(t('سُجلت المرحلة كمكتملة وتم فتح المرحلة التالية.'));
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  const progress = stage.tasks.length > 0 ? Math.round((checked.length / stage.tasks.length) * 100) : 0;
  const isDone = stage.id <= completed;
  const buttonLabel = isDone
    ? t('المرحلة مكتملة')
    : stage.id > completed + 1
    ? t('أكمل المراحل السابقة أولًا')
    : t('تمت مراجعة المرحلة');

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#8B5E3C] hover:text-[#292D32] transition"
        >
          {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>{t('رجوع')}</span>
        </button>
        <h1 className="text-base font-bold text-[#292D32]">
          {t('دليل المرحلة')}
        </h1>
        <button
          onClick={() => showToast(t(SAFETY_NOTE))}
          className="w-8 h-8 rounded-full bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center hover:bg-[#E4DDD3] transition"
          title={t('ملاحظة أمان')}
        >
          <AlertTriangle size={15} />
        </button>
      </div>

      {/* Stage Hero Card */}
      <div className="bg-white rounded-3xl p-6 border-l-4 border-l-[#D5A66D] border border-[#E4DDD3] shadow-md shadow-[#33291F]/5 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
            {t('المرحلة ')} {arabicNumber(stage.id)} {t(' من ')} {arabicNumber(STAGES.length)}
          </span>
          <h2 className="text-2xl font-black text-[#292D32] mt-1 leading-tight">
            {t(stage.title)}
          </h2>
          <p className="text-xs text-[#73777D] mt-2 leading-relaxed">
            {t(stage.guide)}
          </p>
        </div>

        {stage.needsInspection && (
          <div className="text-xs text-[#8B5E3C] font-semibold flex items-center gap-1.5 bg-[#EFE9E1] px-3 py-2 rounded-xl">
            <ShieldCheck size={16} />
            <span>{t('تحتاج هذه المرحلة فحصًا من متخصص مؤهل قبل المتابعة')}</span>
          </div>
        )}

        {/* Progress row */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full bg-[#E4DDD3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D5A66D] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#73777D] font-mono">
            <span>{t('التقدم')}</span>
            <span>{arabicNumber(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Tasks Title */}
      <h3 className="text-sm font-bold text-[#292D32] px-1">
        {t('اعمل إيه؟')}
      </h3>

      {!project ? (
        <div className="p-6 bg-white rounded-3xl border border-[#E4DDD3] text-center space-y-2">
          <p className="text-xs text-[#73777D]">{t('أنشئ ملف شقتك لتتابع تقدم المراحل.')}</p>
          <button
            onClick={onOpenProjectSetup}
            className="py-2 px-4 bg-[#D5A66D] text-[#29231D] font-bold text-xs rounded-xl"
          >
            {t('أضف بيانات الشقة')}
          </button>
        </div>
      ) : (
        /* Tasks List */
        <div className="space-y-2">
          {stage.tasks.map((row, index) => {
            const isChecked = checked.includes(index);
            return (
              <div
                key={index}
                onClick={() => toggleTask(index)}
                className={`p-3.5 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                  isChecked
                    ? 'bg-white/60 border-[#E4DDD3] opacity-75'
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
                  <div className={`text-sm font-semibold ${isChecked ? 'line-through text-[#73777D]' : 'text-[#292D32]'}`}>
                    {t(row[0])}
                  </div>
                  <div className="text-xs text-[#73777D] mt-0.5">
                    {t(row[1])}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specialist Inspection Switch (if required) */}
      {project && stage.needsInspection && (
        <div className="bg-white rounded-2xl p-4 border border-[#EEE7DE] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#292D32]">
                {t('تم الفحص من متخصص مرخص')}
              </div>
              <div className="text-xs text-[#73777D]">
                {t('مطلوب قبل إكمال هذه المرحلة')}
              </div>
            </div>
          </div>

          <button
            onClick={toggleInspected}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              inspected ? 'bg-[#D5A66D]' : 'bg-[#E4DDD3]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                inspected ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* Ask AI Engineer About This Stage */}
      {onOpenAiChat && (
        <button
          onClick={() => onOpenAiChat(
            language === 'en'
              ? `I am currently reviewing the guide and handover for stage "${t(stage.title)}". What are the key quality benchmarks and checklist to verify the tasks here?`
              : `أنا حالياً أراجع دليل واستلام مرحلة "${stage.title}". ما هي معايير الجودة الأساسية وطريقة التأكد من دقة تنفيذ المهام المطلوبة هنا؟`
          )}
          className="w-full py-3 bg-white border border-[#E4DDD3] hover:border-[#8B5E3C] text-[#8B5E3C] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] cursor-pointer"
        >
          <Sparkles size={14} className="text-[#D5A66D]" />
          <span>{language === 'ar' ? 'اسأل المهندس الذكي عن فحص هذه المرحلة' : 'Ask AI Engineer About This Stage'}</span>
        </button>
      )}

      {/* Complete Button */}
      <button
        onClick={completeStage}
        disabled={isDone}
        className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm ${
          isDone
            ? 'bg-[#E4DDD3] text-[#73777D] cursor-not-allowed opacity-60'
            : 'bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] cursor-pointer active:scale-[0.99]'
        }`}
      >
        <CheckCircle2 size={18} />
        <span>{buttonLabel}</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-6 right-6 z-50 p-3.5 bg-[#292D32] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#8B5E3C] text-center animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
