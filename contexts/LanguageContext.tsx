// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

type Locale = 'zh' | 'it';

const translations = {
  zh: {
    title: 'Anima Bella 后台管理',
    dashboard: '控制台',
    walkIn: '＋ 散客记账',
    switchLang: '🇮🇹 Italiano',
    todayTurnover: '今日总营业额',
    todayNet: '店铺实收净入账',
    todayCommissions: '员工提成支出',
    pendingOrders: '待确认预约',
    confirmOrder: '接单确认',
    completeOrder: '结账 & 算提成',
    staff: '服务员工',
    price: '成交价格 (€)',
    commission: '提成比例',
    noOrders: '暂无预约记录',
    clientName: '客户姓名',
    phone: '联系电话',
    time: '预约时间',
    service: '做项目',
    source: '来源',
    online: '线上预约',
    walkInSource: '线下散客',
  },
  it: {
    title: 'Anima Bella Gestione',
    dashboard: 'Dashboard',
    walkIn: '＋ Nuovo Walk-in',
    switchLang: '🇨🇳 中文',
    todayTurnover: 'Fatturato Oggi',
    todayNet: 'Netto Negozio',
    todayCommissions: 'Provvigioni',
    pendingOrders: 'Da Confermare',
    confirmOrder: 'Conferma',
    completeOrder: 'Salda e Chiudi',
    staff: 'Operatore',
    price: 'Prezzo Finale (€)',
    commission: 'Provvigione',
    noOrders: 'Nessun appuntamento',
    clientName: 'Cliente',
    phone: 'Telefono',
    time: 'Orario',
    service: 'Servizio',
    source: 'Origine',
    online: 'Online',
    walkInSource: 'Walk-in',
  }
};

const LanguageContext = createContext<{
  locale: Locale;
  toggleLocale: () => void;
  t: typeof translations['zh'];
} | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('zh');
  
  const toggleLocale = () => {
    setLocale(prev => prev === 'zh' ? 'it' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTrans = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTrans must be used within LanguageProvider');
  return context;
};

