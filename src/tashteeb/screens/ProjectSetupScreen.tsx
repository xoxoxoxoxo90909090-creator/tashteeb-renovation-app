import React, { useState, useEffect } from 'react';
import { useLanguage, useProject } from '../context';
import { ApartmentProject, ApartmentState, BudgetLevel } from '../types';
import { STATE_START_STAGE } from '../data';
import { ChevronRight, ChevronLeft, ArrowLeft, ArrowRight, Building, Check } from 'lucide-react';

interface ProjectSetupScreenProps {
  onBack: () => void;
}

export const ProjectSetupScreen: React.FC<ProjectSetupScreenProps> = ({ onBack }) => {
  const { t, language, currentStateLabel, budgetLabel } = useLanguage();
  const { project, setProject, updateProjectFields } = useProject();

  const isRtl = language === 'ar';

  const [name, setName] = useState(project?.project_name || '');
  const [area, setArea] = useState(project?.area_sqm ? String(project.area_sqm) : '140');
  const [bedrooms, setBedrooms] = useState(project?.bedroom_count !== undefined ? String(project.bedroom_count) : '3');
  const [bathrooms, setBathrooms] = useState(project?.bathroom_count !== undefined ? String(project.bathroom_count) : '2');
  const [balconies, setBalconies] = useState(project?.balcony_count !== undefined ? String(project.balcony_count) : '1');
  const [budget, setBudget] = useState(project?.budget_egp ? String(project.budget_egp) : '850000');
  const [stateValue, setStateValue] = useState<ApartmentState>(project?.current_state || 'red_brick');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>(project?.budget_level || 'standard');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveProject = () => {
    const areaNumber = Number(area);
    const bedroomsNumber = Number(bedrooms || 0);
    const bathroomsNumber = Number(bathrooms || 0);
    const balconiesNumber = Number(balconies || 0);
    const budgetNumber = Number(budget || 0);

    if (!name.trim()) {
      setErrorMessage(t('اكتب اسم المشروع أولًا.'));
      return;
    }
    if (!areaNumber || areaNumber < 20 || areaNumber > 1000) {
      setErrorMessage(t('اكتب مساحة بين ٢٠ و١٠٠٠ م².'));
      return;
    }
    if (bedroomsNumber > 10 || bathroomsNumber > 10 || balconiesNumber > 5) {
      setErrorMessage(t('راجع عدد الغرف والحمامات والبلكونات.'));
      return;
    }
    if (!budgetNumber) {
      setErrorMessage(t('اكتب ميزانيتك التقريبية لنقترح عليك الأنسب.'));
      return;
    }

    setErrorMessage(null);

    const fields = {
      project_name: name.trim(),
      area_sqm: areaNumber,
      bedroom_count: bedroomsNumber,
      bathroom_count: bathroomsNumber,
      balcony_count: balconiesNumber,
      current_state: stateValue,
      budget_level: budgetLevel,
      budget_egp: budgetNumber
    };

    if (project) {
      updateProjectFields(fields);
    } else {
      const newProject: ApartmentProject = {
        id: `proj_${Date.now()}`,
        ...fields,
        living_count: 1,
        kitchen_count: 1,
        project_data: {
          selected_design: null,
          completed_stages: STATE_START_STAGE[stateValue] || 0,
          checked: {},
          inspected: {},
          room_choices: {}
        }
      };
      setProject(newProject);
    }

    onBack();
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
          {t('بيانات الشقة')}
        </h1>
        <div className="w-6" />
      </div>

      <p className="text-xs text-[#73777D] leading-relaxed">
        {t('كل رقم هنا يساعدنا نحسب الكمية الفعلية والتكلفة الأقرب للواقع.')}
      </p>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      {/* Basic Inputs */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#292D32]">
          {t('المساحات الأساسية')}
        </h3>

        <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
          <label className="text-xs text-[#73777D] font-medium block">
            {t('اسم المشروع')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('مثال: شقة عائلة منصور')}
            className="w-full text-sm text-[#292D32] font-semibold focus:outline-none bg-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
            <label className="text-xs text-[#73777D] font-medium block">
              {t('مساحة الشقة م²')}
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="150"
              className="w-full text-sm text-[#292D32] font-semibold focus:outline-none bg-transparent font-mono"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
            <label className="text-xs text-[#73777D] font-medium block">
              {t('غرف النوم')}
            </label>
            <input
              type="number"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder="3"
              className="w-full text-sm text-[#292D32] font-semibold focus:outline-none bg-transparent font-mono"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
            <label className="text-xs text-[#73777D] font-medium block">
              {t('الحمامات')}
            </label>
            <input
              type="number"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
              placeholder="2"
              className="w-full text-sm text-[#292D32] font-semibold focus:outline-none bg-transparent font-mono"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
            <label className="text-xs text-[#73777D] font-medium block">
              {t('البلكونات')}
            </label>
            <input
              type="number"
              value={balconies}
              onChange={(e) => setBalconies(e.target.value)}
              placeholder="1"
              className="w-full text-sm text-[#292D32] font-semibold focus:outline-none bg-transparent font-mono"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E4DDD3] space-y-1">
          <label className="text-xs text-[#73777D] font-medium block">
            {t('الميزانية ج.م')}
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="800000"
            className="w-full text-base text-[#292D32] font-bold focus:outline-none bg-transparent font-mono"
          />
        </div>
      </div>

      {/* Apartment Condition Chips */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-bold text-[#292D32]">
          {t('حالة الشقة')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {(['red_brick', 'plastered', 'semi_finished', 'finished_renovation'] as ApartmentState[]).map((state) => {
            const isSelected = stateValue === state;
            return (
              <button
                type="button"
                key={state}
                onClick={() => setStateValue(state)}
                className={`py-3 px-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-between border ${
                  isSelected
                    ? 'bg-[#D5A66D] text-[#29231D] border-[#D5A66D] shadow-xs'
                    : 'bg-white text-[#292D32] border-[#E4DDD3] hover:border-[#D5A66D]'
                }`}
              >
                <span>{currentStateLabel(state)}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#73777D] mt-1">
          {t('سنبدأ خريطتك من المرحلة المناسبة لحالة الشقة، ويمكنك المتابعة منها.')}
        </p>
      </div>

      {/* Budget Level Chips */}
      <div className="space-y-2 pt-2">
        <h3 className="text-sm font-bold text-[#292D32]">
          {t('مستوى الميزانية')}
        </h3>
        <div className="flex gap-2">
          {(['economic', 'standard', 'premium'] as BudgetLevel[]).map((lvl) => {
            const isSelected = budgetLevel === lvl;
            return (
              <button
                type="button"
                key={lvl}
                onClick={() => setBudgetLevel(lvl)}
                className={`flex-1 py-3 px-3 rounded-2xl text-xs font-bold transition border ${
                  isSelected
                    ? 'bg-[#D5A66D] text-[#29231D] border-[#D5A66D] shadow-xs'
                    : 'bg-white text-[#292D32] border-[#E4DDD3] hover:border-[#D5A66D]'
                }`}
              >
                {budgetLabel(lvl)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveProject}
        className="w-full py-4 bg-[#D5A66D] hover:bg-[#c9975b] text-[#29231D] font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer mt-4"
      >
        <span>{project ? t('احفظ التعديلات') : t('أنشئ خطة شقتي')}</span>
        {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
      </button>
    </div>
  );
};
