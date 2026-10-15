import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { 
  X, 
  Sparkles, 
  Wand2, 
  Upload, 
  Download, 
  Image as ImageIcon, 
  RefreshCw, 
  Check, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Maximize2,
  Copy,
  Info
} from 'lucide-react';

interface AiImageStudioModalProps {
  onClose: () => void;
  initialRoomName?: string;
  initialImageUrl?: string;
}

export const AiImageStudioModal: React.FC<AiImageStudioModalProps> = ({
  onClose,
  initialRoomName,
  initialImageUrl
}) => {
  const { language, t } = useLanguage();
  const { project, updateProjectData } = useProject();

  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');

  // Generation state
  const [prompt, setPrompt] = useState<string>(() => {
    if (initialRoomName === 'المطبخ') return 'مطبخ مودرن مع خزائن HPL باللون الأخضر المطفي، سطح عمل كوارتز أبيض، وإضاءة ليد مخفية';
    if (initialRoomName === 'غرفة النوم') return 'غرفة نوم ماستر مريحة مع ظهر سرير بانوهات خشبية، دهان أوف وايت هادئ، وإضاءة دافئة';
    if (initialRoomName === 'الحمام') return 'حمام فاخر مع بورسلين رمادي مطفي كبير، مرآة مضيئة ليد دائرية، وطقم صحي معلق';
    return 'ريسبشن شقة مودرن واسع مع أرضيات بورسلين بيج لامع ٦٠×١٢٠، دهانات أوف وايت، جدار تلفزيون خشبي أنيق، وسبوتات إضاءة دافئة';
  });

  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [imageSize, setImageSize] = useState<string>('1K');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit state
  const [sourceImage, setSourceImage] = useState<string | null>(initialImageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80');
  const [editPrompt, setEditPrompt] = useState<string>(() => 
    language === 'en' 
      ? 'Change wall paint color to warm off-white and add hidden cove lighting in ceiling recess' 
      : 'قم بتغيير لون دهان الحوائط إلى أوف وايت دافئ وأضف إضاءة مخفية في بيت النور بالسقف'
  );
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const samplePrompts = [
    { 
      label: 'ريسبشن مودرن', 
      prompt: language === 'en' 
        ? 'Spacious modern living room, 60x120 matte grey porcelain floor, wood slat accent wall, warm spot lighting' 
        : 'ريسبشن واسع بتشطيب حديث، بورسلين رمادي ٦٠×١٢٠، حائط خشب بديل شيبورد، وسبوتات دافئة' 
    },
    { 
      label: 'مطبخ مفتوح', 
      prompt: language === 'en'
        ? 'Open-concept kitchen with natural wood cabinets, grey quartz countertops and stylish pendant lights'
        : 'مطبخ أمريكي مفتوح بخزائن خشب طبيعي مع كوارتز رمادي وإضاءة معلقة شيك' 
    },
    { 
      label: 'غرفة نوم هادئة', 
      prompt: language === 'en'
        ? 'Calm modern bedroom with light HDF parquet, gentle hidden lighting and elegant wall molding'
        : 'غرفة نوم مودرن مريحة مع باركيه HDF فاتح وإضاءة مخفية هادئة وبانوهات جدارية' 
    },
    { 
      label: 'حمام رخامي', 
      prompt: language === 'en'
        ? 'Luxury bathroom with white Calacatta gold-veined porcelain, glass walk-in shower, smart LED mirror'
        : 'حمام فاخر ببورسلين أبيض كلكتا عروق ذهبية، كابينة شاور زجاج، وإضاءة مرايا ذكية' 
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          imageSize
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء الاتصال بنموذج الذكاء الاصطناعي');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !editPrompt.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/images/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          imageBase64: sourceImage,
          aspectRatio,
          imageSize
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to edit image');
      }

      setEditedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء تعديل الصورة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (imageUrl: string, filename = 'tashteeb_design.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-[#F7F4EF] rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-[#E4DDD3] shadow-2xl overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4DDD3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8B5E3C] text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#292D32]">
                  {t('استوديو التصميم والتعديل بالذكاء الاصطناعي')}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFE9E1] text-[#8B5E3C] border border-[#E4DDD3] font-bold">
                  gemini-nano-banana-2.1
                </span>
              </div>
              <p className="text-[11px] text-[#73777D]">
                {t('أنشئ وعدّل صور وتصاميم ديكور شقتك باستخدام الأوامر النصية')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#73777D] hover:text-[#292D32] hover:bg-[#EFE9E1] rounded-xl transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-[#E4DDD3] px-5 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'create'
                ? 'border-[#8B5E3C] text-[#8B5E3C]'
                : 'border-transparent text-[#73777D] hover:text-[#292D32]'
            }`}
          >
            <Wand2 size={15} />
            <span>{t('إنشاء تصميم جديد من نص')}</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'edit'
                ? 'border-[#8B5E3C] text-[#8B5E3C]'
                : 'border-transparent text-[#73777D] hover:text-[#292D32]'
            }`}
          >
            <ImageIcon size={15} />
            <span>{t('تعديل صورة شقة موجودة')}</span>
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-start gap-2">
              <Info size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {activeTab === 'create' ? (
            /* Tab 1: Create New Image */
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EEE7DE] shadow-xs space-y-3">
                <label className="text-xs font-bold text-[#292D32] block">
                  {t('اكتب وصف التصميم أو الخامات المطلوبة:')}
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? 'e.g. Modern open living room with matte grey porcelain tiles, wood slat accent wall, and warm spotlights...'
                      : 'مثال: ريسبشن مودرن بأرضيات بورسلين رمادي مطفي، حائط خشبي مع إضاءة سبوت دافئة...'
                  }
                  className="w-full p-3.5 bg-[#F7F4EF] border border-[#E4DDD3] rounded-2xl text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#D5A66D] leading-relaxed resize-none"
                />

                {/* Sample Prompt Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#73777D] font-medium block">
                    {t('اقتراحات سريعة لغرف الشقة:')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {samplePrompts.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(s.prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-xl bg-[#EFE9E1] hover:bg-[#E4DDD3] text-[#8B5E3C] font-semibold transition"
                      >
                        {t(s.label)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ratio and Size Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E4DDD3]">
                  <div>
                    <label className="text-[11px] font-bold text-[#73777D] block mb-1">
                      {t('أبعاد الصورة (Aspect Ratio):')}
                    </label>
                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full p-2 bg-[#F7F4EF] border border-[#E4DDD3] rounded-xl text-xs text-[#292D32] font-semibold"
                    >
                      <option value="16:9">{t('16:9 (عرضي واسع للغرف)')}</option>
                      <option value="1:1">{t('1:1 (مربع كلاسيكي)')}</option>
                      <option value="4:3">{t('4:3 (كلاسيكي)')}</option>
                      <option value="9:16">{t('9:16 (طولي للهاتف)')}</option>
                      <option value="4:1">{t('4:1 (بانوراما جدارية)')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#73777D] block mb-1">
                      {t('دقة وجودة الصورة (Resolution):')}
                    </label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full p-2 bg-[#F7F4EF] border border-[#E4DDD3] rounded-xl text-xs text-[#292D32] font-semibold"
                    >
                      <option value="1K">{t('1K (قياسي فائق السرعة)')}</option>
                      <option value="2K">{t('2K (دقة عالية وتفاصيل أعمق)')}</option>
                      <option value="4K">{t('4K (أعلى دقة تصميم فائقة)')}</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full py-3.5 bg-[#8B5E3C] hover:bg-[#724c30] disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>{t('جاري إنشاء التصميم بالذكاء الاصطناعي...')}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} />
                      <span>{t('إنشاء التصميم الآن بواسطة gemini-nano-banana-2.1')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Image Result Display */}
              {generatedImage && (
                <div className="bg-white rounded-3xl p-4 border border-[#D5A66D]/70 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1.5">
                      <Sparkles size={14} />
                      <span>{t('التصميم المنشأ بالذكاء الاصطناعي')}</span>
                    </span>
                    <button
                      onClick={() => handleDownload(generatedImage, 'generated_design.png')}
                      className="text-xs text-[#8B5E3C] hover:text-[#292D32] font-bold flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span>{t('تحميل الصورة')}</span>
                    </button>
                  </div>

                  <div className="rounded-2xl overflow-hidden bg-slate-900 border border-[#E4DDD3] max-h-[420px] flex items-center justify-center">
                    <img 
                      src={generatedImage} 
                      alt="Generated interior" 
                      className="w-full h-auto max-h-[420px] object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        setSourceImage(generatedImage);
                        setActiveTab('edit');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#EFE9E1] text-[#8B5E3C] text-xs font-bold hover:bg-[#E4DDD3] transition flex items-center gap-1.5"
                    >
                      <Wand2 size={13} />
                      <span>{t('تعديل هذا التصميم بأمر جديد')}</span>
                    </button>

                    <button
                      onClick={() => handleDownload(generatedImage, 'tashteeb_design.png')}
                      className="px-4 py-2 rounded-xl bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Download size={13} />
                      <span>{t('حفظ في المعرض')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Edit Existing Image */
            <div className="space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EEE7DE] shadow-xs space-y-4">
                {/* Source Image Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[#292D32]">
                      {t('الصورة المراد تعديلها:')}
                    </label>
                    <label className="text-xs text-[#8B5E3C] hover:text-[#292D32] font-bold flex items-center gap-1 cursor-pointer">
                      <Upload size={13} />
                      <span>{t('رفع صورة من جهازك')}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {sourceImage ? (
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-[#E4DDD3]">
                      <img 
                        src={sourceImage} 
                        alt="Source" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                        {t('الصورة الحالية')}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 border-2 border-dashed border-[#E4DDD3] rounded-2xl flex flex-col items-center justify-center text-xs text-[#73777D] gap-2">
                      <Upload size={24} className="text-[#8B5E3C]" />
                      <span>{t('قم باختيار صورة للتعديل عليها')}</span>
                    </div>
                  )}
                </div>

                {/* Edit Instruction Prompt */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#292D32] block">
                    {t('ما التعديل الذي ترغب في إجرائه على الصورة؟')}
                  </label>
                  <textarea
                    rows={2}
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Change wall color to soft grey, add warm wood flooring...' : 'مثال: غيّر لون الحائط إلى رمادي فاتح، وأضف باركيه خشب هادئ...'}
                    className="w-full p-3.5 bg-[#F7F4EF] border border-[#E4DDD3] rounded-2xl text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#D5A66D] leading-relaxed resize-none"
                  />
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleEdit}
                  disabled={isLoading || !sourceImage || !editPrompt.trim()}
                  className="w-full py-3.5 bg-[#8B5E3C] hover:bg-[#724c30] disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>{t('جاري تطبيق التعديل بالذكاء الاصطناعي...')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>{t('تطبيق التعديلات بواسطة gemini-nano-banana-2.1')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Edited Image Result */}
              {editedImage && (
                <div className="bg-white rounded-3xl p-4 border border-[#D5A66D]/70 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8B5E3C] flex items-center gap-1.5">
                      <Check size={14} />
                      <span>{t('النتيجة بعد التعديل')}</span>
                    </span>
                    <button
                      onClick={() => handleDownload(editedImage, 'edited_design.png')}
                      className="text-xs text-[#8B5E3C] hover:text-[#292D32] font-bold flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span>{t('تحميل الصورة')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#73777D] block">{t('قبل التعديل:')}</span>
                      <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-[#E4DDD3]">
                        <img 
                          src={sourceImage!} 
                          alt="Before edit" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8B5E3C] font-bold block">{t('بعد التعديل:')}</span>
                      <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-[#D5A66D]">
                        <img 
                          src={editedImage} 
                          alt="After edit" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(editedImage, 'tashteeb_edited.png')}
                    className="w-full py-3 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download size={14} />
                    <span>{t('حفظ وتحميل التصميم المعدل')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
