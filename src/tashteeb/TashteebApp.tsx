import React, { useState } from 'react';
import { useLanguage } from './context';
import { RoadmapScreen } from './screens/RoadmapScreen';
import { ShoppingScreen } from './screens/ShoppingScreen';
import { DesignScreen } from './screens/DesignScreen';
import { ProjectScreen } from './screens/ProjectScreen';
import { StageGuideScreen } from './screens/StageGuideScreen';
import { ProjectSetupScreen } from './screens/ProjectSetupScreen';
import { CalculatorScreen } from './screens/CalculatorScreen';
import { RoomDesignScreen } from './screens/RoomDesignScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { 
  Home, 
  ListTodo, 
  Palette, 
  FolderKanban, 
  Smartphone, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Globe,
  FileDown,
  HardHat,
  MessageSquare
} from 'lucide-react';
import { PdfExportModal } from './components/PdfExportModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';

type TabName = 'roadmap' | 'shopping' | 'design' | 'project';
type StackScreen = 
  | { name: 'main' }
  | { name: 'stageGuide'; stageId: number }
  | { name: 'projectSetup' }
  | { name: 'calculator' }
  | { name: 'roomDesign'; designId: string }
  | { name: 'paywall' };

export const TashteebApp: React.FC = () => {
  const { language, t, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabName>('roadmap');
  const [stackScreen, setStackScreen] = useState<StackScreen>({ name: 'main' });
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | undefined>(undefined);

  const openAiChat = (initialQuestion?: string) => {
    setChatInitialQuestion(initialQuestion);
    setIsChatOpen(true);
  };

  const isRtl = language === 'ar';

  const navigateTo = (screen: StackScreen) => {
    setStackScreen(screen);
  };

  const goBack = () => {
    setStackScreen({ name: 'main' });
  };

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-[#F7F4EF] text-[#292D32] flex flex-col font-sans antialiased select-none"
    >
      {/* Top Bar for Desktop Preview / Viewport Controls */}
      <div className="bg-[#EFE9E1] border-b border-[#E4DDD3] px-4 py-2 flex items-center justify-between text-xs text-[#73777D] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#8B5E3C]">{t('تشطيب | Tashteeb')}</span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline">{t('دليل وخريطة تشطيب الشقق وحاسبة الخامات')}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ask AI Engineer Button */}
          <button
            onClick={() => openAiChat()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#D5A66D] to-[#8B5E3C] text-white font-bold hover:brightness-105 transition shadow-xs cursor-pointer"
            title={t('استشر مهندس التشطيب الذكي (Gemini AI)')}
          >
            <HardHat size={13} />
            <span className="hidden sm:inline">{t('اسأل المهندس')}</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8B5E3C] text-white font-semibold hover:bg-[#724c30] transition shadow-xs cursor-pointer"
            title={t('تصدير تقرير PDF للمشروع والخريطة')}
          >
            <FileDown size={13} />
            <span className="hidden sm:inline">{t('تقرير PDF')}</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Language Fast Switcher */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E4DDD3] text-[#292D32] font-semibold hover:bg-[#F7F4EF] transition cursor-pointer"
          >
            <Globe size={13} className="text-[#8B5E3C]" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(v => v === 'mobile' ? 'desktop' : 'mobile')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E4DDD3] text-[#292D32] font-semibold hover:bg-[#F7F4EF] transition cursor-pointer"
          >
            {viewMode === 'mobile' ? (
              <>
                <Maximize2 size={13} className="text-[#8B5E3C]" />
                <span className="hidden sm:inline">{t('عرض كامل (شاشة كاملة)')}</span>
              </>
            ) : (
              <>
                <Smartphone size={13} className="text-[#8B5E3C]" />
                <span className="hidden sm:inline">{t('عرض الهاتف المحمول')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="flex-1 flex justify-center items-start p-0 sm:p-4 md:p-6 overflow-y-auto">
        <div 
          className={`w-full transition-all duration-300 relative flex flex-col bg-[#F7F4EF] ${
            viewMode === 'mobile'
              ? 'max-w-[420px] min-h-[820px] rounded-none sm:rounded-[44px] shadow-none sm:shadow-2xl border-0 sm:border-[8px] border-[#29231D] overflow-hidden'
              : 'max-w-4xl min-h-[800px] rounded-3xl shadow-sm border border-[#E4DDD3] p-4 sm:p-8'
          }`}
        >
          {/* Mobile Status Bar (Visible in mobile frame mode) */}
          {viewMode === 'mobile' && (
            <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-[#73777D] bg-transparent">
              <span>9:41</span>
              <div className="w-20 h-5 bg-[#29231D] rounded-full mx-auto" />
              <div className="flex items-center gap-1 font-mono">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Screen Content */}
          <div className="flex-1 px-4 py-3 overflow-y-auto">
            {stackScreen.name === 'main' && (
              <>
                {activeTab === 'roadmap' && (
                  <RoadmapScreen
                    onOpenStageGuide={(stageId) => navigateTo({ name: 'stageGuide', stageId })}
                    onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
                    onOpenAiChat={openAiChat}
                  />
                )}
                {activeTab === 'shopping' && (
                  <ShoppingScreen
                    onOpenCalculator={() => navigateTo({ name: 'calculator' })}
                    onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
                  />
                )}
                {activeTab === 'design' && (
                  <DesignScreen
                    onOpenRoomDesign={(designId) => navigateTo({ name: 'roomDesign', designId })}
                    onOpenPaywall={() => navigateTo({ name: 'paywall' })}
                    onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
                  />
                )}
                {activeTab === 'project' && (
                  <ProjectScreen
                    onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
                    onOpenCalculator={() => navigateTo({ name: 'calculator' })}
                  />
                )}
              </>
            )}

            {stackScreen.name === 'stageGuide' && (
              <StageGuideScreen
                stageId={stackScreen.stageId}
                onBack={goBack}
                onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
                onOpenAiChat={openAiChat}
              />
            )}

            {stackScreen.name === 'projectSetup' && (
              <ProjectSetupScreen onBack={goBack} />
            )}

            {stackScreen.name === 'calculator' && (
              <CalculatorScreen
                onBack={goBack}
                onOpenShopping={() => {
                  goBack();
                  setActiveTab('shopping');
                }}
                onOpenProjectSetup={() => navigateTo({ name: 'projectSetup' })}
              />
            )}

            {stackScreen.name === 'roomDesign' && (
              <RoomDesignScreen
                designId={stackScreen.designId}
                onBack={goBack}
              />
            )}

            {stackScreen.name === 'paywall' && (
              <PaywallScreen onBack={goBack} />
            )}
          </div>

          {/* Bottom Tab Bar (Visible on 'main' screen) */}
          {stackScreen.name === 'main' && (
            <div className={`w-full bg-white/95 backdrop-blur-md border-t border-[#E4DDD3] px-2 py-2 flex items-center justify-around z-40 ${
              viewMode === 'mobile' ? 'sticky bottom-0 pb-5' : 'rounded-2xl mt-4'
            }`}>
              {/* Tab 1: الخريطة */}
              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'roadmap' ? 'text-[#8B5E3C] font-bold' : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <Home size={22} className={activeTab === 'roadmap' ? 'stroke-[2.5]' : ''} />
                <span className="text-[11px] leading-tight">{t('الخريطة')}</span>
              </button>

              {/* Tab 2: المشتريات */}
              <button
                onClick={() => setActiveTab('shopping')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'shopping' ? 'text-[#8B5E3C] font-bold' : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <ListTodo size={22} className={activeTab === 'shopping' ? 'stroke-[2.5]' : ''} />
                <span className="text-[11px] leading-tight">{t('المشتريات')}</span>
              </button>

              {/* Tab 3: التصميم */}
              <button
                onClick={() => setActiveTab('design')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'design' ? 'text-[#8B5E3C] font-bold' : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <Palette size={22} className={activeTab === 'design' ? 'stroke-[2.5]' : ''} />
                <span className="text-[11px] leading-tight">{t('التصميم')}</span>
              </button>

              {/* Tab 4: المشروع */}
              <button
                onClick={() => setActiveTab('project')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
                  activeTab === 'project' ? 'text-[#8B5E3C] font-bold' : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <FolderKanban size={22} className={activeTab === 'project' ? 'stroke-[2.5]' : ''} />
                <span className="text-[11px] leading-tight">{t('المشروع')}</span>
              </button>
            </div>
          )}

          {/* iOS Bottom Indicator */}
          {viewMode === 'mobile' && (
            <div className="w-full py-1 flex justify-center bg-white">
              <div className="w-32 h-1 bg-[#29231D]/40 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Consultant Action Button */}
      <div className={`fixed z-40 transition-all ${
        isRtl ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
      } bottom-20 sm:bottom-8`}>
        <button
          onClick={() => openAiChat()}
          className="group flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-tr from-[#8B5E3C] via-[#9e6c46] to-[#D5A66D] text-white shadow-xl shadow-[#8B5E3C]/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/25"
          title={t('استشر مهندس التشطيب الذكي (Gemini AI)')}
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <HardHat size={15} className="text-white" />
          </div>
          <span className="text-xs font-bold whitespace-nowrap">
            {language === 'ar' ? 'استشر المهندس الذكي' : 'Chat with AI Engineer'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        </button>
      </div>

      {/* PDF Export Modal */}
      {isPdfModalOpen && (
        <PdfExportModal onClose={() => setIsPdfModalOpen(false)} />
      )}

      {/* Gemini Chatbot Modal */}
      {isChatOpen && (
        <GeminiChatbotModal
          initialQuestion={chatInitialQuestion}
          onClose={() => {
            setIsChatOpen(false);
            setChatInitialQuestion(undefined);
          }}
        />
      )}
    </div>
  );
};
