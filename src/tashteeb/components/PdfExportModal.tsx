import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage, useProject } from '../context';
import { STAGES, ESTIMATE_NOTE, SAFETY_NOTE } from '../data';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  Calendar,
  Building,
  Coins,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';

interface PdfExportModalProps {
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({ onClose }) => {
  const { language, t, arabicNumber, money, currentStateLabel, budgetLabel } = useLanguage();
  const { project, shoppingItems } = useProject();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isRtl = language === 'ar';
  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const completedCount = project?.project_data.completed_stages || 0;
  const projectItems = shoppingItems.filter(i => !project || i.project_id === project.id);
  const purchasedItems = projectItems.filter(i => i.is_purchased);
  const remainingItems = projectItems.filter(i => !i.is_purchased);

  const totalBudget = Number(project?.budget_egp) || 0;
  const purchasedTotal = purchasedItems.reduce((acc, i) => acc + Number(i.estimated_cost_egp || 0), 0);
  const remainingTotal = remainingItems.reduce((acc, i) => acc + Number(i.estimated_cost_egp || 0), 0);
  const grandEstimatedTotal = purchasedTotal + remainingTotal;
  const utilizedPercent = totalBudget > 0 ? Math.min(100, Math.round((purchasedTotal / totalBudget) * 100)) : 0;

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isGenerating) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      // Allow DOM to ensure all fonts and styles are applied
      await new Promise(r => setTimeout(r, 150));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // 2x for sharp print quality
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First Page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Subsequent pages if content overflows A4
      while (heightLeft > 5) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeProjectName = (project?.project_name || 'tashteeb')
        .replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
      pdf.save(`Tashteeb_${safeProjectName}_Report.pdf`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    // Also provide direct browser print styling trigger
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-[#F7F4EF] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-[#E4DDD3] shadow-2xl overflow-hidden"
      >
        {/* Modal Top Header Toolbar */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4DDD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#292D32]">
                {t('تصدير تقرير PDF للمشروع والخريطة')}
              </h2>
              <p className="text-[11px] text-[#73777D]">
                {t('ملف PDF منسق وجاهز للحفظ أوفلاين والمشاركة مع المهندس والموردين')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#D5A66D] hover:bg-[#c9975b] disabled:opacity-50 text-[#29231D] font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('جاري إنشاء PDF...')}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>{t('تحميل ملف PDF')}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#73777D] hover:text-[#292D32] hover:bg-[#EFE9E1] rounded-xl transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
            <CheckCircle2 size={15} />
            <span>{t('تم تحميل تقرير PDF بنجاح على جهازك!')}</span>
          </div>
        )}

        {/* Scrollable Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F7F4EF]">
          <div className="text-[11px] text-center text-[#73777D] mb-3">
            {t('معاينة المستند قبل التحميل (A4 Printable Document Preview):')}
          </div>

          {/* Printable Document Paper */}
          <div 
            ref={reportRef}
            className="w-full max-w-[800px] mx-auto bg-white border border-[#E4DDD3] rounded-2xl p-6 sm:p-10 shadow-lg text-[#292D32] space-y-6"
            style={{ minHeight: '1050px' }}
          >
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-[#8B5E3C] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center font-bold font-mono">
                    ط
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#8B5E3C] tracking-tight">
                      {t('تشطيب | Tashteeb')}
                    </h1>
                    <span className="text-[10px] text-[#73777D] block">
                      {t('دليل وخريطة تشطيب الشقق وحاسبة التكاليف والخامات')}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`${isRtl ? 'text-right' : 'text-left'} text-xs text-[#73777D] space-y-0.5`}>
                <div className="font-bold text-[#292D32]">{t('تقرير شامل لمشروع التشطيب')}</div>
                <div>{t('تاريخ التقرير: ') + currentDate}</div>
                <div className="text-[10px] font-mono text-[#8B5E3C]">PDF Offline Export</div>
              </div>
            </div>

            {/* Project Details Overview Bar */}
            <div className="bg-[#F7F4EF] border border-[#E4DDD3] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#73777D] block text-[11px]">{t('اسم المشروع:')}</span>
                <span className="font-bold text-[#292D32] text-sm">
                  {t(project?.project_name || 'شقة عائلة منصور')}
                </span>
              </div>
              <div>
                <span className="text-[#73777D] block text-[11px]">{t('مساحة الشقة:')}</span>
                <span className="font-bold text-[#292D32] text-sm">
                  {arabicNumber(project?.area_sqm || 140)} {t('م²')}
                </span>
              </div>
              <div>
                <span className="text-[#73777D] block text-[11px]">{t('الحالة والمستوى:')}</span>
                <span className="font-bold text-[#292D32]">
                  {currentStateLabel(project?.current_state || 'red_brick')} ({budgetLabel(project?.budget_level || 'standard')})
                </span>
              </div>
              <div>
                <span className="text-[#73777D] block text-[11px]">{t('الميزانية المحددة:')}</span>
                <span className="font-bold text-[#8B5E3C] text-sm font-mono">
                  {money(totalBudget)}
                </span>
              </div>
            </div>

            {/* Financial & Budget Executive Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#8B5E3C] flex items-center gap-1.5 border-b border-[#E4DDD3] pb-1.5">
                <Coins size={16} />
                <span>{t('الموجز المالي وحالة الميزانية (Budget Summary)')}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white border border-[#E4DDD3] rounded-xl p-3.5 space-y-1">
                  <span className="text-[#73777D]">{t('إجمالي المنصرف (تم شراؤه):')}</span>
                  <div className="text-lg font-bold text-emerald-800 font-mono">
                    {money(purchasedTotal)}
                  </div>
                  <span className="text-[10px] text-[#73777D] block">
                    {arabicNumber(purchasedItems.length)} {t(' بند تم تنفيذه وشراؤه')}
                  </span>
                </div>

                <div className="bg-white border border-[#E4DDD3] rounded-xl p-3.5 space-y-1">
                  <span className="text-[#73777D]">{t('المتبقي للشراء في الخطة:')}</span>
                  <div className="text-lg font-bold text-[#8B5E3C] font-mono">
                    {money(remainingTotal)}
                  </div>
                  <span className="text-[10px] text-[#73777D] block">
                    {arabicNumber(remainingItems.length)} {t(' بند متبقي للتوريد')}
                  </span>
                </div>

                <div className="bg-white border border-[#E4DDD3] rounded-xl p-3.5 space-y-1">
                  <span className="text-[#73777D]">{t('إجمالي تكلفة الخطة المقدرة:')}</span>
                  <div className="text-lg font-bold text-[#292D32] font-mono">
                    {money(grandEstimatedTotal)}
                  </div>
                  <span className="text-[10px] text-[#73777D] block">
                    {t('نسبة الاستهلاك: ')}{arabicNumber(utilizedPercent)}%{t(' من الميزانية')}
                  </span>
                </div>
              </div>
            </div>

            {/* Roadmap Execution Stages Summary (All 12 Stages) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#E4DDD3] pb-1.5">
                <h3 className="text-sm font-bold text-[#8B5E3C] flex items-center gap-1.5">
                  <Layers size={16} />
                  <span>{t('موقف مراحل التشطيب (Renovation Roadmap Status - 12 Stages)')}</span>
                </h3>
                <span className="text-xs font-bold text-[#292D32]">
                  {t('اكتملت ')}{arabicNumber(completedCount)}{t(' من ')}{arabicNumber(STAGES.length)}{t(' مرحلة · ')}{arabicNumber(Math.round((completedCount / STAGES.length) * 100))}%
                </span>
              </div>

              <div className="border border-[#E4DDD3] rounded-xl overflow-hidden divide-y divide-[#E4DDD3] text-xs">
                {STAGES.map((stage) => {
                  const isStageDone = stage.id <= completedCount;
                  const isCurrent = stage.id === completedCount + 1;
                  const isInspected = Boolean(project?.project_data.inspected[stage.id]);

                  return (
                    <div 
                      key={stage.id}
                      className={`p-2.5 flex items-center justify-between ${
                        isStageDone ? 'bg-[#F7F4EF]/50' : isCurrent ? 'bg-amber-50/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                          isStageDone ? 'bg-[#8B5E3C] text-white' : isCurrent ? 'bg-[#D5A66D] text-black' : 'bg-[#EFE9E1] text-[#73777D]'
                        }`}>
                          {arabicNumber(stage.id)}
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-[#292D32]">
                            {t(stage.title)}
                          </span>
                          <span className="text-[#73777D] text-[10px] block truncate">
                            {t(stage.guide)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px]">
                        {stage.needsInspection && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isInspected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            <ShieldCheck size={11} />
                            <span>{isInspected ? t('تم فحص المتخصص') : t('مطلوب فحص فني')}</span>
                          </span>
                        )}

                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          isStageDone
                            ? 'bg-[#EFE9E1] text-[#8B5E3C]'
                            : isCurrent
                            ? 'bg-[#D5A66D]/30 text-[#8B5E3C]'
                            : 'text-[#73777D]'
                        }`}>
                          {isStageDone ? t('✓ مكتملة') : isCurrent ? t('قيد التنفيذ') : t('مرحلة لاحقة')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopping List Materials Table */}
            {projectItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-[#8B5E3C] border-b border-[#E4DDD3] pb-1.5 flex items-center justify-between">
                  <span>{t('جدول الخامات والمشتريات (Materials & Quantities)')}</span>
                  <span className="text-xs text-[#73777D] font-normal">
                    {arabicNumber(projectItems.length)} {t(' بند مسجل')}
                  </span>
                </h3>

                <table className={`w-full text-xs ${isRtl ? 'text-right' : 'text-left'} border border-[#E4DDD3] rounded-xl overflow-hidden`}>
                  <thead className="bg-[#F7F4EF] text-[#73777D] text-[11px] font-bold border-b border-[#E4DDD3]">
                    <tr>
                      <th className="p-2">{t('القسم')}</th>
                      <th className="p-2">{t('البند والخامة')}</th>
                      <th className="p-2">{t('الكمية المقدرة')}</th>
                      <th className="p-2">{t('السعر التقديري')}</th>
                      <th className="p-2">{t('الإجمالي')}</th>
                      <th className="p-2">{t('الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DDD3]">
                    {projectItems.map((item) => (
                      <tr key={item.id} className={item.is_purchased ? 'bg-emerald-50/20' : ''}>
                        <td className="p-2 text-[#73777D] font-medium">{t(item.stage_name)}</td>
                        <td className="p-2 font-semibold text-[#292D32]">{t(item.item_name)}</td>
                        <td className="p-2 font-mono">{arabicNumber(item.quantity)} {t(item.unit)}</td>
                        <td className="p-2 font-mono">{arabicNumber(item.unit_price_egp)} {language === 'en' ? 'EGP' : 'ج.م'}</td>
                        <td className="p-2 font-bold font-mono text-[#8B5E3C]">{money(item.estimated_cost_egp)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.is_purchased ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-[#73777D]'
                          }`}>
                            {item.is_purchased ? t('تم الشراء') : t('متبقي')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Verification Signatures & Notes */}
            <div className="pt-4 border-t border-[#E4DDD3] space-y-3 text-[11px] text-[#73777D]">
              <div className="bg-[#F7F4EF] rounded-xl p-3 border border-[#E4DDD3] leading-relaxed">
                <strong>{t('تنبيه هندسي واستشاري: ')}</strong>
                {t(SAFETY_NOTE)} {t(ESTIMATE_NOTE)}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="border-t border-dashed border-[#E4DDD3] pt-2 text-center">
                  <span className="block font-semibold text-[#292D32]">{t('توقيع واعتماد مالك الشقة')}</span>
                  <span className="text-[10px] text-[#73777D] mt-6 block">{t('الاسم: ............................................')}</span>
                </div>
                <div className="border-t border-dashed border-[#E4DDD3] pt-2 text-center">
                  <span className="block font-semibold text-[#292D32]">{t('توقيع المقاول / المهندس المنفذ')}</span>
                  <span className="text-[10px] text-[#73777D] mt-6 block">{t('الاسم: ............................................')}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-[#73777D] pt-3">
                {t('تم استخراج هذا التقرير آلياً بواسطة تطبيق تشطيب (Tashteeb App) • نسخة محفوظة أوفلاين')}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-5 py-3.5 bg-white border-t border-[#E4DDD3] flex items-center justify-between text-xs">
          <span className="text-[#73777D]">
            {t('يمكنك حفظ الملف بصيغة PDF والاحتفاظ به على الهاتف أو الكمبيوتر والطباعة في أي وقت.')}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl border border-[#E4DDD3] text-[#292D32] hover:bg-[#F7F4EF] font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>{t('طباعة المستند')}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('جاري إنشاء PDF...')}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>{t('تحميل ملف PDF')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
