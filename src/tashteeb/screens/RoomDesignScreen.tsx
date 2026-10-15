import React, { useState } from 'react';
import { useLanguage, useProject } from '../context';
import { DESIGN_OPTIONS, ROOM_CHOICES, ROOM_NAMES, ESTIMATE_NOTE } from '../data';
import { ChevronRight, ChevronLeft, Check, Sparkles, RefreshCw, Wand2 } from 'lucide-react';
import { AiImageStudioModal } from '../components/AiImageStudioModal';

interface RoomDesignScreenProps {
  designId: string;
  onBack: () => void;
}

export const RoomDesignScreen: React.FC<RoomDesignScreenProps> = ({ designId, onBack }) => {
  const { t, language, impactLabel } = useLanguage();
  const { project, updateProjectData } = useProject();

  const isRtl = language === 'ar';
  const design = DESIGN_OPTIONS.find(d => d.id === designId) || DESIGN_OPTIONS[0];

  const [selectedRoom, setSelectedRoom] = useState<string>(ROOM_NAMES[0]);
  const [selections, setSelections] = useState<Record<string, number[]>>(() => {
    return project?.project_data.room_choices || {};
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const choices = ROOM_CHOICES[selectedRoom] || [];
  const roomSelection = selections[selectedRoom] || [];

  const optionIndex = (choiceIndex: number) => {
    return typeof roomSelection[choiceIndex] === 'number' ? roomSelection[choiceIndex] : 0;
  };

  const cycleChoice = (choiceIndex: number) => {
    const next = choices.map((_, idx) => optionIndex(idx));
    const totalOptions = choices[choiceIndex].options.length;
    next[choiceIndex] = (next[choiceIndex] + 1) % totalOptions;

    const copy = { ...selections, [selectedRoom]: next };
    setSelections(copy);
  };

  const totalImpact = choices.reduce((sum, choice, idx) => {
    const opt = choice.options[optionIndex(idx)];
    return sum + (opt ? opt[1] : 0);
  }, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveRoom = () => {
    if (!project) return;
    const roomChoices = {
      ...project.project_data.room_choices,
      ...selections,
      [selectedRoom]: choices.map((_, idx) => optionIndex(idx))
    };

    updateProjectData({
      room_choices: roomChoices,
      selected_design: design.title
    });

    showToast(t('تم حفظ اختيارات ') + t(selectedRoom) + t(' داخل مشروعك.'));
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
          {t('تصميم الغرف')}
        </h1>
        <div className="w-6" />
      </div>

      {/* Room Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ROOM_NAMES.map((room) => {
          const isSelected = selectedRoom === room;
          return (
            <button
              key={room}
              onClick={() => setSelectedRoom(room)}
              className={`py-2 px-4 rounded-full text-xs font-bold transition shrink-0 border ${
                isSelected
                  ? 'bg-[#D5A66D] text-[#29231D] border-[#D5A66D] shadow-xs'
                  : 'bg-[#EFE9E1] text-[#292D32] border-[#E4DDD3] hover:bg-white'
              }`}
            >
              {t(room)}
            </button>
          );
        })}
      </div>

      {/* Room Image */}
      <div className="relative h-44 rounded-3xl overflow-hidden shadow-sm border border-[#E4DDD3]">
        <img
          src={design.image}
          alt={t(selectedRoom)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <h2 className="text-lg font-bold">{t(selectedRoom)} · {t(design.title)}</h2>
            <p className="text-[11px] text-white/80">{t('اضغط على أي اختيار لتبديل الخيار.')}</p>
          </div>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] text-[11px] font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
          >
            <Wand2 size={12} />
            <span>AI Edit</span>
          </button>
        </div>
      </div>

      {/* Choices List */}
      <div className="space-y-2.5">
        {choices.map((choice, index) => {
          const currentOptIdx = optionIndex(index);
          const option = choice.options[currentOptIdx] || choice.options[0];

          return (
            <div
              key={selectedRoom + choice.label}
              onClick={() => cycleChoice(index)}
              className="bg-white rounded-2xl p-4 border border-[#E4DDD3] shadow-xs hover:border-[#D5A66D] transition flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs text-[#73777D] block">
                  {t(choice.label)}
                </span>
                <span className="text-sm font-bold text-[#292D32] mt-0.5 block">
                  {t(option[0])}
                </span>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold block ${
                  option[1] > 0 ? 'text-amber-800' : option[1] < 0 ? 'text-emerald-700' : 'text-[#73777D]'
                }`}>
                  {impactLabel(option[1])}
                </span>
                <span className="text-[10px] text-[#8B5E3C] inline-flex items-center gap-1 mt-0.5">
                  <RefreshCw size={10} />
                  <span>{t('انقر للتغيير')}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Impact Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#EEE7DE] shadow-xs flex justify-between items-center">
        <span className="text-xs font-bold text-[#292D32]">
          {t('فرق التكلفة عن الأساس')}
        </span>
        <span className="text-sm font-bold font-mono text-[#8B5E3C]">
          {impactLabel(totalImpact)}
        </span>
      </div>

      {/* Note Card */}
      <div className="p-4 bg-[#EFE9E1] rounded-2xl border border-[#E4DDD3] text-xs text-[#292D32] leading-relaxed">
        {t(ESTIMATE_NOTE)}
      </div>

      {/* Save Button */}
      <button
        onClick={saveRoom}
        className="w-full py-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
      >
        <Check size={18} />
        <span>{t('حفظ اختيارات ') + t(selectedRoom)}</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-6 right-6 z-50 p-3.5 bg-[#292D32] text-white text-xs font-semibold rounded-2xl shadow-xl border border-[#8B5E3C] text-center animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* AI Image Studio Modal */}
      {isAiModalOpen && (
        <AiImageStudioModal
          initialRoomName={selectedRoom}
          initialImageUrl={design.image}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </div>
  );
};
