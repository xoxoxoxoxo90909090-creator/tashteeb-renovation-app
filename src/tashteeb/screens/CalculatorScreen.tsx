import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { ESTIMATE_NOTE } from '../data';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Info, 
  Check, 
  Layers, 
  Calculator as CalcIcon,
  Sparkles
} from 'lucide-react';

interface CalculatorScreenProps {
  onBack: () => void;
  onOpenShopping: () => void;
  onOpenProjectSetup: () => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  onBack,
  onOpenShopping,
  onOpenProjectSetup
}) => {
  const { t, language, arabicNumber, money } = useLanguage();
  const { project, buildCategories, addCategoryToShopping, addAllCategoriesToShopping } = useProject();

  const isRtl = language === 'ar';
  const [categoryId, setCategoryId] = useState<string>('floors');
  const [wastePct, setWastePct] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = buildCategories(wastePct);
  const category = categories[categoryId] || categories['floors'];
  const allCategoriesList = Object.values(categories);

  const categoryTotal = (cat: typeof category) => {
    return cat.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  };

  const grandTotal = allCategoriesList.reduce((sum, cat) => sum + categoryTotal(cat), 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCategory = () => {
    addCategoryToShopping(category);
    showToast(t('تمت الإضافة') + ': ' + t('تم تحديث قائمة المشتريات بدون تكرار البنود.'));
  };

  const handleAddAll = () => {
    addAllCategoriesToShopping(allCategoriesList);
    showToast(t('تمت الإضافة') + ': ' + t('تم تحديث قائمة المشتريات بدون تكرار البنود.'));
  };

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
          {t('حاسبة التشطيب')}
        </h1>
        <button
          onClick={() => showToast(ESTIMATE_NOTE)}
          className="w-8 h-8 rounded-full bg-[#EFE9E1] text-[#8B5E3C] flex items-center justify-center hover:bg-[#E4DDD3] transition"
          title={t('ملاحظة عن التقديرات')}
        >
          <Info size={15} />
        </button>
      </div>

      {!project ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4DDD3] text-center space-y-3">
          <p className="text-xs text-[#73777D]">{t('أنشئ ملف شقتك قبل إضافة المواد للقائمة.')}</p>
          <button
            onClick={onOpenProjectSetup}
            className="py-2.5 px-4 bg-[#D5A66D] text-[#29231D] font-bold text-xs rounded-xl"
          >
            {t('أضف بيانات الشقة')}
          </button>
        </div>
      ) : (
        <>
          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(categories).map((key) => {
              const isSelected = categoryId === key;
              return (
                <button
                  key={key}
                  onClick={() => setCategoryId(key)}
                  className={`py-2 px-4 rounded-full text-xs font-bold transition shrink-0 border ${
                    isSelected
                      ? 'bg-[#D5A66D] text-[#29231D] border-[#D5A66D] shadow-xs'
                      : 'bg-[#EFE9E1] text-[#292D32] border-[#E4DDD3] hover:bg-white'
                  }`}
                >
                  {t(categories[key].title)}
                </button>
              );
            })}
          </div>

          {/* Waste % Chips (Only for floors) */}
          {categoryId === 'floors' && (
            <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#EEE7DE]">
              <span className="text-xs font-semibold text-[#73777D]">{t('الهالك')}:</span>
              {[5, 10, 15].map((val) => (
                <button
                  key={val}
                  onClick={() => setWastePct(val)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    wastePct === val
                      ? 'bg-[#8B5E3C] text-white'
                      : 'bg-[#F7F4EF] text-[#292D32] hover:bg-[#EFE9E1]'
                  }`}
                >
                  {arabicNumber(val)}%
                </button>
              ))}
            </div>
          )}

          {/* Main Calculation Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EEE7DE] shadow-sm space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B5E3C]">
                {t(category.title)}
              </span>
              <div className="text-3xl font-black text-[#292D32] font-mono mt-1">
                {arabicNumber(category.mainQty)} {t(category.mainUnit)}
              </div>
              <div className="text-xs text-[#73777D] font-medium mt-0.5">
                {t(category.mainLabel)}
              </div>
            </div>

            {/* Sub-items Breakdown */}
            <div className="pt-3 border-t border-[#E4DDD3] space-y-3">
              {category.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#292D32]">{t(item.name)}</div>
                    <div className="text-[#73777D]">
                      {arabicNumber(item.qty)} {t(item.unit)} × {arabicNumber(item.price)} {language === 'en' ? 'EGP' : 'ج.م'} · {t(item.note)}
                    </div>
                  </div>
                  <div className="font-bold text-[#292D32] font-mono text-sm">
                    {money(item.qty * item.price)}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-[#73777D] pt-2 border-t border-[#E4DDD3] leading-relaxed">
              {t(category.assumption)}
            </p>
          </div>

          {/* Total Cost Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#EEE7DE] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#73777D] font-medium">
                {t('التكلفة التقديرية لـ')}{t(category.title)}
              </span>
              <span className="text-base font-bold text-[#292D32] font-mono">
                {money(categoryTotal(category))}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E4DDD3] flex justify-between items-center">
              <span className="text-xs font-bold text-[#8B5E3C]">
                {t('إجمالي كل الأقسام')}
              </span>
              <span className="text-lg font-black text-[#292D32] font-mono">
                {money(grandTotal)}
              </span>
            </div>

            <p className="text-[11px] text-[#73777D]">
              {t('تتغير التكلفة عند تعديل بيانات الشقة أو نسبة الهالك.')}
            </p>
          </div>

          {/* Note Card */}
          <div className="p-4 bg-[#EFE9E1] rounded-2xl border border-[#E4DDD3] text-xs text-[#292D32] leading-relaxed">
            {t(ESTIMATE_NOTE)}
          </div>

          {/* Add Category to Shopping Button */}
          <button
            onClick={handleAddCategory}
            className="w-full py-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
          >
            <Plus size={18} />
            <span>{t('أضف ') + t(category.title) + t(' للقائمة')}</span>
          </button>

          {/* Add All Categories to Shopping Button */}
          <button
            onClick={handleAddAll}
            className="w-full py-3.5 bg-white border border-[#E4DDD3] hover:bg-[#F7F4EF] text-[#292D32] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>{t('أضف كل الأقسام للقائمة')}</span>
          </button>
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
