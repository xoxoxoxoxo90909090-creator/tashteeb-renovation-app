import React, { useState } from 'react';
import { useLanguage, useIap } from '../context';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, ShieldCheck, Lock } from 'lucide-react';

interface PaywallScreenProps {
  onBack: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ onBack }) => {
  const { t, language, money } = useLanguage();
  const { isUnlocked, purchasePackage, restorePurchases } = useIap();

  const isRtl = language === 'ar';
  const [selectedPkg, setSelectedPkg] = useState<'yearly' | 'monthly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsProcessing(true);
    await purchasePackage(selectedPkg);
    setIsProcessing(false);
    setStatusMessage(t('تم التفعيل بنجاح. يمكنك الآن فتح تفاصيل التصميم.'));
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const res = await restorePurchases();
    setIsProcessing(false);
    if (res.restoredCount > 0) {
      setStatusMessage(t('تمت استعادة ') + '1' + t(' اشتراك.'));
      setTimeout(() => onBack(), 1200);
    } else {
      setStatusMessage(t('لم نجد مشتريات لاستعادتها.'));
    }
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
          {t('الخطة التفصيلية')}
        </h1>
        <div className="w-6" />
      </div>

      {/* Intro Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#EEE7DE] shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE9E1] text-[#8B5E3C] text-xs font-bold">
          <Sparkles size={13} />
          <span>Premium Plan</span>
        </div>
        <h2 className="text-xl font-bold text-[#292D32]">
          {t('افتح التصميم والكميات التفصيلية')}
        </h2>
        <p className="text-xs text-[#73777D] leading-relaxed">
          {t('تفاصيل التصميم لكل غرفة، مع تقدير فرق التكلفة لكل اختيار.')}
        </p>
      </div>

      {/* Subscription Packages */}
      <div className="space-y-3">
        {/* Yearly */}
        <div
          onClick={() => setSelectedPkg('yearly')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            selectedPkg === 'yearly'
              ? 'bg-white border-[#D5A66D] ring-2 ring-[#D5A66D]/30 shadow-md'
              : 'bg-white/80 border-[#E4DDD3] hover:border-[#D5A66D]'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#292D32]">{t('اشتراك سنوي (الأوفر)')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {t('وفّر ٤٠٪')}
              </span>
            </div>
            <p className="text-xs text-[#73777D] mt-1">
              {t('وصول كامل لجميع التصاميم وخيارات الغرف غير المحدودة.')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-[#8B5E3C] font-mono">{money(499)}</span>
            <span className="text-[10px] text-[#73777D] block">{t('/ سنويًا')}</span>
          </div>
        </div>

        {/* Monthly */}
        <div
          onClick={() => setSelectedPkg('monthly')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex items-center justify-between ${
            selectedPkg === 'monthly'
              ? 'bg-white border-[#D5A66D] ring-2 ring-[#D5A66D]/30 shadow-md'
              : 'bg-white/80 border-[#E4DDD3] hover:border-[#D5A66D]'
          }`}
        >
          <div>
            <span className="font-bold text-sm text-[#292D32]">{t('اشتراك شهري')}</span>
            <p className="text-xs text-[#73777D] mt-1">
              {t('تجديد مرن شهري مع إمكانية الإلغاء في أي وقت.')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-[#8B5E3C] font-mono">{money(69)}</span>
            <span className="text-[10px] text-[#73777D] block">{t('/ شهريًا')}</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium text-center">
          {t(statusMessage)}
        </div>
      )}

      {/* Primary Action Button */}
      <button
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full py-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
      >
        <Lock size={16} />
        <span>{isProcessing ? t('جاري المعالجة...') : isUnlocked ? t('متابعة') : t('تفعيل الخطة الآن')}</span>
      </button>

      {/* Restore Purchases */}
      <button
        onClick={handleRestore}
        disabled={isProcessing}
        className="w-full py-3 bg-transparent text-[#73777D] hover:text-[#292D32] font-semibold text-xs transition"
      >
        {t('استعادة المشتريات')}
      </button>

      {/* Legal Text */}
      <p className="text-[11px] text-[#73777D] leading-relaxed text-center px-2">
        {t('إذا كان المنتج اشتراكًا، فإنه يتجدد تلقائيًا بنفس السعر والمدة المعروضة ما لم تلغه قبل نهاية الفترة الحالية بـ ٢٤ ساعة على الأقل. يُخصم المبلغ من حسابك عند تأكيد الشراء، ويمكنك إدارة الاشتراك أو إلغاءه من إعدادات حسابك.')}
      </p>
    </div>
  );
};
