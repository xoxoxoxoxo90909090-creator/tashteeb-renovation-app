import React, { useState, useEffect, useRef } from 'react';
import { useLanguage, useProject } from '../context';
import { STAGES } from '../data';
import { getEngineeringConsultantResponse } from '../engineeringAdvisor';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  HardHat, 
  ShieldCheck, 
  Zap, 
  BrainCircuit, 
  Info,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotModalProps {
  onClose: () => void;
  initialQuestion?: string;
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({ 
  onClose,
  initialQuestion
}) => {
  const { language, t, arabicNumber, currentStateLabel } = useLanguage();
  const { project, shoppingItems } = useProject();
  const isRtl = language === 'ar';

  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeStage = project ? STAGES[Math.min(project.project_data.completed_stages || 0, STAGES.length - 1)] : null;

  // Initialize messages with persistent storage or welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('tashteeb-gemini-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Automatically purge any previous GEMINI_API_KEY error messages
          const clean = parsed.filter(m => !m.text?.includes('GEMINI_API_KEY'));
          if (clean.length > 0) return clean;
        }
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: language === 'ar'
          ? `أهلاً بك! أنا "باشمهندس تشطيب" 👷‍♂️، مستشارك الهندسي الذكي المتخصص في أعمال تشطيب الشقق والديكور والتنفيذ.\n\nأنا هنا لمساعدتك في استلام بنود التشطيب من المقاولين والصنايعية، مراجعة الأسعار والخامات (كهرباء، سباكة، محارة، عزل، بورسلين، دهانات)، وضمان أعلى جودة بدون هدر في الميزانية.\n\nكيف يمكنني مساعدتك في شقتك اليوم؟`
          : `Hello! I am your AI Renovation Consultant Engineer 👷‍♂️. I am here to guide you through Egyptian apartment finishing stages, technical inspections (electrical, plumbing, plastering, waterproofing, flooring, painting), and budget optimization.\n\nHow can I help with your project today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Save conversation history to local storage
  useEffect(() => {
    localStorage.setItem('tashteeb-gemini-chat', JSON.stringify(messages));
  }, [messages]);

  // Handle initial question if provided
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSendMessage(initialQuestion);
    }
  }, []);

  const quickPromptChips = [
    { label: 'استلام المحارة والزوايا', prompt: 'إيه هي خطوات استلام أعمال المحارة من الصنايعي؟ وإزاي أتأكد إن الحوائط مستقيمة تماماً والزوايا قايمة 90 درجة؟' },
    { label: 'اختبار عزل الحمامات', prompt: 'إزاي أختبر العزل المائي للحمام والمطبخ بطريقة الغمر 48 ساعة؟ وما هي العلامات اللي تدل على وجود تسريب؟' },
    { label: 'أسلاك السويدي المعتمدة', prompt: 'إزاي أتأكد إن كابلات وأسلاك السويدي أصلية ومعتمدة؟ وما هي القطاعات المناسبة للبرايز والإنارة والتكييف؟' },
    { label: 'توفير ميزانية البورسلين', prompt: 'إزاي أشتري بورسلين وسيراميك ممتاز لشقتي وأوفر في الميزانية؟ وما هي نسبة الهالك المناسبة للتركيب؟' }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Build project context payload
    const projectContext = project ? {
      projectName: project.project_name,
      areaSqm: project.area_sqm,
      budgetEgp: project.budget_egp,
      currentState: currentStateLabel(project.current_state),
      completedStages: project.project_data.completed_stages || 0,
      activeStageName: activeStage?.title
    } : {};

    try {

      // Prepare history excluding the newest message
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          model: selectedModel,
          projectContext
        })
      });

      const data = await response.json();
      const replyText = data.reply || getEngineeringConsultantResponse(text, projectContext);

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || 'باشمهندس تشطيب (المستشار الهندسي المعتمد)'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Client-side chat connection issue, using offline engineering advisor:', err);
      const offlineReply = getEngineeringConsultantResponse(text, projectContext);
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: offlineReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'باشمهندس تشطيب (المستشار الهندسي المعتمد)'
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem('tashteeb-gemini-chat');
    setMessages([
      {
        id: 'welcome_new',
        role: 'model',
        text: language === 'ar'
          ? 'تم بدء محادثة استشارية جديدة! اسألني عن أي مرحلة أو بند أو خامة في تشطيب شقتك.'
          : 'Started a fresh consultation session! Ask me about any finishing stage, material, or inspection step.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div 
        dir={isRtl ? 'rtl' : 'ltr'}
        className="bg-[#F7F4EF] rounded-3xl w-full max-w-3xl h-[92vh] max-h-[850px] flex flex-col border border-[#E4DDD3] shadow-2xl overflow-hidden"
      >
        {/* Chatbot Header */}
        <div className="px-5 py-3.5 bg-white border-b border-[#E4DDD3] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5E3C] to-[#D5A66D] text-white flex items-center justify-center shadow-md">
              <HardHat size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#292D32]">
                  {t('استشاري التشطيب الذكي')}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini AI</span>
                </span>
              </div>
              <p className="text-[11px] text-[#73777D]">
                {t('استشارات معمارية وتنفيذية ومراجعة بنود المقاولين')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              title={t('بدء محادثة جديدة')}
              className="p-2 text-[#73777D] hover:text-red-700 hover:bg-[#EFE9E1] rounded-xl transition cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#73777D] hover:text-[#292D32] hover:bg-[#EFE9E1] rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Model Selection Toolbar & Project Context Pill */}
        <div className="bg-[#EFE9E1] px-4 py-2 border-b border-[#E4DDD3] flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#73777D] hidden sm:inline">
              {t('النموذج:')}
            </span>
            <div className="flex bg-white p-0.5 rounded-xl border border-[#E4DDD3] text-[11px]">
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#8B5E3C] text-white shadow-xs'
                    : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <Zap size={11} />
                <span>{t('سريع (Flash Lite)')}</span>
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#8B5E3C] text-white shadow-xs'
                    : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <Sparkles size={11} />
                <span>{t('متوازن (Flash 3.8)')}</span>
              </button>
              <button
                onClick={() => setSelectedModel('gemini-4-argon')}
                className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedModel === 'gemini-4-argon'
                    ? 'bg-[#8B5E3C] text-white shadow-xs'
                    : 'text-[#73777D] hover:text-[#292D32]'
                }`}
              >
                <BrainCircuit size={11} />
                <span>{t('متقدم (Argon 4)')}</span>
              </button>
            </div>
          </div>

          {/* Project Context Badge */}
          {project && (
            <div className="text-[11px] font-semibold text-[#8B5E3C] flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-lg border border-[#E4DDD3]">
              <ShieldCheck size={13} />
              <span>
                {t(project.project_name)} ({arabicNumber(project.area_sqm)} {t('م²')})
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F7F4EF]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${isUser ? 'mr-auto flex-row-reverse text-left' : 'ml-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                  isUser ? 'bg-[#8B5E3C] text-white' : 'bg-[#D5A66D] text-[#29231D]'
                }`}>
                  {isUser ? <User size={16} /> : <HardHat size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-3xl space-y-1.5 shadow-sm text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-[#8B5E3C] text-white rounded-tr-xs' 
                    : 'bg-white text-[#292D32] border border-[#E4DDD3] rounded-tl-xs'
                }`}>
                  <div className="flex items-center justify-between gap-4 pb-1 border-b border-inherit/20 text-[10px] opacity-80">
                    <span className="font-bold">
                      {isUser ? t('أنت') : t('باشمهندس تشطيب')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {msg.modelUsed && !isUser && (
                        <span className="font-mono bg-[#EFE9E1] text-[#8B5E3C] px-1.5 py-0.2 rounded text-[9px]">
                          {msg.modelUsed.replace('gemini-', '')}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Body Text with Clean Paragraphs */}
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Copy Button */}
                  {!isUser && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => copyText(msg.text, msg.id)}
                        className="text-[10px] text-[#73777D] hover:text-[#8B5E3C] flex items-center gap-1 px-2 py-0.5 rounded hover:bg-[#EFE9E1] transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-700" />
                            <span className="text-emerald-800">{t('تم النسخ')}</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>{t('نسخ الإجابة')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] ml-auto">
              <div className="w-8 h-8 rounded-xl bg-[#D5A66D] text-[#29231D] flex items-center justify-center shrink-0 shadow-xs">
                <HardHat size={16} />
              </div>
              <div className="bg-white border border-[#E4DDD3] p-4 rounded-3xl rounded-tl-xs shadow-sm flex items-center gap-2 text-xs text-[#73777D]">
                <RefreshCw size={14} className="animate-spin text-[#8B5E3C]" />
                <span>{t('الباشمهندس يكتب الرد الهندسي...')}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-white px-4 py-2 border-t border-[#E4DDD3] overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-[#73777D] shrink-0">
            {t('أسئلة شائعة:')}
          </span>
          {quickPromptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              disabled={isLoading}
              className="text-[11px] px-3 py-1 rounded-xl bg-[#F7F4EF] hover:bg-[#EFE9E1] border border-[#E4DDD3] text-[#8B5E3C] font-semibold whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            >
              {t(chip.label)}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E4DDD3] flex items-center gap-2">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              language === 'ar'
                ? 'اسأل المهندس عن أي خطوة، خامة، أو طريقة استلام... (اضغط Enter للإرسال)'
                : 'Ask the engineer about any finishing step, material, or inspection... (Press Enter)'
            }
            className="flex-1 p-3 bg-[#F7F4EF] border border-[#E4DDD3] rounded-2xl text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#D5A66D] resize-none leading-relaxed"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="w-11 h-11 rounded-2xl bg-[#8B5E3C] hover:bg-[#724c30] disabled:opacity-40 text-white flex items-center justify-center transition shadow-sm cursor-pointer shrink-0"
          >
            <Send size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};
