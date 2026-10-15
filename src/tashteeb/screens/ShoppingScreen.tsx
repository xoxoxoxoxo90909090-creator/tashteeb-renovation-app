import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { ESTIMATE_NOTE, STAGE_ORDER } from '../data';
import { 
  CheckCircle2, 
  Circle, 
  Share2, 
  Info, 
  ShoppingCart, 
  Plus, 
  Check, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ShoppingScreenProps {
  onOpenCalculator: () => void;
  onOpenProjectSetup: () => void;
}

export const ShoppingScreen: React.FC<ShoppingScreenProps> = ({
  onOpenCalculator,
  onOpenProjectSetup
}) => {
  const { t, arabicNumber, money } = useLanguage();
  const { project, shoppingItems, togglePurchased, setShoppingItems } = useProject();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stageOrderIndex = (name: string) => {
    const idx = STAGE_ORDER.indexOf(name);
    return idx === -1 ? STAGE_ORDER.length : idx;
  };

  const projectItems = shoppingItems.filter(item => !project || item.project_id === project.id);
  const sortedItems = [...projectItems].sort((a, b) => stageOrderIndex(a.stage_name) - stageOrderIndex(b.stage_name));

  const remainingItems = sortedItems.filter(i => !i.is_purchased);
  const purchasedItems = sortedItems.filter(i => i.is_purchased);

  const remainingTotal = remainingItems.reduce((sum, i) => sum + Number(i.estimated_cost_egp || 0), 0);
  const purchasedTotal = purchasedItems.reduce((sum, i) => sum + Number(i.estimated_cost_egp || 0), 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareList = () => {
    if (remainingItems.length === 0) {
      showToast(t('لا توجد بنود متبقية للمشاركة.'));
      return;
    }

    const lines = remainingItems.map(
      item => `• ${t(item.item_name)} — ${arabicNumber(item.quantity)} ${t(item.unit || '')}`
    );
    const text =
      t('قائمة مشتريات التشطيب\n') +
      lines.join('\n') +
      t('\n\nالكميات تقديرية وتحتاج مراجعة نهائية قبل الشراء.');

    if (navigator.share) {
      navigator.share({ title: t('قائمة المشتريات'), text }).catch(() => {
        navigator.clipboard.writeText(text);
        showToast(t('تم نسخ القائمة إلى الحافظة للمشاركة!'));
      });
    } else {
      navigator.clipboard.writeText(text);
      showToast(t('تم نسخ القائمة إلى الحافظة لمشاركتها مع المورد!'));
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl font-black text-[#292D32] tracking-tight">
          {t('قائمة المشتريات')}
        </h1>
        <button
          onClick={() => showToast(ESTIMATE_NOTE)}
          className="w-9 h-9 rounded-full bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center hover:bg-[#E4DDD3] transition cursor-pointer"
          title={t('ملاحظة عن التقديرات')}
        >
          <Info size={18} />
        </button>
      </div>

      {!project ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4DDD3] shadow-sm text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center mx-auto">
            <ShoppingCart size={24} />
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
          {/* Summary Surface Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EEE7DE] shadow-sm space-y-2">
            <div className="text-3xl font-black text-[#292D32] font-mono tracking-tight">
              {money(remainingTotal)}
            </div>
            <div className="text-xs text-[#73777D] font-medium">
              {t('المتبقي للشراء · ')}
              {arabicNumber(remainingItems.length)}
              {t(' بند')}
            </div>
            <div className="text-xs text-[#8B5E3C] font-semibold pt-1">
              {t('تم شراؤه: ')}
              {money(purchasedTotal)}
            </div>
          </div>

          {/* Action button to open Calculator if items are few */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#73777D] uppercase tracking-wider">
              {t('بنود المواد والتشطيب')} ({sortedItems.length})
            </span>
            <button
              onClick={onOpenCalculator}
              className="text-xs text-[#8B5E3C] hover:text-[#292D32] font-bold flex items-center gap-1 bg-[#EFE9E1] px-3 py-1.5 rounded-xl border border-[#E4DDD3] transition"
            >
              <Plus size={14} />
              <span>{t('حاسبة التشطيب')}</span>
            </button>
          </div>

          {/* Empty state if no items */}
          {sortedItems.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-[#E4DDD3] text-center space-y-3">
              <p className="text-xs text-[#73777D] leading-relaxed">
                {t('لا توجد مواد بعد. افتح الحاسبة من تبويب المشروع وأضف الأقسام لتظهر هنا.')}
              </p>
              <button
                onClick={onOpenCalculator}
                className="py-2.5 px-5 bg-[#D5A66D] text-[#29231D] font-bold text-xs rounded-xl transition hover:bg-[#c9975b]"
              >
                {t('افتح حاسبة التشطيب')}
              </button>
            </div>
          ) : (
            /* Grouped List */
            <div className="space-y-4">
              {Array.from(new Set(sortedItems.map(i => i.stage_name))).map(stageName => {
                const stageItems = sortedItems.filter(i => i.stage_name === stageName);
                return (
                  <div key={stageName} className="space-y-2">
                    <h3 className="text-sm font-bold text-[#8B5E3C] px-1">
                      {t(stageName) || t('مواد أخرى')}
                    </h3>
                    <div className="space-y-2">
                      {stageItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => togglePurchased(item.id)}
                          className={`p-3.5 rounded-2xl border transition flex items-center gap-3 cursor-pointer ${
                            item.is_purchased
                              ? 'bg-white/50 border-[#E4DDD3] opacity-60'
                              : 'bg-white border-[#E4DDD3] hover:border-[#D5A66D] shadow-xs'
                          }`}
                        >
                          <div className="shrink-0 text-[#D5A66D]">
                            {item.is_purchased ? (
                              <CheckCircle2 size={22} className="text-[#8B5E3C]" />
                            ) : (
                              <Circle size={22} className="text-[#D5A66D]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-semibold truncate ${item.is_purchased ? 'line-through text-[#73777D]' : 'text-[#292D32]'}`}>
                              {t(item.item_name) || t('مادة تشطيب')}
                            </div>
                            <div className="text-xs text-[#73777D] truncate mt-0.5">
                              {arabicNumber(item.quantity)} {t(item.unit || '')}
                              {item.calculation_note ? ` · ${t(item.calculation_note)}` : ''}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-[#292D32] font-mono">
                              {money(item.estimated_cost_egp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Note Card */}
          <div className="p-4 bg-[#EFE9E1] rounded-2xl border border-[#E4DDD3] flex items-start gap-2.5 text-xs text-[#292D32] leading-relaxed">
            <Info size={18} className="text-[#8B5E3C] shrink-0 mt-0.5" />
            <p>{t(ESTIMATE_NOTE)}</p>
          </div>

          {/* Share Button */}
          {sortedItems.length > 0 && (
            <button
              onClick={handleShareList}
              className="w-full py-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              <Share2 size={18} />
              <span>{t('شارك القائمة مع المورد')}</span>
            </button>
          )}
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-6 right-6 z-50 p-3.5 bg-[#292D32] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#8B5E3C] text-center animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
