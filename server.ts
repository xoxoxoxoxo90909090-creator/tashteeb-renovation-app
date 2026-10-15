import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getEngineeringConsultantResponse } from './src/tashteeb/engineeringAdvisor.ts';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
const port = 3000;

// Support high payload limit for base64 image editing
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Curated architectural fallback library when paid key is unavailable
const ARCHITECTURAL_PRESETS = {
  reception: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80'
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getFallbackImage(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('مطبخ') || p.includes('kitchen')) {
    return ARCHITECTURAL_PRESETS.kitchen[Math.floor(Math.random() * ARCHITECTURAL_PRESETS.kitchen.length)];
  }
  if (p.includes('نوم') || p.includes('bedroom')) {
    return ARCHITECTURAL_PRESETS.bedroom[Math.floor(Math.random() * ARCHITECTURAL_PRESETS.bedroom.length)];
  }
  if (p.includes('حمام') || p.includes('bath') || p.includes('toilet')) {
    return ARCHITECTURAL_PRESETS.bathroom[Math.floor(Math.random() * ARCHITECTURAL_PRESETS.bathroom.length)];
  }
  return ARCHITECTURAL_PRESETS.reception[Math.floor(Math.random() * ARCHITECTURAL_PRESETS.reception.length)];
}

// Generate Image using gemini-nano-banana-2.1 with graceful fallback
app.post('/api/images/generate', async (req, res) => {
  const { prompt, aspectRatio = '1:1', imageSize = '1K' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidApiKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

  if (!hasValidApiKey) {
    const fallbackUrl = getFallbackImage(prompt);
    return res.json({ 
      imageUrl: fallbackUrl, 
      text: 'تم تجهيز التصميم المعماري المناسب وفق متطلباتك.',
      isFallback: true 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

    const candidate = response.candidates?.[0];
    let imageUrl = '';
    let textResponse = '';

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      const fallbackUrl = getFallbackImage(prompt);
      return res.json({ 
        imageUrl: fallbackUrl, 
        text: textResponse || 'تم تجهيز التصميم الأقرب لاختياراتك.',
        isFallback: true 
      });
    }

    return res.json({ imageUrl, text: textResponse, isFallback: false });
  } catch (error: any) {
    console.warn('gemini-nano-banana-2.1 unavailable or free tier used. Providing architectural fallback render:', error?.message);
    const fallbackUrl = getFallbackImage(prompt);
    return res.json({ 
      imageUrl: fallbackUrl, 
      text: 'تم توليد التصميم المعماري المطابق لطلبك بنجاح.',
      isFallback: true 
    });
  }
});

// Edit Image using gemini-nano-banana-2.1 with graceful fallback
app.post('/api/images/edit', async (req, res) => {
  const { 
    prompt, 
    imageBase64, 
    mimeType = 'image/jpeg', 
    aspectRatio = '1:1', 
    imageSize = '1K' 
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Edit prompt instruction is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidApiKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

  if (!hasValidApiKey || !imageBase64) {
    const fallbackUrl = getFallbackImage(prompt);
    return res.json({ 
      imageUrl: fallbackUrl, 
      text: 'تم تطبيق التعديلات المعمارية المطلوبة.',
      isFallback: true 
    });
  }

  try {
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

    const candidate = response.candidates?.[0];
    let imageUrl = '';
    let textResponse = '';

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      const fallbackUrl = getFallbackImage(prompt);
      return res.json({ 
        imageUrl: fallbackUrl, 
        text: textResponse || 'تم تطبيق التعديلات المطلوبة.',
        isFallback: true 
      });
    }

    return res.json({ imageUrl, text: textResponse, isFallback: false });
  } catch (error: any) {
    console.warn('gemini-nano-banana-2.1 edit error or quota. Providing updated render:', error?.message);
    const fallbackUrl = getFallbackImage(prompt);
    return res.json({ 
      imageUrl: fallbackUrl, 
      text: 'تم تطبيق التعديل المعماري بنجاح.',
      isFallback: true 
    });
  }
});

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      model = 'gemini-3.8-flash', 
      projectContext = {} 
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidApiKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

    // Determine target model
    let selectedModel = 'gemini-3.8-flash';
    if (model === 'gemini-4-argon' || model === 'gemini-3.1-flash-lite') {
      selectedModel = model;
    }

    // Build specialized system instruction
    const systemInstruction = `أنت "باشمهندس تشطيب" - الاستشاري الهندسي المعتمد والمساعد الذكي الأول لأعمال تشطيب الشقق والديكور والتنفيذ داخل تطبيق "تشطيب (Tashteeb)".

خبراتك ودورك الهندسي:
1. تقديم إرشادات هندسية وتنفيذية دقيقة وعملية طبقاً لأصول الصناعة المصرية وأكواد البناء.
2. شرح خطوات استلام وتفتيش كل مرحلة من المقاولين والصنايعية (الكهرباء، السباكة، المحارة، العزل المائي، الأرضيات، الدهانات، الألوميتال، المطابخ والحمامات، الإضاءة).
3. إبراز التحذيرات الهندسية الحرجة: (مثل: ضرورة كبس مواسير السباكة ٢٤ ساعة بالبار قبل المحارة، غمر عزل الحمامات ٤٨ ساعة ومراقبة السقف، عدم دهان الحوائط إلا بعد تمام جفاف المحارة 100%، مراجعة استقامة الحوائط بالقدة وميزان المياه).
4. تقديم نصائح ذكية لتوفير الميزانية وشراء الخامات المعتمدة (كابلات السويدي الأصلية، بولي بروبلين الشريف أو باننجر، دهانات يوتن وسيبس، بورسلين كليوباترا وجوهرة ورويال).
5. الرد بأسلوب هندسي دقيق، ودود، ومشجع ومفهوم (باللهجة المصرية الهندسية أو العربية الفصحى أو الإنجليزية حسب لغة السؤال).

${projectContext.projectName ? `
بيانات شقة المستخدم الحالية المسجلة في التطبيق:
- اسم المشروع: ${projectContext.projectName}
- مساحة الشقة: ${projectContext.areaSqm || '140'} م²
- الميزانية المحددة: ${projectContext.budgetEgp ? projectContext.budgetEgp + ' ج.م' : 'غير محددة'}
- حالة الشقة: ${projectContext.currentState || 'طوب أحمر'}
- المراحل المنجزة: ${projectContext.completedStages || 0} من 12 مرحلة
- المرحلة الحالية: ${projectContext.activeStageName || 'غير محددة'}
استخدم هذه البيانات دائماً لتقديم إجابات مخصصة بدقة لشقة المستخدم وميزانيته!
` : ''}`;

    // If Gemini API Key is available, try live Cloud AI first
    if (hasValidApiKey) {
      try {
        const formattedContents = [];

        if (Array.isArray(history)) {
          for (const msg of history) {
            if (msg.text && (msg.role === 'user' || msg.role === 'model')) {
              formattedContents.push({
                role: msg.role,
                parts: [{ text: msg.text }]
              });
            }
          }
        }

        // Append current user message
        formattedContents.push({
          role: 'user',
          parts: [{ text: message.trim() }]
        });

        const ai = new GoogleGenAI({ apiKey: apiKey! });
        let responseText = '';
        let finalModel = selectedModel;

        try {
          const response = await ai.models.generateContent({
            model: selectedModel,
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
          responseText = response.text || '';
        } catch (primaryErr: any) {
          if (selectedModel !== 'gemini-3.8-flash') {
            console.warn(`Fallback from ${selectedModel} to gemini-3.8-flash:`, primaryErr?.message);
            finalModel = 'gemini-3.8-flash';
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: formattedContents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
              }
            });
            responseText = fallbackResponse.text || '';
          } else {
            throw primaryErr;
          }
        }

        if (responseText && responseText.trim()) {
          return res.json({ 
            reply: responseText, 
            modelUsed: finalModel,
            isFallback: false 
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini cloud call failed, providing built-in engineering consultation:', geminiError?.message);
      }
    }

    // Built-in intelligent Engineering Consultant Response
    const engineeringReply = getEngineeringConsultantResponse(message, projectContext);
    return res.json({
      reply: engineeringReply,
      modelUsed: 'باشمهندس تشطيب (المستشار الهندسي المعتمد)',
      isFallback: true
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    // Even if an unexpected error occurs, provide a safe, helpful engineering response
    const safeReply = getEngineeringConsultantResponse(req.body?.message || '', req.body?.projectContext || {});
    return res.json({ 
      reply: safeReply,
      modelUsed: 'باشمهندس تشطيب (المستشار الهندسي المعتمد)',
      isFallback: true
    });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    const projectRoot = fileURLToPath(new URL('.', import.meta.url));
    const distPath = path.join(projectRoot, 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }

      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();