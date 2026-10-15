import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { ESTIMATE_NOTE, SAFETY_NOTE } from '../data';
import { 
  Building2, 
  Pencil, 
  Calculator, 
  ShieldCheck, 
  Lock, 
  FileText, 
  Globe, 
  RotateCcw, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  FileDown,
  Download
} from 'lucide-react';
import { PdfExportModal } from '../components/PdfExportModal';

interface ProjectScreenProps {
  onOpenProjectSetup: () => void;
  onOpenCalculator: () => void;
}

export const ProjectScreen: React.FC<ProjectScreenProps> = ({
  onOpenProjectSetup,
  onOpenCalculator
}) => {
  const { t, language, setLanguage, arabicNumber, money, currentStateLabel } = useLanguage();
  const { project, shoppingItems, preferences, setPreferences, resetToSampleData } = useProject();
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const isRtl = language === 'ar';
  const items = shoppingItems.filter(item => !project || item.project_id === project.id);
  const usedBudget = items.filter(item => item.is_purchased).reduce((sum, item) => sum + Number(item.estimated_cost_egp || 0), 0);
  const plannedTotal = items.reduce((sum, item) => sum + Number(item.estimated_cost_egp || 0), 0);
  const budget = project ? Number(project.budget_egp) || 0 : 0;
  const usedPercent = budget > 0 ? Math.min(100, Math.round((usedBudget / budget) * 100)) : 0;
  const plannedOver = budget > 0 && plannedTotal > budget;

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const openPrivacy = () => {
    setModalContent({
      title: t('سياسة الخصوصية'),
      content: language === 'ar' 
        ? 'نحن نحترم خصوصيتك بالكامل. جميع بيانات شقتك، الميزانية، والمشتريات تُحفظ محليًا على جهازك بأمان تام ولا يتم مشاركتها مع أي طرف ثالث دون إذنك.'
        : 'We fully respect your privacy. All your apartment details, budget, and shopping lists are saved securely on your local device and never shared with third parties.'
    });
  };

  const openTerms = () => {
    setModalContent({
      title: t('شروط الاستخدام'),
      content: language === 'ar'
        ? 'التطبيق دليل إرشادي وحاسبة تقديرية لمساعدتك في التخطيط ومتابعة مراحل التشطيب. الأسعار والكميات استرشادية وتخضع لتغيرات السوق الفعلية واستشارة المهندسين المختصين.'
        : 'This app is an informational guide and estimation calculator to help you plan and track finishing stages. Prices and quantities are estimates subject to actual market rates and qualified engineer consultation.'
    });
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl font-black text-[#292D32] tracking-tight">
          {t('مشروعي')}
        </h1>
        <div className="text-xs text-[#8B5E3C] font-semibold">
          {project?.project_name || t('مشروع تشطيب')}
        </div>
      </div>

      {/* Language Switcher Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#EEE7DE] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center shrink-0">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#292D32]">{t('اللغة / Language')}</h3>
            <p className="text-xs text-[#73777D]">
              {language === 'ar' ? 'العربية (مفعّلة)' : 'English (Active)'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
        >
          {language === 'ar' ? 'English' : 'عربي'}
        </button>
      </div>

      {/* Apartment Profile Card */}
      {project ? (
        <div className="bg-white rounded-3xl p-6 border border-[#EEE7DE] shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
                {t('ملف الشقة')}
              </span>
              <h2 className="text-xl font-bold text-[#292D32] mt-0.5">
                {project.project_name || t('مشروع تشطيب')}
              </h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#EFE9E1] text-[#8B5E3C] font-semibold border border-[#E4DDD3]">
              {currentStateLabel(project.current_state)}
            </span>
          </div>

          <p className="text-xs text-[#73777D]">
            {arabicNumber(project.area_sqm)} {t('م²')} · {arabicNumber(project.bedroom_count)} {t('غرف نوم')} · {arabicNumber(project.bathroom_count)} {t('حمامات')}
          </p>

          <div className="pt-3 border-t border-[#E4DDD3] flex justify-between items-center">
            <span className="text-xs text-[#73777D] font-medium">{t('الميزانية المحددة')}</span>
            <span className="text-base font-bold text-[#292D32] font-mono">
              {money(project.budget_egp)}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-[#E4DDD3] text-center space-y-2">
          <p className="text-xs text-[#73777D]">{t('لا يوجد ملف شقة حالياً.')}</p>
        </div>
      )}

      {/* Edit Details Button */}
      {project && (
        <button
          onClick={onOpenProjectSetup}
          className="w-full py-3.5 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
        >
          <Pencil size={16} />
          <span>{t('تعديل بيانات الشقة')}</span>
        </button>
      )}

      {/* Export Roadmap & Budget as PDF Card & Button */}
      {project && (
        <div className="bg-gradient-to-r from-[#EFE9E1] via-white to-[#EFE9E1] rounded-3xl p-5 border border-[#D5A66D]/50 shadow-sm space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileDown size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292D32]">
                  {t('تصدير تقرير PDF أوفلاين')}
                </h3>
                <p className="text-xs text-[#73777D] mt-0.5 leading-relaxed">
                  {t('خريطة المراحل وموجز الميزانية وجداول الخامات في مستند PDF قابل للحفظ والطباعة')}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="w-full py-3 px-4 bg-[#8B5E3C] hover:bg-[#724c30] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer active:scale-[0.99]"
          >
            <Download size={15} />
            <span>{t('تصدير تقرير PDF للمشروع والخريطة')}</span>
          </button>
        </div>
      )}

      {/* Budget Tracker & Calculator Trigger */}
      {project && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-[#292D32] px-1">
            {t('ميزانية المشروع')}
          </h3>
          <div
            onClick={onOpenCalculator}
            className="bg-white rounded-3xl p-6 border border-[#EEE7DE] shadow-sm space-y-3 cursor-pointer hover:border-[#D5A66D] transition"
          >
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-black text-[#292D32] font-mono">
                {money(usedBudget)}
              </div>
              <span className="text-xs font-bold text-[#8B5E3C]">
                {arabicNumber(usedPercent)}%
              </span>
            </div>

            <div className="text-xs text-[#73777D]">
              {t('تم شراؤه حتى الآن · ')}
              {arabicNumber(usedPercent)}
              {t('٪ من الميزانية')}
            </div>

            <div className="h-2 w-full bg-[#E4DDD3] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  plannedOver ? 'bg-amber-600' : 'bg-[#D5A66D]'
                }`}
                style={{ width: `${Math.min(100, usedPercent)}%` }}
              />
            </div>

            <div className="text-xs text-[#73777D] pt-1 flex items-center justify-between">
              <span>
                {t('إجمالي المخطط في القائمة: ')}
                {money(plannedTotal)}
                {plannedOver ? t(' · يتجاوز ميزانيتك') : ''}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E4DDD3] flex items-center justify-between text-xs font-bold text-[#8B5E3C]">
              <span className="flex items-center gap-1.5">
                <Calculator size={15} />
                <span>{t('اضغط لفتح حاسبة التشطيب')}</span>
              </span>
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </div>
          </div>
        </div>
      )}

      {/* Project Preferences */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-bold text-[#292D32] px-1">
          {t('تنبيهات التنفيذ')}
        </h3>
        <div className="bg-white rounded-2xl p-4 border border-[#EEE7DE] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#292D32]">
                {t('تنبيه الفحص المتخصص داخل التطبيق')}
              </div>
              <div className="text-xs text-[#73777D]">
                {t('يظهر في الخريطة عند المراحل الحساسة')}
              </div>
            </div>
          </div>

          <button
            onClick={() => setPreferences(prev => ({ ...prev, inspectionReminders: !prev.inspectionReminders }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              preferences.inspectionReminders ? 'bg-[#D5A66D]' : 'bg-[#E4DDD3]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                preferences.inspectionReminders ? (isRtl ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Safety & Estimates Notes */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-sm font-bold text-[#292D32] px-1">
          {t('عن التطبيق')}
        </h3>

        <div className="p-4 bg-[#EFE9E1] rounded-2xl border border-[#E4DDD3] text-xs text-[#292D32] leading-relaxed">
          {t(ESTIMATE_NOTE)}
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p>{t(SAFETY_NOTE)}</p>
        </div>

        {/* Legal Links */}
        <div className="bg-white rounded-2xl border border-[#EEE7DE] divide-y divide-[#E4DDD3] overflow-hidden text-xs">
          <button
            onClick={openPrivacy}
            className="w-full p-3.5 flex items-center justify-between text-[#292D32] hover:bg-[#F7F4EF] transition text-left cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium">
              <Lock size={15} className="text-[#8B5E3C]" />
              <span>{t('سياسة الخصوصية')}</span>
            </span>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            onClick={openTerms}
            className="w-full p-3.5 flex items-center justify-between text-[#292D32] hover:bg-[#F7F4EF] transition text-left cursor-pointer"
          >
            <span className="flex items-center gap-2 font-medium">
              <FileText size={15} className="text-[#8B5E3C]" />
              <span>{t('شروط الاستخدام')}</span>
            </span>
            {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Reset / Demo Data Button */}
        <div className="pt-2 text-center">
          <button
            onClick={resetToSampleData}
            className="text-xs text-[#73777D] hover:text-[#8B5E3C] inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-[#EFE9E1] transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>{t('استعادة البيانات النموذجية الأولية')}</span>
          </button>
        </div>
      </div>

      {/* Legal Dialog */}
      {modalContent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E4DDD3] shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#292D32]">{modalContent.title}</h3>
            <p className="text-xs text-[#73777D] leading-relaxed whitespace-pre-line">
              {modalContent.content}
            </p>
            <button
              onClick={() => setModalContent(null)}
              className="w-full py-3 bg-[#D5A66D] text-[#29231D] font-bold rounded-xl text-xs transition hover:bg-[#c9975b]"
            >
              {t('متابعة')}
            </button>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <PdfExportModal onClose={() => setIsPdfModalOpen(false)} />
      )}
    </div>
  );
};
