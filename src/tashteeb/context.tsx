import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ApartmentProject, 
  AppLanguage, 
  CalculatorCategory, 
  ShoppingItem 
} from './types';
import { 
  INITIAL_SAMPLE_PROJECT, 
  INITIAL_SAMPLE_SHOPPING, 
  PRICES, 
  TRANSLATIONS_EN 
} from './data';

// --- Language Context ---
interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (text: string) => string;
  arabicNumber: (val: number | string) => string;
  money: (val: number | string) => string;
  impactLabel: (val: number) => string;
  currentStateLabel: (val: string) => string;
  budgetLabel: (val: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const toArabicDigits = (text: string | number): string => {
  return String(text).replace(/[0-9]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.charAt(Number(digit)));
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('tashteeb-language') as AppLanguage) || 'ar';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('tashteeb-language', lang);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  const t = (value: string): string => {
    if (typeof value !== 'string' || language !== 'en') return value;
    if (Object.prototype.hasOwnProperty.call(TRANSLATIONS_EN, value)) {
      return TRANSLATIONS_EN[value];
    }
    let result = value;
    Object.keys(TRANSLATIONS_EN)
      .sort((a, b) => b.length - a.length)
      .forEach((key) => {
        if (key && result.indexOf(key) !== -1) {
          result = result.split(key).join(TRANSLATIONS_EN[key]);
        }
      });
    return result;
  };

  const arabicNumber = (value: number | string): string => {
    const rounded = Math.round(Number(value || 0));
    const grouped = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, language === 'en' ? ',' : '٬');
    const digits = language === 'en' ? grouped : toArabicDigits(grouped);
    return (rounded < 0 ? '-' : '') + digits;
  };

  const money = (value: number | string): string => {
    return arabicNumber(value) + (language === 'en' ? ' EGP' : ' ج.م');
  };

  const impactLabel = (value: number): string => {
    if (value > 0) return t('إضافة ') + money(value);
    if (value < 0) return t('توفير ') + money(Math.abs(value));
    return t('بدون فرق');
  };

  const currentStateLabel = (value: string): string => {
    const labels: Record<string, string> = {
      red_brick: 'طوب أحمر',
      plastered: 'محارة',
      semi_finished: 'نصف تشطيب',
      finished_renovation: 'تشطيب قائم / تجديد'
    };
    return t(labels[value] || 'غير محددة');
  };

  const budgetLabel = (value: string): string => {
    const labels: Record<string, string> = {
      economic: 'اقتصادي',
      standard: 'قياسي',
      premium: 'فاخر'
    };
    return t(labels[value] || 'قياسي');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, arabicNumber, money, impactLabel, currentStateLabel, budgetLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

// --- Project & Shopping Context ---
interface ProjectContextType {
  project: ApartmentProject | null;
  setProject: (proj: ApartmentProject | null) => void;
  updateProjectFields: (fields: Partial<ApartmentProject>) => void;
  updateProjectData: (patch: Partial<ApartmentProject['project_data']>) => void;
  shoppingItems: ShoppingItem[];
  setShoppingItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  togglePurchased: (id: string) => void;
  upsertShoppingItem: (item: { name: string; qty: number; unit: string; price: number; note: string }, stageName: string) => void;
  addCategoryToShopping: (category: CalculatorCategory) => void;
  addAllCategoriesToShopping: (categories: CalculatorCategory[]) => void;
  preferences: { inspectionReminders: boolean };
  setPreferences: React.Dispatch<React.SetStateAction<{ inspectionReminders: boolean }>>;
  buildCategories: (wastePct: number) => Record<string, CalculatorCategory>;
  resetToSampleData: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProjectState] = useState<ApartmentProject | null>(() => {
    const saved = localStorage.getItem('tashteeb-project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SAMPLE_PROJECT;
      }
    }
    return INITIAL_SAMPLE_PROJECT;
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('tashteeb-shopping');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SAMPLE_SHOPPING;
      }
    }
    return INITIAL_SAMPLE_SHOPPING;
  });

  const [preferences, setPreferences] = useState<{ inspectionReminders: boolean }>(() => {
    const saved = localStorage.getItem('tashteeb-preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { inspectionReminders: true };
      }
    }
    return { inspectionReminders: true };
  });

  useEffect(() => {
    if (project) {
      localStorage.setItem('tashteeb-project', JSON.stringify(project));
    } else {
      localStorage.removeItem('tashteeb-project');
    }
  }, [project]);

  useEffect(() => {
    localStorage.setItem('tashteeb-shopping', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem('tashteeb-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setProject = (proj: ApartmentProject | null) => {
    setProjectState(proj);
  };

  const updateProjectFields = (fields: Partial<ApartmentProject>) => {
    setProjectState(prev => prev ? { ...prev, ...fields } : null);
  };

  const updateProjectData = (patch: Partial<ApartmentProject['project_data']>) => {
    setProjectState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        project_data: {
          ...prev.project_data,
          ...patch
        }
      };
    });
  };

  const togglePurchased = (id: string) => {
    setShoppingItems(prev =>
      prev.map(item => item.id === id ? { ...item, is_purchased: !item.is_purchased } : item)
    );
  };

  const upsertShoppingItem = (item: { name: string; qty: number; unit: string; price: number; note: string }, stageName: string) => {
    if (!project) return;
    const cost = Math.round(item.qty * item.price);
    setShoppingItems(prev => {
      const existingIdx = prev.findIndex(r => r.project_id === project.id && r.item_name === item.name);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: item.qty,
          unit: item.unit,
          unit_price_egp: item.price,
          estimated_cost_egp: cost,
          calculation_note: item.note,
          stage_name: stageName
        };
        return updated;
      }
      const newItem: ShoppingItem = {
        id: `shop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        project_id: project.id,
        stage_name: stageName,
        item_name: item.name,
        quantity: item.qty,
        unit: item.unit,
        unit_price_egp: item.price,
        estimated_cost_egp: cost,
        calculation_note: item.note,
        is_purchased: false
      };
      return [...prev, newItem];
    });
  };

  const addCategoryToShopping = (category: CalculatorCategory) => {
    category.items.forEach(item => {
      upsertShoppingItem(item, category.stage);
    });
  };

  const addAllCategoriesToShopping = (categories: CalculatorCategory[]) => {
    categories.forEach(cat => {
      cat.items.forEach(item => {
        upsertShoppingItem(item, cat.stage);
      });
    });
  };

  const buildCategories = (wastePct: number): Record<string, CalculatorCategory> => {
    const area = Number(project?.area_sqm) || 120;
    const bedrooms = Number(project?.bedroom_count) || 3;
    const bathrooms = Number(project?.bathroom_count) || 2;
    const livings = Number(project?.living_count) || 1;
    const kitchens = Number(project?.kitchen_count) || 1;
    const balconies = Number(project?.balcony_count) || 1;

    const floorArea = Math.max(area - bathrooms * 5, 0);
    const floorQty = Math.ceil(floorArea * (1 + wastePct / 100));
    const paintable = Math.round(area * 3);
    const liters = Math.ceil((paintable * 2) / 10);
    const elecPoints = bedrooms * 8 + livings * 12 + kitchens * 10 + bathrooms * 4 + balconies * 2;
    const plumbPoints = bathrooms * 6 + kitchens * 4 + balconies + 1;
    const waterproofArea = bathrooms * 12 + kitchens * 6 + balconies * 6;

    return {
      floors: {
        title: 'الأرضيات',
        stage: 'الأرضيات',
        mainQty: floorQty,
        mainUnit: 'م²',
        mainLabel: 'الكمية المطلوبة بعد إضافة الهالك',
        assumption: `نستبعد ٥ م² لكل حمام (سيراميك منفصل). الهالك ${toArabicDigits(wastePct)}٪.`,
        items: [
          { name: 'بلاط أرضيات بورسلين', qty: floorQty, unit: 'م²', price: PRICES.porcelain, note: `مساحة الأرضيات + ${toArabicDigits(wastePct)}٪ هالك` },
          { name: 'لاصق وروبة', qty: floorQty, unit: 'م²', price: PRICES.tileAdhesive, note: 'حسب مساحة التركيب' },
          { name: 'مصنعية تركيب الأرضيات', qty: floorQty, unit: 'م²', price: PRICES.tileLabor, note: 'سعر تقديري للمتر' }
        ]
      },
      paint: {
        title: 'دهانات',
        stage: 'الدهانات',
        mainQty: liters,
        mainUnit: 'لتر',
        mainLabel: 'كمية الدهان التقريبية (وجهان)',
        assumption: 'نفترض مساحة حوائط وأسقف ≈ ٣ أضعاف مساحة الشقة، وتغطية ١٠ م² لكل لتر.',
        items: [
          { name: 'دهان داخلي قابل للغسيل', qty: liters, unit: 'لتر', price: PRICES.paintLiter, note: `وجهان على ${toArabicDigits(paintable)} م²` },
          { name: 'معجون وسيلر', qty: paintable, unit: 'م²', price: PRICES.putty, note: 'تجهيز الأسطح' },
          { name: 'مصنعية الدهانات', qty: paintable, unit: 'م²', price: PRICES.paintLabor, note: 'سعر تقديري للمتر' }
        ]
      },
      electrical: {
        title: 'كهرباء',
        stage: 'الكهرباء',
        mainQty: elecPoints,
        mainUnit: 'نقطة',
        mainLabel: 'عدد نقاط الكهرباء المقدّر',
        assumption: 'تقدير النقاط: ٨ لكل غرفة نوم، ١٢ للريسبشن، ١٠ للمطبخ، ٤ لكل حمام، ٢ لكل بلكونة.',
        items: [
          { name: 'كابلات كهرباء معتمدة', qty: elecPoints * 12, unit: 'متر', price: PRICES.cableMeter, note: 'تقدير ١٢ مترًا لكل نقطة' },
          { name: 'مواسير كهرباء', qty: elecPoints * 8, unit: 'متر', price: PRICES.conduitMeter, note: 'تقدير ٨ أمتار لكل نقطة' },
          { name: 'علب كهرباء', qty: elecPoints, unit: 'قطعة', price: PRICES.electricBox, note: 'علبة لكل نقطة' },
          { name: 'مصنعية تأسيس الكهرباء', qty: elecPoints, unit: 'نقطة', price: PRICES.electricLabor, note: 'سعر تقديري للنقطة' }
        ]
      },
      plumbing: {
        title: 'سباكة',
        stage: 'السباكة',
        mainQty: plumbPoints,
        mainUnit: 'نقطة',
        mainLabel: 'عدد نقاط السباكة المقدّر',
        assumption: 'تقدير النقاط: ٦ لكل حمام، ٤ للمطبخ، ١ لكل بلكونة، ١ للغسالة.',
        items: [
          { name: 'مواسير وقطع سباكة', qty: plumbPoints, unit: 'نقطة', price: PRICES.plumbingPoint, note: 'خامات النقطة الواحدة' },
          { name: 'مصنعية تأسيس السباكة', qty: plumbPoints, unit: 'نقطة', price: PRICES.plumbingLabor, note: 'سعر تقديري للنقطة' },
          { name: 'عزل مائي للحمامات والمطبخ', qty: waterproofArea, unit: 'م²', price: PRICES.waterproofM2, note: 'أرضيات ومسافة رفع على الحوائط' }
        ]
      }
    };
  };

  const resetToSampleData = () => {
    setProjectState(INITIAL_SAMPLE_PROJECT);
    setShoppingItems(INITIAL_SAMPLE_SHOPPING);
  };

  return (
    <ProjectContext.Provider value={{
      project,
      setProject,
      updateProjectFields,
      updateProjectData,
      shoppingItems,
      setShoppingItems,
      togglePurchased,
      upsertShoppingItem,
      addCategoryToShopping,
      addAllCategoriesToShopping,
      preferences,
      setPreferences,
      buildCategories,
      resetToSampleData
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};

// --- In-App Purchase (IAP) Context ---
interface IAPContextType {
  isUnlocked: boolean;
  setIsUnlocked: (val: boolean) => void;
  purchasePackage: (pkgTitle: string) => Promise<{ success: boolean; cancelled?: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; restoredCount: number }>;
}

const IAPContext = createContext<IAPContextType | null>(null);

export const IAPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('tashteeb-unlocked') === 'true';
  });

  const purchasePackage = async (pkgTitle: string) => {
    setIsUnlocked(true);
    localStorage.setItem('tashteeb-unlocked', 'true');
    return { success: true };
  };

  const restorePurchases = async () => {
    setIsUnlocked(true);
    localStorage.setItem('tashteeb-unlocked', 'true');
    return { success: true, restoredCount: 1 };
  };

  return (
    <IAPContext.Provider value={{ isUnlocked, setIsUnlocked, purchasePackage, restorePurchases }}>
      {children}
    </IAPContext.Provider>
  );
};

export const useIap = () => {
  const ctx = useContext(IAPContext);
  if (!ctx) throw new Error('useIap must be used within IAPProvider');
  return ctx;
};
